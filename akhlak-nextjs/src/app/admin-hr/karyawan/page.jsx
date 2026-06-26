import prisma from '@/lib/prisma';
import { AddKaryawanButton, EditKaryawanButton, DeleteKaryawanButton, SearchFilterBar, ImportKaryawanButton } from './KaryawanClientUI';

export const dynamic = 'force-dynamic';

export default async function DataKaryawan({ searchParams }) {
  const params = await searchParams;
  const q = params.q || '';
  const filterDivisi = params.divisi || '';
  const filterJabatan = params.jabatan || '';
  const filterStatus = params.status || '';

  // Build where clause
  const where = {};
  if (q) {
    where.OR = [
      { nama_lengkap: { contains: q, mode: 'insensitive' } },
      { nip: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (filterDivisi) where.divisi = filterDivisi;
  if (filterJabatan) where.jabatan = filterJabatan;

  const users = await prisma.user.findMany({
    where,
    include: { 
      atasan: true,
      penilai: { // Get assessments where this user is the one being assessed? No, dinilai is where they are evaluated. 
        where: { tipe_relasi: 'self' },
        orderBy: { created_at: 'desc' },
        take: 1
      }
    },
    orderBy: { nama_lengkap: 'asc' }
  });

  // Map status based on 'self' assessment as a quick proxy for Master Data filter
  let processedUsers = users.map(u => {
    let statusPenilaian = 'Belum';
    if (u.penilai && u.penilai.length > 0) {
      statusPenilaian = u.penilai[0].status === 'selesai' ? 'Selesai' : 'Proses';
    }
    return { ...u, statusPenilaian };
  });

  if (filterStatus) {
    processedUsers = processedUsers.filter(u => u.statusPenilaian === filterStatus);
  }

  const potentialAtasan = await prisma.user.findMany({
    where: { role: { in: ['atasan', 'manajemen', 'admin_hr'] } }
  });

  // Get distinct values for filter dropdowns
  const allUsers = await prisma.user.findMany({ select: { divisi: true, jabatan: true } });
  const divisiOptions = [...new Set(allUsers.map(u => u.divisi))].sort();
  const jabatanOptions = [...new Set(allUsers.map(u => u.jabatan))].sort();

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Manajemen Data Karyawan & Penilai</h1>
        <div className="page-actions">
          <ImportKaryawanButton />
          <AddKaryawanButton atasans={potentialAtasan} />
        </div>
      </div>

      <SearchFilterBar divisiOptions={divisiOptions} jabatanOptions={jabatanOptions} />

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Divisi</th>
              <th>Jabatan</th>
              <th>Atasan Langsung</th>
              <th>Status Penilaian</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {processedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="avatar avatar-sm">{user.nama_lengkap.substring(0, 2).toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.nama_lengkap}</div>
                      <div className="text-xs text-muted">NIP: {user.nip}</div>
                    </div>
                  </div>
                </td>
                <td>{user.divisi}</td>
                <td>{user.jabatan}</td>
                <td>{user.atasan ? user.atasan.nama_lengkap : '-'}</td>
                <td>
                  <span className={`badge ${user.statusPenilaian === 'Selesai' ? 'badge-success' : user.statusPenilaian === 'Proses' ? 'badge-warning' : 'badge-outline'}`}>
                    {user.statusPenilaian}
                  </span>
                </td>
                <td>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <EditKaryawanButton user={user} atasans={potentialAtasan} />
                    <DeleteKaryawanButton userId={user.id} />
                  </div>
                </td>
              </tr>
            ))}
            
            {processedUsers.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                  {q || filterDivisi || filterJabatan || filterStatus ? 'Tidak ada data yang cocok dengan filter.' : 'Belum ada data karyawan di database.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="pagination">
          <span className="pagination-info">Menampilkan total {processedUsers.length} data karyawan</span>
        </div>
      </div>
    </main>
  );
}
