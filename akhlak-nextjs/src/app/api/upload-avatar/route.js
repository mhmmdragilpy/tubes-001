import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const formData = await request.formData();
    const file = formData.get('avatar');

    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename based on user ID and timestamp
    const ext = file.name.split('.').pop() || 'png';
    const filename = `avatar_${userId}_${Date.now()}.${ext}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filepath, buffer);

    const avatarUrl = `/uploads/profiles/${filename}`;

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl }
    });

    return NextResponse.json({ success: true, avatar_url: avatarUrl, message: 'Foto profil berhasil diunggah' });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan saat mengunggah' }, { status: 500 });
  }
}
