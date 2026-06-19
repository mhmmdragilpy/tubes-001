import prisma from '@/lib/prisma';
import { AddPeriodeButton, ClosePeriodeButton, DetailPeriodeButton, EditPeriodeButton } from './PeriodeClientUI';

export const dynamic = 'force-dynamic';

export default async function PeriodePage() {
  const periodes = await prisma.periode.findMany({
    orderBy: {
      tanggal_mulai: 'desc'
    }
  });

  const activePeriode = periodes.find(p => p.is_active === true);
  const historyPeriodes = periodes.filter(p => p.is_active === false || p.is_active === null);

  // Calculate progress for active periode
  let activeProgress = 0;
  let activePeserta = 0;
  if (activePeriode) {
    const totalPenilaian = await prisma.penilaian.count({ where: { periode_id: activePeriode.id } });
    const selesaiPenilaian = await prisma.penilaian.count({ where: { periode_id: activePeriode.id, status: 'selesai' } });
    activeProgress = totalPenilaian > 0 ? Math.round((selesaiPenilaian / totalPenilaian) * 100) : 0;
    
    // Peserta = Karyawan
    activePeserta = await prisma.user.count({ where: { role: 'karyawan' } });
  }

  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Manajemen Periode Penilaian</h1>
        <AddPeriodeButton />
      </div>

      {activePeriode ? (
        <div className="card mb-24" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{activePeriode.nama_periode}</h2>
                <span className="badge badge-success">Aktif</span>
              </div>
              <div className="text-sm text-muted mb-16">
                {formatDate(activePeriode.tanggal_mulai)} — {formatDate(activePeriode.tanggal_selesai)}
              </div>
              <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                <div><strong>Kuesioner:</strong> Set Standard AKHLAK 2026</div>
                <div><strong>Peserta:</strong> {activePeserta} Karyawan</div>
                <div><strong>Status:</strong> Pengisian Penilaian</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <EditPeriodeButton periode={activePeriode} />
              <ClosePeriodeButton periodeId={activePeriode.id} />
            </div>
          </div>
          <div className="mt-24">
            <div className="progress-label"><span>Progres Keseluruhan</span><span>{activeProgress}%</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${activeProgress}%` }}></div></div>
          </div>
        </div>
      ) : (
        <div className="card mb-24" style={{ borderLeft: '4px solid var(--warning)', backgroundColor: '#fffbeb' }}>
          <div style={{ padding: '16px 0' }}>
            <h3 style={{color: '#b45309', marginBottom: '8px'}}>Tidak Ada Periode Aktif</h3>
            <p style={{color: '#92400e', fontSize: '14px'}}>Silakan buat periode penilaian baru untuk memulai evaluasi 360 derajat.</p>
          </div>
        </div>
      )}

      <h3 className="mb-16" style={{ fontSize: '16px', color: 'var(--primary)' }}>Riwayat Periode</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama Periode</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Peserta</th>
              <th>Avg Skor</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {historyPeriodes.map((p) => (
              <tr key={p.id}>
                <td style={{fontWeight: 500}}>{p.nama_periode}</td>
                <td>{formatDate(p.tanggal_mulai)}</td>
                <td>{formatDate(p.tanggal_selesai)}</td>
                <td>-</td>
                <td>-</td>
                <td>
                  <span className="badge badge-outline">Selesai</span>
                </td>
                <td><DetailPeriodeButton periode={p} /></td>
              </tr>
            ))}
            
            {historyPeriodes.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                  Belum ada riwayat periode sebelumnya.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
