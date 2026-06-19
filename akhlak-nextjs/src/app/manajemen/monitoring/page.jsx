import prisma from '@/lib/prisma';
import { calculateAllUserScores } from '@/lib/score-utils';

export const dynamic = 'force-dynamic';

export default async function MonitoringPage() {
  const users = await prisma.user.findMany({ where: { role: { not: 'admin_hr' } } });
  const totalUsers = users.length;
  
  const allScores = await calculateAllUserScores();
  
  const selesaiCount = allScores.filter(s => s.status === 'Selesai').length;
  const prosesCount = allScores.filter(s => s.status === 'Proses').length;
  const belumCount = allScores.filter(s => s.status === 'Belum').length;

  const partisipasi = totalUsers > 0 ? Math.round((selesaiCount / totalUsers) * 100) : 0;
  
  // Calculate per-divisi progress
  const divisiProgress = {};
  allScores.forEach(s => {
    const d = s.user.divisi;
    if (!divisiProgress[d]) divisiProgress[d] = { total: 0, selesai: 0 };
    divisiProgress[d].total += 1;
    if (s.status === 'Selesai') divisiProgress[d].selesai += 1;
  });
  const divisiData = Object.entries(divisiProgress).map(([name, data]) => ({
    name,
    pct: Math.round((data.selesai / data.total) * 100)
  })).sort((a, b) => b.pct - a.pct);

  // Split divisi data into two columns for display
  const mid = Math.ceil(divisiData.length / 2);
  const col1 = divisiData.slice(0, mid);
  const col2 = divisiData.slice(mid);

  // Top priority (Belum selesai)
  const priorityList = allScores.filter(s => s.status !== 'Selesai').sort((a, b) => {
    if (a.status === 'Belum' && b.status !== 'Belum') return -1;
    if (a.status !== 'Belum' && b.status === 'Belum') return 1;
    return 0;
  });

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Monitoring Tingkat Partisipasi</h1>
        <div className="page-actions">
          <select className="form-select" style={{ width: 'auto' }}>
            <option>Semester 1 — 2026</option>
          </select>
        </div>
      </div>

      {/* Global Progress */}
      <div className="card mb-24" style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', color: '#FFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Target Partisipasi Perusahaan (KPI: 80%)</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{partisipasi}%</div>
        </div>
        <div className="progress-bar" style={{ height: '12px', background: 'rgba(255,255,255,0.2)' }}>
          <div className="progress-fill" style={{ width: `${partisipasi}%`, background: '#FFF', borderRadius: '6px' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', opacity: 0.8 }}>
          <span>0%</span>
          <span>{partisipasi >= 80 ? 'Target Tercapai!' : 'Menuju Target'}</span>
          <span>100%</span>
        </div>
      </div>

      <div className="stat-cards cols-3 mb-24">
        <div className="stat-card success">
          <div className="stat-label">Selesai Menilai</div>
          <div className="stat-value">{selesaiCount}</div>
          <div className="stat-sub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> {partisipasi}% dari total
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Dalam Proses</div>
          <div className="stat-value">{prosesCount}</div>
          <div className="stat-sub neutral" style={{ color: 'var(--text-main)' }}>{totalUsers > 0 ? Math.round((prosesCount / totalUsers) * 100) : 0}% dari total</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Belum Mulai</div>
          <div className="stat-value">{belumCount}</div>
          <div className="stat-sub negative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg> {totalUsers > 0 ? Math.round((belumCount / totalUsers) * 100) : 0}% dari total
          </div>
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-title mb-16">Progress Bar per Divisi</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {col1.map(d => {
              const color = d.pct === 100 ? 'var(--success)' : d.pct < 75 ? 'var(--danger)' : undefined;
              return (
                <div key={d.name}>
                  <div className="progress-label"><span>{d.name}</span><span style={{ color, fontWeight: d.pct === 100 ? 700 : 400 }}>{d.pct}% {d.pct === 100 ? '✓' : ''}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${d.pct}%`, ...(color ? { background: color } : {}) }}></div></div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {col2.map(d => {
              const color = d.pct === 100 ? 'var(--success)' : d.pct < 75 ? 'var(--danger)' : undefined;
              return (
                <div key={d.name}>
                  <div className="progress-label"><span>{d.name}</span><span style={{ color, fontWeight: d.pct === 100 ? 700 : 400 }}>{d.pct}% {d.pct === 100 ? '✓' : ''}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${d.pct}%`, ...(color ? { background: color } : {}) }}></div></div>
                </div>
              );
            })}
          </div>
        </div>
        {divisiData.length === 0 && <p className="text-muted text-center py-16">Belum ada data divisi.</p>}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Daftar Karyawan Belum Selesai (Top Priority)</div>
          <button className="btn btn-sm btn-outline">Lihat Semua Karyawan</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Nama Karyawan</th><th>Divisi</th><th>Jabatan</th><th>Status Penilaian</th></tr>
            </thead>
            <tbody>
              {priorityList.slice(0, 10).map(s => (
                <tr key={s.user.id}>
                  <td><div style={{ fontWeight: 600 }}>{s.user.nama_lengkap}</div><div className="text-xs text-muted">{s.user.nip}</div></td>
                  <td>{s.user.divisi}</td><td>{s.user.jabatan}</td>
                  <td>
                    <span className={`badge ${s.status === 'Proses' ? 'badge-warning' : 'badge-danger'}`}>
                      {s.status === 'Belum' ? 'Belum Mulai' : 'Proses'}
                    </span>
                  </td>
                </tr>
              ))}
              {priorityList.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-24">Semua karyawan telah selesai melakukan penilaian.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
