'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function loginUser(email, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return { success: false, message: 'Email tidak terdaftar.' }
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    
    if (!passwordMatch) {
      return { success: false, message: 'Password salah.' }
    }

    // Role enum from database might contain underscores, map to paths
    let rolePath = user.role.replace('_', '-');

    return {
      success: true,
      message: 'Login berhasil!',
      role: rolePath,
      user: {
        id: user.id,
        nama: user.nama_lengkap,
        email: user.email,
        role: rolePath,
        divisi: user.divisi
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Koneksi database gagal.' }
  }
}
