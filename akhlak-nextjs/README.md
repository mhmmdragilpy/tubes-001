# Penilaian Kinerja 360 Derajat (AKHLAK) - Next.js

Aplikasi web modern untuk melakukan Penilaian Kinerja 360 Derajat bagi karyawan berbasis indikator core values BUMN (AKHLAK). Dibangun menggunakan **Next.js (App Router)**, **PostgreSQL**, dan **Prisma ORM**.

Aplikasi ini mencakup 4 buah peran (*Role*) utama:
1. **Admin HR**: Mengatur siklus/periode penilaian, memanajemen data karyawan, melihat rekap skor.
2. **Manajemen**: Memantau pergerakan skor perusahaan dan melihat laporan karyawan secara utuh.
3. **Atasan (Manager)**: Melakukan penilaian bawahan, melakukan validasi/approval penilaian rekan sejawat (*peer*), serta menyetujui *Individual Development Plan* (IDP).
4. **Karyawan**: Mengisi form penilaian mandiri (*self*), atasan (*upward*), dan sejawat (*peer*).

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum menjalankan aplikasi ini secara lokal di komputer Anda, pastikan telah menginstal:
- **Node.js** (Rekomendasi versi 18.x LTS atau lebih baru)
- **PostgreSQL** (Telah terinstal dan berjalan di latar belakang)
- **Git** (Opsional)

---

## 🚀 Panduan Instalasi Lokal (Setup Guide)

Ikuti langkah-langkah berikut secara berurutan di terminal (Command Prompt / PowerShell / Terminal VS Code):

### 1. Masuk ke Direktori Proyek
Pastikan Anda sudah berada di dalam folder `akhlak-nextjs`.
```bash
cd akhlak-nextjs
```

### 2. Instal Dependensi
Unduh seluruh pustaka *package* yang dibutuhkan aplikasi.
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Aplikasi membutuhkan konfigurasi rahasia untuk koneksi *database* dan sesi (JWT). Buatlah sebuah berkas bernama `.env` di folder root `akhlak-nextjs`, lalu salin format berikut dan sesuaikan nama `postgres`, `password`, dan nama _database_ Anda:

```env
# Ganti nama_user, password_anda, dan nama_database sesuai pengaturan lokal PostgreSQL Anda.
# Contoh: postgresql://postgres:123456@localhost:5432/akhlak_db
DATABASE_URL="postgresql://[nama_user]:[password_anda]@localhost:5432/[nama_database]?schema=public"

# Kunci rahasia untuk otentikasi sesi (silakan gunakan string acak apapun)
JWT_SECRET="rahasia_akhlak_super_aman_2026"
```

### 4. Sinkronisasi Skema Database
Dorong struktur tabel ke dalam PostgreSQL menggunakan Prisma.
```bash
npx prisma db push
```

### 5. Seeding (Memasukkan Data Dummy Awal)
Untuk mempermudah pengujian, sistem telah dilengkapi dengan puluhan data *dummy* realistis (Akun Pengguna, Daftar Pertanyaan, Periode Aktif, dan Riwayat Penilaian). Jalankan perintah berikut untuk mengisi *database*:
```bash
npx prisma db seed
```

### 6. Jalankan Server Pengembangan
```bash
npm run dev
```

Aplikasi sekarang dapat diakses secara lokal melalui *browser* Anda di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Akses Akun Dummy (Untuk Testing)

Setelah proses `seed` di atas berhasil, Anda dapat masuk ke aplikasi menggunakan akun-akun berikut. Tersedia juga fitur pintasan *Dropdown Login* (Quick Login) di halaman `/login` untuk mempercepat proses pengujian.

**Kata Sandi (Password) untuk SEMUA akun di bawah ini adalah:** `password123`

| Role | Nama / Jabatan | Email |
| :--- | :--- | :--- |
| **Admin HR** | Admin HR (SDM) | `admin@energi.co.id` |
| **Manajemen** | Direktur Manajemen | `dir@energi.co.id` |
| **Atasan** | Budi Santoso (Mgr. Operasi) | `budi@energi.co.id` |
| **Atasan** | Anita Wijaya (Mgr. Keuangan) | `anita@energi.co.id` |
| **Karyawan** | Yoga Kameswara (Operasi) | `yoga@energi.co.id` |
| **Karyawan** | Siti Nurhaliza (Keuangan) | `siti@energi.co.id` |

*(Terdapat lebih dari 20 akun karyawan dan manager lainnya di berbagai divisi yang bisa Anda periksa langsung di menu Data Karyawan).*

---

## 📦 Fitur Utama yang Terpasang
- **Autentikasi Aman**: Menggunakan _JSON Web Token_ (JWT).
- **Penilaian Fleksibel**: Logika pengambilan data _Self_, _Atasan_, dan _Peer_ telah tervalidasi per-periode aktif.
- **Export Laporan**: Dilengkapi dengan pustaka *Client-Side* (`jsPDF` dan `PptxGenJS`) untuk mengunduh laporan PDF & PPTX secara instan di menu Rekap.
- **Unggah Foto Profil**: Integrasi FormData murni ke direktori lokal `public/uploads/profiles`.
