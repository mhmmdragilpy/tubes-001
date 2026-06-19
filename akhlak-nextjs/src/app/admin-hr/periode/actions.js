"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPeriode(formData) {
  const nama = formData.get('nama_periode');
  const start = formData.get('tanggal_mulai');
  const end = formData.get('tanggal_selesai');

  try {
    // If we create an active periode, deactivate others
    await prisma.periode.updateMany({
      where: { is_active: true },
      data: { is_active: false }
    });

    await prisma.periode.create({
      data: {
        nama_periode: nama,
        tanggal_mulai: new Date(start),
        tanggal_selesai: new Date(end),
        is_active: true
      }
    });

    revalidatePath('/admin-hr/periode');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updatePeriode(id, formData) {
  const nama = formData.get('nama_periode');
  const start = formData.get('tanggal_mulai');
  const end = formData.get('tanggal_selesai');

  try {
    await prisma.periode.update({
      where: { id: parseInt(id) },
      data: {
        nama_periode: nama,
        tanggal_mulai: new Date(start),
        tanggal_selesai: new Date(end)
      }
    });

    revalidatePath('/admin-hr/periode');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function tutupPeriode(id) {
  try {
    await prisma.periode.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });
    revalidatePath('/admin-hr/periode');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
