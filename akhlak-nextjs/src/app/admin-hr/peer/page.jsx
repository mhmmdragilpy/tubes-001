import prisma from '@/lib/prisma';
import { FiSearch } from 'react-icons/fi';
import { AddPeerMappingButton } from './PeerClientUI';
import { EditPeerClientUI } from './EditPeerClientUI';

export const dynamic = 'force-dynamic';

export default async function PeerPage() {
  // Fetch users with their incoming assessments (as 'dinilai')
  const users = await prisma.user.findMany({
    where: { role: { not: 'admin_hr' } },
    include: {
      dinilai: {
        where: { tipe_relasi: 'peer' },
        include: {
          penilai: true
        }
      }
    },
    orderBy: {
      nama_lengkap: 'asc'
    }
  });

  const activePeriode = await prisma.periode.findFirst({
    where: { is_active: true }
  });

  const totalKaryawan = users.length;
  let lengkapCount = 0;
  let kurangCount = 0;

  const usersWithStatus = users.map(user => {
    const totalPenilai = user.dinilai.length;
    // Assuming 3 is the minimum for 'Lengkap' based on prototype (3/5)
    const status = totalPenilai >= 3 ? 'Lengkap' : 'Kurang';
    if (status === 'Lengkap') lengkapCount++;
    else kurangCount++;

    return {
      ...user,
      totalPenilai,
      status
    };
  });

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Daftar Peer</h1>
        <div className="page-actions">
          <button className="btn btn-outline">Generate Otomatis</button>
          <AddPeerMappingButton users={users} periodeId={activePeriode?.id} />
        </div>
      </div>

      <div className="stat-cards cols-3">
        <div className="stat-card">
          <div className="stat-label">Total Karyawan</div>
          <div className="stat-value">{totalKaryawan}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Sudah Lengkap (Min. 3 Penilai)</div>
          <div className="stat-value">{lengkapCount}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Perlu Review</div>
          <div className="stat-value">{kurangCount}</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="form-input-icon" style={{ flex: 1 }}>
          <span className="input-icon" style={{display: 'flex', alignItems: 'center'}}><FiSearch size={16} /></span>
          <input type="text" className="form-input" placeholder="Cari nama yang dinilai..." />
        </div>
        <select className="form-select">
          <option>Semua Status</option>
          <option>Lengkap</option>
          <option>Kurang</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Karyawan (Dinilai)</th>
              <th>Daftar Penilai (Atasan, Peer, Bawahan)</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {usersWithStatus.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="avatar avatar-sm">{user.nama_lengkap.substring(0, 2).toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.nama_lengkap}</div>
                      <div className="text-xs text-muted">{user.divisi} — {user.jabatan}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {user.dinilai.map(penilaian => {
                      const badgeClass = penilaian.tipe_relasi === 'atasan' ? 'badge-primary' : 'badge-outline';
                      return (
                        <span key={penilaian.id} className={`badge ${badgeClass}`}>
                          {penilaian.penilai.nama_lengkap} ({penilaian.tipe_relasi})
                        </span>
                      );
                    })}
                    {user.dinilai.length === 0 && <span className="text-xs text-muted">Belum ada penilai</span>}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: user.status === 'Kurang' ? 'var(--danger)' : 'inherit' }}>
                    {user.totalPenilai}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.status === 'Lengkap' ? 'badge-success' : 'badge-danger'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <EditPeerClientUI user={user} allUsers={users} periodeId={activePeriode?.id} />
                </td>
              </tr>
            ))}
            
            {usersWithStatus.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                  Belum ada data karyawan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="pagination">
          <span className="pagination-info">Menampilkan total {usersWithStatus.length} data</span>
          <div className="pagination-buttons">
            <div className="page-btn">&lt;</div>
            <div className="page-btn active">1</div>
            <div className="page-btn">&gt;</div>
          </div>
        </div>
      </div>
    </main>
  );
}
