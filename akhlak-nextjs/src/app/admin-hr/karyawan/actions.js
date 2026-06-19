"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createKaryawan(formData) {
  try {
    const nip = formData.get('nip');
    const nama_lengkap = formData.get('nama_lengkap');
    const email = formData.get('email');
    const divisi = formData.get('divisi');
    const jabatan = formData.get('jabatan');
    const role = formData.get('role');
    
    let atasan_id = formData.get('atasan_id');
    atasan_id = atasan_id ? parseInt(atasan_id) : null;

    const password_hash = await bcrypt.hash('password123', 10);

    await prisma.user.create({
      data: { nip, nama_lengkap, email, divisi, jabatan, role, atasan_id, password_hash }
    });

    revalidatePath('/admin-hr/karyawan');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateKaryawan(id, formData) {
  try {
    const nip = formData.get('nip');
    const nama_lengkap = formData.get('nama_lengkap');
    const email = formData.get('email');
    const divisi = formData.get('divisi');
    const jabatan = formData.get('jabatan');
    const role = formData.get('role');
    
    let atasan_id = formData.get('atasan_id');
    atasan_id = atasan_id ? parseInt(atasan_id) : null;

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { nip, nama_lengkap, email, divisi, jabatan, role, atasan_id }
    });

    revalidatePath('/admin-hr/karyawan');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteKaryawan(id) {
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    revalidatePath('/admin-hr/karyawan');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
