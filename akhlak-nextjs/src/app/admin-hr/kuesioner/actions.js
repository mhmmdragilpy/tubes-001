"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPertanyaan(formData) {
  try {
    const kategori = formData.get('kategori');
    const teks_pertanyaan = formData.get('teks_pertanyaan');

    await prisma.pertanyaan.create({
      data: { kategori, teks_pertanyaan, is_active: true }
    });

    revalidatePath('/admin-hr/kuesioner');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updatePertanyaan(id, formData) {
  try {
    const teks_pertanyaan = formData.get('teks_pertanyaan');

    await prisma.pertanyaan.update({
      where: { id: parseInt(id) },
      data: { teks_pertanyaan }
    });

    revalidatePath('/admin-hr/kuesioner');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function togglePertanyaan(id, is_active) {
  try {
    await prisma.pertanyaan.update({
      where: { id: parseInt(id) },
      data: { is_active }
    });

    revalidatePath('/admin-hr/kuesioner');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
