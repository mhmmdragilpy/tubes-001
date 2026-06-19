import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as xlsx from 'xlsx';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'Tidak ada file yang diunggah.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Parse excel to JSON
    // Expected columns: Nama, NIP, Divisi, Jabatan, Email
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return NextResponse.json({ success: false, message: 'File Excel kosong atau format tidak sesuai.' }, { status: 400 });
    }

    const defaultPassword = await bcrypt.hash('password123', 10);
    
    let successCount = 0;
    let failCount = 0;

    for (const row of data) {
      // Basic normalization of keys just in case header case differs
      const getVal = (key) => {
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? row[foundKey] : null;
      };

      const nama = getVal('Nama') || getVal('Nama Lengkap');
      const nip = getVal('NIP') ? String(getVal('NIP')) : null;
      const divisi = getVal('Divisi');
      const jabatan = getVal('Jabatan');
      const email = getVal('Email');

      if (!nama || !nip || !email) {
        failCount++;
        continue;
      }

      try {
        await prisma.user.upsert({
          where: { email },
          update: {
            nama_lengkap: String(nama),
            nip: nip,
            divisi: String(divisi || 'Umum'),
            jabatan: String(jabatan || 'Staff'),
          },
          create: {
            nama_lengkap: String(nama),
            nip: nip,
            email: String(email),
            divisi: String(divisi || 'Umum'),
            jabatan: String(jabatan || 'Staff'),
            password_hash: defaultPassword,
            role: 'karyawan'
          }
        });
        successCount++;
      } catch (err) {
        console.error('Error importing row:', row, err);
        failCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Import selesai. ${successCount} berhasil, ${failCount} gagal/dilewati.` 
    });

  } catch (error) {
    console.error('Import Error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server saat memproses file.' }, { status: 500 });
  }
}
