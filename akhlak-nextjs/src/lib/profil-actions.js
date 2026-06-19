"use server";

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateProfile(userId, formData) {
  try {
    const nama_lengkap = formData.get('nama_lengkap');
    if (!nama_lengkap || nama_lengkap.trim().length < 2) {
      return { success: false, message: 'Nama lengkap harus minimal 2 karakter.' };
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { nama_lengkap: nama_lengkap.trim() }
    });

    return { success: true, message: 'Profil berhasil diperbarui!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function changePassword(userId, formData) {
  try {
    const oldPassword = formData.get('old_password');
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { success: false, message: 'Semua field password harus diisi.' };
    }
    if (newPassword.length < 8) {
      return { success: false, message: 'Password baru harus minimal 8 karakter.' };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Konfirmasi password tidak cocok.' };
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return { success: false, message: 'User tidak ditemukan.' };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return { success: false, message: 'Password lama salah.' };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password_hash: newHash }
    });

    return { success: true, message: 'Password berhasil diubah!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
