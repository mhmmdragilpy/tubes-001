'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateIndikatorUser(userId, periodeId, newScores) {
  try {
    // newScores is an object like { Amanah: 4, Kompeten: 5, ... }
    // Validation
    const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
    
    for (const cat of categories) {
      if (newScores[cat] !== undefined) {
        const val = Number(newScores[cat]);
        if (isNaN(val) || val < 1 || val > 5) {
          return { success: false, message: `Nilai ${cat} harus berupa angka antara 1 sampai 5.` };
        }
      }
    }

    // Find all penilaians for this user in the current periode
    const penilaians = await prisma.penilaian.findMany({
      where: {
        dinilai_id: userId,
        periode_id: periodeId
      },
      select: { id: true }
    });

    if (penilaians.length === 0) {
      return { success: false, message: 'Karyawan ini belum memiliki data penilaian di periode aktif.' };
    }

    const penilaianIds = penilaians.map(p => p.id);

    // Get all questions to map categories to question IDs
    const questions = await prisma.pertanyaan.findMany();
    
    // Update logic: we update all detail_penilaian matching the category for these penilaians
    // to match the requested score.
    for (const cat of categories) {
      if (newScores[cat] !== undefined) {
        const val = Number(newScores[cat]);
        const qIds = questions.filter(q => q.kategori === cat).map(q => q.id);
        
        if (qIds.length > 0) {
          await prisma.detailPenilaian.updateMany({
            where: {
              penilaian_id: { in: penilaianIds },
              pertanyaan_id: { in: qIds }
            },
            data: { skor: val }
          });
        }
      }
    }

    revalidatePath('/admin-hr/rekap');
    return { success: true, message: 'Indikator berhasil diperbarui!' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Terjadi kesalahan pada server saat menyimpan data.' };
  }
}
