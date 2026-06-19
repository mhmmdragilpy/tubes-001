const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
require('dotenv').config({ path: '.env' })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Menghapus data lama...')
  await prisma.detailPenilaian.deleteMany()
  await prisma.penilaian.deleteMany()
  await prisma.pertanyaan.deleteMany()
  await prisma.periode.deleteMany()
  await prisma.notifikasi.deleteMany()
  await prisma.idp.deleteMany()
  await prisma.user.deleteMany()

  console.log('Menambahkan data baru...')

  // 1. Seed Periode
  const periode = await prisma.periode.create({
    data: {
      nama_periode: 'Semester 1 - 2026',
      tanggal_mulai: new Date('2026-04-01'),
      tanggal_selesai: new Date('2026-04-14'),
      is_active: true
    }
  })
  
  const periodeLalu = await prisma.periode.create({
    data: {
      nama_periode: 'Semester 2 - 2025',
      tanggal_mulai: new Date('2025-10-01'),
      tanggal_selesai: new Date('2025-10-14'),
      is_active: false
    }
  })

  // 2. Seed Pertanyaan AKHLAK (3 per kategori)
  const pertanyaanData = [
    { kategori: 'Amanah', teks_pertanyaan: 'Seberapa sering rekan Anda menyelesaikan tugas sesuai deadline yang disepakati?' },
    { kategori: 'Amanah', teks_pertanyaan: 'Seberapa baik rekan Anda menjaga kerahasiaan data perusahaan?' },
    { kategori: 'Amanah', teks_pertanyaan: 'Seberapa konsisten rekan Anda dengan komitmen yang telah dibuatnya?' },

    { kategori: 'Kompeten', teks_pertanyaan: 'Seberapa baik rekan Anda dalam memberikan solusi teknis terhadap masalah kerja?' },
    { kategori: 'Kompeten', teks_pertanyaan: 'Seberapa sering rekan Anda menunjukkan peningkatan keahlian dalam bidangnya?' },
    { kategori: 'Kompeten', teks_pertanyaan: 'Seberapa akurat dan detail kualitas hasil kerja yang diberikan?' },

    { kategori: 'Harmonis', teks_pertanyaan: 'Seberapa sering rekan Anda membantu rekan kerja yang sedang kesulitan?' },
    { kategori: 'Harmonis', teks_pertanyaan: 'Seberapa baik rekan Anda menghargai perbedaan pendapat dalam tim?' },
    { kategori: 'Harmonis', teks_pertanyaan: 'Seberapa kondusif suasana kerja yang diciptakan oleh rekan Anda?' },

    { kategori: 'Loyal', teks_pertanyaan: 'Seberapa kuat komitmen rekan Anda terhadap pencapaian target perusahaan?' },
    { kategori: 'Loyal', teks_pertanyaan: 'Seberapa bersedia rekan Anda bekerja ekstra jika perusahaan sangat membutuhkan?' },
    { kategori: 'Loyal', teks_pertanyaan: 'Seberapa baik rekan Anda menjaga nama baik perusahaan di luar jam kerja?' },

    { kategori: 'Adaptif', teks_pertanyaan: 'Seberapa cepat rekan Anda menyesuaikan diri dengan perubahan teknologi/proses kerja?' },
    { kategori: 'Adaptif', teks_pertanyaan: 'Seberapa proaktif rekan Anda dalam memberikan inovasi baru?' },
    { kategori: 'Adaptif', teks_pertanyaan: 'Seberapa terbuka rekan Anda terhadap feedback dan kritik yang membangun?' },

    { kategori: 'Kolaboratif', teks_pertanyaan: 'Seberapa aktif rekan Anda berkontribusi dalam diskusi tim lintas divisi?' },
    { kategori: 'Kolaboratif', teks_pertanyaan: 'Seberapa baik rekan Anda berbagi informasi penting dengan rekan kerjanya?' },
    { kategori: 'Kolaboratif', teks_pertanyaan: 'Seberapa efektif rekan Anda bekerja sama untuk mencapai tujuan bersama?' },
  ]
  
  const pertanyaanDB = []
  for (const q of pertanyaanData) {
    const res = await prisma.pertanyaan.create({ data: q })
    pertanyaanDB.push(res)
  }

  // Password default untuk semua user: password123
  const defaultPassword = '$2b$10$/d5R9cOQmLvm7esX8eV0i.1icGNa9Bk5JBzhllqdWZKVYqpM3dquu'

  // 3. Seed Users (Admin & Manajemen)
  const admin = await prisma.user.create({
    data: {
      nip: '102012330100', nama_lengkap: 'Admin HR', email: 'admin@energi.co.id',
      password_hash: defaultPassword, divisi: 'SDM', jabatan: 'HR Manager', role: 'admin_hr'
    }
  })

  const manajemen = await prisma.user.create({
    data: {
      nip: '102012330200', nama_lengkap: 'Direktur Manajemen', email: 'dir@energi.co.id',
      password_hash: defaultPassword, divisi: 'Manajemen', jabatan: 'Direktur', role: 'manajemen'
    }
  })

  // 4. Seed Atasan (Manager per Divisi)
  const managersData = [
    { nip: '102012330701', nama_lengkap: 'Budi Santoso', email: 'budi@energi.co.id', divisi: 'Operasi', jabatan: 'Manager Operasi' },
    { nip: '102012330702', nama_lengkap: 'Anita Wijaya', email: 'anita@energi.co.id', divisi: 'Keuangan', jabatan: 'Manager Keuangan' },
    { nip: '102012330703', nama_lengkap: 'Rahmat Hidayat', email: 'rahmat@energi.co.id', divisi: 'SDM', jabatan: 'Manager SDM' },
    { nip: '102012330704', nama_lengkap: 'Kevin Pratama', email: 'kevin@energi.co.id', divisi: 'IT', jabatan: 'Manager IT' },
    { nip: '102012330705', nama_lengkap: 'Linda Sari', email: 'linda@energi.co.id', divisi: 'Pemasaran', jabatan: 'Manager Pemasaran' },
  ]

  const managers = []
  for (const m of managersData) {
    const res = await prisma.user.create({
      data: {
        ...m, password_hash: defaultPassword, role: 'atasan', atasan_id: manajemen.id
      }
    })
    managers.push(res)
  }

  // 5. Seed Karyawan (Staff under Managers)
  const staffData = [
    // Operasi (under Budi)
    { nip: '102012330801', nama_lengkap: 'Yoga Kameswara', email: 'yoga@energi.co.id', divisi: 'Operasi', jabatan: 'Supervisor Lapangan', atasanIdx: 0, perf: 'high' },
    { nip: '102012330802', nama_lengkap: 'Rizal Fahmi', email: 'rizal@energi.co.id', divisi: 'Operasi', jabatan: 'Teknisi Senior', atasanIdx: 0, perf: 'med' },
    { nip: '102012330803', nama_lengkap: 'Dinda Permata', email: 'dinda@energi.co.id', divisi: 'Operasi', jabatan: 'Admin Operasional', atasanIdx: 0, perf: 'med' },
    
    // Keuangan (under Anita)
    { nip: '102012330804', nama_lengkap: 'Siti Nurhaliza', email: 'siti@energi.co.id', divisi: 'Keuangan', jabatan: 'Analyst', atasanIdx: 1, perf: 'high' },
    { nip: '102012330805', nama_lengkap: 'Wiranu Adji S.', email: 'wiranu@energi.co.id', divisi: 'Keuangan', jabatan: 'Akuntan', atasanIdx: 1, perf: 'high' },
    { nip: '102012330806', nama_lengkap: 'Dewi Lestari', email: 'dewi@energi.co.id', divisi: 'Keuangan', jabatan: 'Staff Keuangan', atasanIdx: 1, perf: 'low' },
    
    // SDM (under Rahmat)
    { nip: '102012330807', nama_lengkap: 'Rina Permatasari', email: 'rina@energi.co.id', divisi: 'SDM', jabatan: 'Rekruter', atasanIdx: 2, perf: 'high' },
    { nip: '102012330808', nama_lengkap: 'Akhmad Azmi A.', email: 'akhmad@energi.co.id', divisi: 'SDM', jabatan: 'Staff Payroll', atasanIdx: 2, perf: 'med' },
    
    // IT (under Kevin)
    { nip: '102012330809', nama_lengkap: 'Dimas Anggara', email: 'dimas@energi.co.id', divisi: 'IT', jabatan: 'Software Engineer', atasanIdx: 3, perf: 'high' },
    { nip: '102012330810', nama_lengkap: 'Ahmad Rizky P.', email: 'ahmad@energi.co.id', divisi: 'IT', jabatan: 'System Admin', atasanIdx: 3, perf: 'low' },
    { nip: '102012330811', nama_lengkap: 'Tia Amanda', email: 'tia@energi.co.id', divisi: 'IT', jabatan: 'UI/UX Designer', atasanIdx: 3, perf: 'med' },

    // Pemasaran (under Linda)
    { nip: '102012330812', nama_lengkap: 'Fajar Nugroho', email: 'fajar@energi.co.id', divisi: 'Pemasaran', jabatan: 'Sales Executive', atasanIdx: 4, perf: 'low' },
    { nip: '102012330813', nama_lengkap: 'Nadia Saphira', email: 'nadia@energi.co.id', divisi: 'Pemasaran', jabatan: 'Digital Marketing', atasanIdx: 4, perf: 'med' },
    { nip: '102012330814', nama_lengkap: 'Reza Rahadian', email: 'reza@energi.co.id', divisi: 'Pemasaran', jabatan: 'Copywriter', atasanIdx: 4, perf: 'med' },
  ]

  const staffs = []
  for (const s of staffData) {
    const res = await prisma.user.create({
      data: {
        nip: s.nip, nama_lengkap: s.nama_lengkap, email: s.email, divisi: s.divisi, jabatan: s.jabatan,
        password_hash: defaultPassword, role: 'karyawan', atasan_id: managers[s.atasanIdx].id
      }
    })
    // Store perf metric in object for later
    res.perf = s.perf
    res.atasanIdx = s.atasanIdx
    staffs.push(res)
  }

  // 6. Generate Penilaian and Details
  // Helper to get random score based on perf profile
  function getRandomScore(perf, isSelf = false) {
    let min, max;
    if (perf === 'high') { min = 4; max = 5; }
    else if (perf === 'low') { min = 2; max = 4; }
    else { min = 3; max = 5; }

    // Simulate "Blind Spot" where Self score is much higher than others
    if (isSelf && perf === 'low') {
      min = 4; max = 5; 
    } else if (isSelf && perf === 'high') {
      min = 3; max = 4; // Humble high performer
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const allEmployees = [...managers, ...staffs]

  let penilaianCounter = 0;

  console.log('Generate penilaian (360 derajat) untuk setiap karyawan...')
  for (const emp of allEmployees) {
    const isSelesai = Math.random() > 0.1; // 90% completion rate for realism
    
    // 1. SELF ASSESSMENT
    const selfStatus = isSelesai ? 'selesai' : 'proses';
    const selfPen = await prisma.penilaian.create({
      data: {
        periode_id: periode.id, penilai_id: emp.id, dinilai_id: emp.id, tipe_relasi: 'self', status: selfStatus,
        catatan_kualitatif: selfStatus === 'selesai' ? 'Saya telah berusaha maksimal dalam mencapai target divisi.' : null
      }
    })
    
    if (selfStatus === 'selesai') {
      for (const q of pertanyaanDB) {
        await prisma.detailPenilaian.create({
          data: { penilaian_id: selfPen.id, pertanyaan_id: q.id, skor: getRandomScore(emp.perf || 'med', true) }
        })
      }
    }

    // 2. ATASAN -> BAWAHAN
    if (emp.atasan_id) {
      const atasanStatus = Math.random() > 0.05 ? 'selesai' : 'belum';
      const atasanPen = await prisma.penilaian.create({
        data: {
          periode_id: periode.id, penilai_id: emp.atasan_id, dinilai_id: emp.id, tipe_relasi: 'bawahan', status: atasanStatus,
          catatan_kualitatif: atasanStatus === 'selesai' ? 'Kinerja baik, namun perlu peningkatan dalam inisiatif.' : null
        }
      })
      if (atasanStatus === 'selesai') {
        for (const q of pertanyaanDB) {
          await prisma.detailPenilaian.create({
            data: { penilaian_id: atasanPen.id, pertanyaan_id: q.id, skor: getRandomScore(emp.perf || 'med', false) }
          })
        }
      }
    }

    // 3. BAWAHAN -> ATASAN
    if (emp.role === 'atasan') {
      const bawahanLangsung = staffs.filter(s => s.atasan_id === emp.id)
      for (const b of bawahanLangsung) {
        const bStatus = Math.random() > 0.1 ? 'selesai' : 'proses';
        const bawahanPen = await prisma.penilaian.create({
          data: {
            periode_id: periode.id, penilai_id: b.id, dinilai_id: emp.id, tipe_relasi: 'atasan', status: bStatus,
            catatan_kualitatif: bStatus === 'selesai' ? 'Bapak/Ibu Manager sangat membantu dalam mengarahkan tim.' : null
          }
        })
        if (bStatus === 'selesai') {
          for (const q of pertanyaanDB) {
            await prisma.detailPenilaian.create({
              data: { penilaian_id: bawahanPen.id, pertanyaan_id: q.id, skor: getRandomScore('high', false) }
            })
          }
        }
      }
    }

    // 4. PEER -> PEER
    // Assign 2 peers from the same division
    const peers = staffs.filter(s => s.divisi === emp.divisi && s.id !== emp.id).slice(0, 2)
    for (const p of peers) {
      const peerStatus = Math.random() > 0.15 ? 'selesai' : 'proses';
      const peerPen = await prisma.penilaian.create({
        data: {
          periode_id: periode.id, penilai_id: p.id, dinilai_id: emp.id, tipe_relasi: 'peer', status: peerStatus,
          approval_status: 'disetujui',
          catatan_kualitatif: peerStatus === 'selesai' ? 'Sangat kooperatif diajak kerja sama lintas project.' : null
        }
      })
      if (peerStatus === 'selesai') {
        for (const q of pertanyaanDB) {
          await prisma.detailPenilaian.create({
            data: { penilaian_id: peerPen.id, pertanyaan_id: q.id, skor: getRandomScore(emp.perf || 'med', false) }
          })
        }
      }
    }
  }

  // Create some pending peer approvals for Atasan Dashboard Demo
  console.log('Menambahkan beberapa data pending approval...')
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id, penilai_id: staffs[1].id, dinilai_id: staffs[0].id, tipe_relasi: 'peer', status: 'belum', approval_status: 'pending'
    }
  })
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id, penilai_id: staffs[2].id, dinilai_id: staffs[0].id, tipe_relasi: 'peer', status: 'belum', approval_status: 'pending'
    }
  })

  // Also seed some data for Semester Lalu (Semester 2 2025)
  console.log('Generate riwayat penilaian semester lalu...')
  for (const emp of allEmployees) {
    const penLalu = await prisma.penilaian.create({
      data: {
        periode_id: periodeLalu.id, penilai_id: emp.id, dinilai_id: emp.id, tipe_relasi: 'self', status: 'selesai'
      }
    })
    for (const q of pertanyaanDB) {
      await prisma.detailPenilaian.create({
        data: { penilaian_id: penLalu.id, pertanyaan_id: q.id, skor: Math.max(3, getRandomScore(emp.perf || 'med') - 1) } // Skor lalu sedikit lebih rendah
      })
    }
    
    if (emp.atasan_id) {
      const penAtasanLalu = await prisma.penilaian.create({
        data: {
          periode_id: periodeLalu.id, penilai_id: emp.atasan_id, dinilai_id: emp.id, tipe_relasi: 'bawahan', status: 'selesai'
        }
      })
      for (const q of pertanyaanDB) {
        await prisma.detailPenilaian.create({
          data: { penilaian_id: penAtasanLalu.id, pertanyaan_id: q.id, skor: Math.max(3, getRandomScore(emp.perf || 'med') - 1) }
        })
      }
    }
  }

  // Add some specific active/incomplete dummy assessments for testing
  console.log('Menambahkan data dummy assessment belum selesai untuk testing karyawan...')
  // 1. Yoga Kameswara (staffs[0]) assesses Anita Wijaya (Manager Keuangan) as a cross-divisional peer/colleague
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id,
      penilai_id: staffs[0].id,
      dinilai_id: managers[1].id, // Anita
      tipe_relasi: 'peer',
      status: 'belum',
      approval_status: 'disetujui'
    }
  })

  // 2. Yoga Kameswara (staffs[0]) assesses Siti Nurhaliza (staffs[3]) as peer
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id,
      penilai_id: staffs[0].id,
      dinilai_id: staffs[3].id, // Siti
      tipe_relasi: 'peer',
      status: 'belum',
      approval_status: 'disetujui'
    }
  })

  // 3. Rizal Fahmi (staffs[1]) assesses Budi Santoso (Atasan) - ensure there is a pending one
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id,
      penilai_id: staffs[1].id,
      dinilai_id: managers[0].id, // Budi
      tipe_relasi: 'atasan',
      status: 'belum',
      approval_status: 'disetujui'
    }
  })

  // 4. Rizal Fahmi (staffs[1]) assesses Dinda Permata as peer
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id,
      penilai_id: staffs[1].id,
      dinilai_id: staffs[2].id, // Dinda
      tipe_relasi: 'peer',
      status: 'belum',
      approval_status: 'disetujui'
    }
  })

  // 5. Siti Nurhaliza (staffs[3]) assesses Wiranu Adji S. (staffs[4])
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id,
      penilai_id: staffs[3].id,
      dinilai_id: staffs[4].id,
      tipe_relasi: 'peer',
      status: 'belum',
      approval_status: 'disetujui'
    }
  })

  // 6. Siti Nurhaliza (staffs[3]) assesses Anita Wijaya (Atasan)
  await prisma.penilaian.create({
    data: {
      periode_id: periode.id,
      penilai_id: staffs[3].id,
      dinilai_id: managers[1].id,
      tipe_relasi: 'atasan',
      status: 'belum',
      approval_status: 'disetujui'
    }
  })

  // Seed some dummy IDPs
  console.log('Menambahkan data dummy IDP karyawan untuk laporan...')
  await prisma.idp.create({
    data: {
      user_id: staffs[0].id, // Yoga Kameswara
      periode_id: periode.id,
      area_pengembangan: 'Kompeten',
      target_akhir: 'Menguasai Pemrograman Next.js',
      rencana_aksi: 'Mengikuti kursus intensif Next.js dan membangun aplikasi portofolio',
      timeline: 'Q3 2026',
      status: 'sedang_berjalan'
    }
  });

  await prisma.idp.create({
    data: {
      user_id: staffs[0].id, // Yoga Kameswara
      periode_id: periode.id,
      area_pengembangan: 'Adaptif',
      target_akhir: 'Mampu beradaptasi dengan alur kerja DevOps baru',
      rencana_aksi: 'Mempelajari CI/CD pipeline dan Docker',
      timeline: 'Q4 2026',
      status: 'belum_mulai'
    }
  });

  await prisma.idp.create({
    data: {
      user_id: staffs[1].id, // Rizal Fahmi
      periode_id: periode.id,
      area_pengembangan: 'Amanah',
      target_akhir: 'Menyelesaikan tugas proyek tepat waktu',
      rencana_aksi: 'Menggunakan tools manajemen tugas seperti Trello',
      timeline: 'Q3 2026',
      status: 'selesai'
    }
  });

  await prisma.idp.create({
    data: {
      user_id: staffs[3].id, // Siti Nurhaliza
      periode_id: periode.id,
      area_pengembangan: 'Kompeten',
      target_akhir: 'Sertifikasi Analisis Keuangan Lanjutan',
      rencana_aksi: 'Mengikuti ujian sertifikasi CFA level 1',
      timeline: 'Q2 2026',
      status: 'sedang_berjalan'
    }
  });

  console.log('Database Berhasil Di-seed dengan Data Realistis yang Melimpah!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
