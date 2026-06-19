"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function sendReminder(targetUserIds, judul, pesan, link = null) {
  try {
    const data = targetUserIds.map(uid => ({
      user_id: uid,
      judul,
      pesan,
      link
    }));

    await prisma.notifikasi.createMany({ data });
    revalidatePath('/admin-hr/dashboard');
    return { success: true, count: data.length, message: `Berhasil mengirim ${data.length} reminder.` };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
