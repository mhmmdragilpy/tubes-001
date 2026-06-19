import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');
    const penilaiId = userIdCookie ? parseInt(userIdCookie.value) : null;

    if (!penilaiId) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const { dinilaiId, periodeId } = await request.json();

    if (!dinilaiId || !periodeId) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Check if penilaian already exists
    let penilaian = await prisma.penilaian.findFirst({
      where: {
        penilai_id: penilaiId,
        dinilai_id: dinilaiId,
        periode_id: periodeId,
        tipe_relasi: 'bawahan'
      }
    });

    if (!penilaian) {
      // Create new
      penilaian = await prisma.penilaian.create({
        data: {
          penilai_id: penilaiId,
          dinilai_id: dinilaiId,
          periode_id: periodeId,
          tipe_relasi: 'bawahan',
          status: 'belum',
          approval_status: 'disetujui' // directly approved since it's from atasan
        }
      });
    }

    return NextResponse.json({ success: true, penilaianId: penilaian.id });
  } catch (error) {
    console.error('Start Penilaian Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
