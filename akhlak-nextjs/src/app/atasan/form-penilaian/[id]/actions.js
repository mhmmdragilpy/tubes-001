"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitPenilaian(penilaianId, answers, catatan) {
  try {
    // 1. Insert details
    const details = Object.entries(answers).map(([pertanyaanId, skor]) => ({
      penilaian_id: parseInt(penilaianId),
      pertanyaan_id: parseInt(pertanyaanId),
      skor: parseInt(skor)
    }));

    // Because createMany might not be supported based on DB type or adapter config, 
    // we use a transaction
    await prisma.$transaction(
      details.map(d => prisma.detailPenilaian.create({ data: d }))
    );

    // 2. Update status penilaian to 'selesai'
    await prisma.penilaian.update({
      where: { id: parseInt(penilaianId) },
      data: {
        status: 'selesai',
        catatan_kualitatif: catatan
      }
    });

    revalidatePath('/atasan/form-penilaian');
    return { success: true };
  } catch (error) {
    console.error('Submit Penilaian Error:', error);
    return { success: false, message: error.message };
  }
}
