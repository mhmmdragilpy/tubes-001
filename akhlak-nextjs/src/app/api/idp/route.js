import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;

    // Get user role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    let idps = [];

    if (user.role === 'karyawan') {
      // Get own IDPs
      idps = await prisma.idp.findMany({
        where: { user_id: userId },
        include: { periode: true },
        orderBy: { created_at: 'desc' }
      });
    } else if (user.role === 'atasan') {
      // Get IDPs of subordinates
      idps = await prisma.idp.findMany({
        where: { user: { atasan_id: userId } },
        include: { periode: true, user: true },
        orderBy: { created_at: 'desc' }
      });
    } else {
      // Management or Admin can view all
      idps = await prisma.idp.findMany({
        include: { periode: true, user: true },
        orderBy: { created_at: 'desc' }
      });
    }

    return NextResponse.json({ success: true, data: idps });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;

    const body = await request.json();
    const { periode_id, area_pengembangan, target_akhir, rencana_aksi, timeline } = body;

    if (!periode_id || !area_pengembangan || !target_akhir || !rencana_aksi || !timeline) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newIdp = await prisma.idp.create({
      data: {
        user_id: userId,
        periode_id: parseInt(periode_id),
        area_pengembangan,
        target_akhir,
        rencana_aksi,
        timeline,
        status: 'belum_mulai'
      }
    });

    return NextResponse.json({ success: true, data: newIdp });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
