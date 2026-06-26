import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { ApproveButton, RejectButton } from './ApprovalClientUI';

export const dynamic = 'force-dynamic';

export default async function ApprovalPage() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  const userId = userIdCookie ? parseInt(userIdCookie.value, 10) : 3;

  // Find bawahan
  const bawahanList = await prisma.user.findMany({
    where: { atasan_id: userId },
    include: {
      dinilai: {
        where: { tipe_relasi: 'peer' },
        include: { penilai: true }
      }
    }
  });

  const pendingCount = bawahanList.reduce((acc, b) => acc + b.dinilai.filter(p => p.approval_status === 'pending').length, 0);
  const approvedCount = bawahanList.reduce((acc, b) => acc + b.dinilai.filter(p => p.approval_status === 'disetujui').length, 0);
  const rejectedCount = bawahanList.reduce((acc, b) => acc + b.dinilai.filter(p => p.approval_status === 'ditolak').length, 0);

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Daftar peer</h1>
        <div className="page-actions">
          <span className="badge badge-warning">{pendingCount} Menunggu</span>
          <span className="badge badge-success">{approvedCount} Disetujui</span>
          <span className="badge badge-danger">{rejectedCount} Ditolak</span>
        </div>
      </div>

      {bawahanList.map(bawahan => {
        const pendingPeers = bawahan.dinilai.filter(p => p.approval_status === 'pending');
        const otherPeers = bawahan.dinilai.filter(p => p.approval_status !== 'pending');
        
        if (bawahan.dinilai.length === 0) return null;

        return (
          <div key={bawahan.id} className="card mb-24" style={{ borderTop: `4px solid ${pendingPeers.length > 0 ? 'var(--warning)' : 'var(--success)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span className="avatar avatar-lg">{bawahan.nama_lengkap.substring(0, 2).toUpperCase()}</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{bawahan.nama_lengkap}</div>
                  <div className="text-sm text-muted" style={{ marginTop: '4px' }}>NIP: {bawahan.nip} | {bawahan.jabatan} — {bawahan.divisi}</div>
                </div>
              </div>
              <span className={`badge ${pendingPeers.length > 0 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                {pendingPeers.length > 0 ? `${pendingPeers.length} Menunggu` : 'Semua Diproses'}
              </span>
            </div>
            
            <div className="table-wrapper mb-16">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Penilai Diajukan</th>
                    <th>Hubungan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bawahan.dinilai.map((penilaian, idx) => (
                    <tr key={penilaian.id}>
                      <td>{idx + 1}</td>
                      <td>{penilaian.penilai.nama_lengkap}</td>
                      <td>
                        <span className="badge badge-outline" style={{textTransform: 'capitalize'}}>
                          {penilaian.tipe_relasi}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          penilaian.approval_status === 'disetujui' ? 'badge-success' :
                          penilaian.approval_status === 'ditolak' ? 'badge-danger' :
                          'badge-warning'
                        }`} style={{textTransform: 'capitalize'}}>
                          {penilaian.approval_status}
                        </span>
                      </td>
                      <td>
                        {penilaian.approval_status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <RejectButton penilaianId={penilaian.id} />
                            <ApproveButton penilaianId={penilaian.id} />
                          </div>
                        ) : (
                          <span className="text-sm text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {bawahanList.length === 0 && (
        <div className="card text-center text-muted py-32">
          Tidak ada bawahan yang mengajukan peer saat ini.
        </div>
      )}
    </main>
  );
}
