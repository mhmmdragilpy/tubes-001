import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const idpId = parseInt(params.id);
    
    if (!idpId) {
      return NextResponse.json({ success: false, message: 'Invalid IDP ID' }, { status: 400 });
    }

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

    // Verify user is atasan or admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'atasan' && user.role !== 'admin_hr' && user.role !== 'manajemen')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['belum_mulai', 'sedang_berjalan', 'selesai'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    // Verify IDP belongs to subordinate if role is atasan
    if (user.role === 'atasan') {
      const idp = await prisma.idp.findUnique({
        where: { id: idpId },
        include: { user: true }
      });
      
      if (!idp || idp.user.atasan_id !== userId) {
        return NextResponse.json({ success: false, message: 'IDP not found or not your subordinate' }, { status: 404 });
      }
    }

    const updatedIdp = await prisma.idp.update({
      where: { id: idpId },
      data: { status }
    });

    return NextResponse.json({ success: true, data: updatedIdp });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
