import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
    const userId = payload.userId;

    const notifications = await prisma.notifikasi.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notifikasi.count({
      where: { user_id: userId, is_read: false }
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ notifications: [], unreadCount: 0, error: error.message });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'mark_read') {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('token');
      if (!tokenCookie) return NextResponse.json({ success: false });

      const payload = await verifyToken(tokenCookie.value);
      if (!payload) return NextResponse.json({ success: false });
      const userId = payload.userId;

      await prisma.notifikasi.updateMany({
        where: { user_id: userId, is_read: false },
        data: { is_read: true }
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === 'send_reminder') {
      const { targetUserIds, judul, pesan, link } = body;
      const data = targetUserIds.map(uid => ({
        user_id: uid,
        judul,
        pesan,
        link: link || null
      }));

      await prisma.notifikasi.createMany({ data });
      return NextResponse.json({ success: true, count: data.length });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
