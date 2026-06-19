"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPeerMapping(formData) {
  try {
    const periode_id = parseInt(formData.get('periode_id'));
    const dinilai_id = parseInt(formData.get('dinilai_id'));
    const penilai_id = parseInt(formData.get('penilai_id'));

    if (dinilai_id === penilai_id) {
      throw new Error("Karyawan tidak dapat menilai dirinya sendiri sebagai peer.");
    }

    // Check if mapping already exists
    const existing = await prisma.penilaian.findFirst({
      where: {
        periode_id,
        dinilai_id,
        penilai_id,
        tipe_relasi: 'peer'
      }
    });

    if (existing) {
      throw new Error("Mapping ini sudah ada!");
    }

    await prisma.penilaian.create({
      data: {
        periode_id,
        dinilai_id,
        penilai_id,
        tipe_relasi: 'peer',
        approval_status: 'pending' // As per Phase 1 logic
      }
    });

    revalidatePath('/admin-hr/peer');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deletePeerMapping(penilaian_id) {
  try {
    const p = await prisma.penilaian.findUnique({ where: { id: parseInt(penilaian_id) } });
    if (!p) throw new Error("Penilaian tidak ditemukan.");
    if (p.tipe_relasi !== 'peer') throw new Error("Hanya bisa menghapus relasi peer.");
    if (p.status === 'selesai') throw new Error("Tidak bisa menghapus penilaian yang sudah diselesaikan oleh penilai.");

    // Delete detail penilaian first
    await prisma.detailPenilaian.deleteMany({
      where: { penilaian_id: parseInt(penilaian_id) }
    });

    await prisma.penilaian.delete({
      where: { id: parseInt(penilaian_id) }
    });

    revalidatePath('/admin-hr/peer');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
