"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPeriode(formData) {
  const nama = formData.get('nama_periode');
  const start = formData.get('tanggal_mulai');
  const end = formData.get('tanggal_selesai');

  try {
    // Find previously active periods to notify their closure
    const previouslyActive = await prisma.periode.findMany({
      where: { is_active: true }
    });

    // If we create an active periode, deactivate others
    await prisma.periode.updateMany({
      where: { is_active: true },
      data: { is_active: false }
    });

    const newPeriode = await prisma.periode.create({
      data: {
        nama_periode: nama,
        tanggal_mulai: new Date(start),
        tanggal_selesai: new Date(end),
        is_active: true
      }
    });

    // Notify all manajemen users
    const manajemenUsers = await prisma.user.findMany({
      where: { role: 'manajemen' }
    });

    for (const m of manajemenUsers) {
      // Notify closure of previous periods
      for (const prev of previouslyActive) {
        await prisma.notifikasi.create({
          data: {
            user_id: m.id,
            judul: 'Periode Penilaian Ditutup',
            pesan: `Periode penilaian '${prev.nama_periode}' telah ditutup karena periode baru dibuka.`,
            link: '/manajemen/dashboard',
            is_read: false
          }
        });
      }

      // Notify opening of the new period
      await prisma.notifikasi.create({
        data: {
          user_id: m.id,
          judul: 'Periode Penilaian Dibuka',
          pesan: `Periode penilaian baru '${nama}' telah dibuka mulai ${start} hingga ${end}.`,
          link: '/manajemen/dashboard',
          is_read: false
        }
      });
    }

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
    const closed = await prisma.periode.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });

    // Notify all manajemen users
    const manajemenUsers = await prisma.user.findMany({
      where: { role: 'manajemen' }
    });

    for (const m of manajemenUsers) {
      await prisma.notifikasi.create({
        data: {
          user_id: m.id,
          judul: 'Periode Penilaian Ditutup',
          pesan: `Periode penilaian '${closed.nama_periode}' telah resmi ditutup.`,
          link: '/manajemen/dashboard',
          is_read: false
        }
      });
    }

    revalidatePath('/admin-hr/periode');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
