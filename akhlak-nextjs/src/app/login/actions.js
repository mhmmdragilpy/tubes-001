'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { signToken } from '@/lib/jwt'

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

    // Create JWT Token
    const tokenPayload = {
      userId: user.id,
      role: rolePath,
      email: user.email
    };
    const token = await signToken(tokenPayload);

    // Set HTTPOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });
    
    // Also keep userId cookie for backward compatibility of simple components if needed,
    // but ideally we should only rely on token. We'll set it here to not break legacy stuff yet.
    cookieStore.set('userId', user.id.toString(), {
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return {
      success: true,
      message: 'Login berhasil!',
      role: rolePath,
      user: {
        id: user.id,
        nama: user.nama_lengkap,
        email: user.email,
        role: rolePath,
        divisi: user.divisi,
        avatar_url: user.avatar_url
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Koneksi database gagal.' }
  }
}
