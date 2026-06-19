"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approvePeer(penilaianId) {
  try {
    await prisma.penilaian.update({
      where: { id: parseInt(penilaianId) },
      data: { approval_status: 'disetujui' }
    });
    revalidatePath('/atasan/approval');
    revalidatePath('/atasan/dashboard');
    return { success: true, message: 'Peer berhasil disetujui!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function rejectPeer(penilaianId) {
  try {
    await prisma.penilaian.update({
      where: { id: parseInt(penilaianId) },
      data: { approval_status: 'ditolak' }
    });
    revalidatePath('/atasan/approval');
    revalidatePath('/atasan/dashboard');
    return { success: true, message: 'Peer berhasil ditolak.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
