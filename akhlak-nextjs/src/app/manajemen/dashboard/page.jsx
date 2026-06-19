import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { calculateAllUserScores } from '@/lib/score-utils';

export const dynamic = 'force-dynamic';

export default async function ManajemenDashboard() {
  const cookieStore = await cookies();

  const users = await prisma.user.findMany({ where: { role: { not: 'admin_hr' } } });
  const totalUsers = users.length;

  const penilaianSelesai = await prisma.penilaian.count({ where: { status: 'selesai' } });
  const totalPenilaian = await prisma.penilaian.count();
  const partisipasi = totalPenilaian > 0 ? Math.round((penilaianSelesai / totalPenilaian) * 100) : 0;

  const allScores = await calculateAllUserScores();
  const scoredUsers = allScores.filter(s => s.scores.avgScore !== null);
  const companyAvg = scoredUsers.length > 0
    ? (scoredUsers.reduce((a, s) => a + s.scores.avgScore, 0) / scoredUsers.length).toFixed(1)
    : '0.0';

  const top5 = scoredUsers.slice(0, 5);
  const bottom5 = scoredUsers.slice(-5).reverse();

  // Calculate per-category averages for radar chart
  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
  const catAvgs = {};
  categories.forEach(c => {
    const vals = scoredUsers.filter(s => s.scores[c] !== null).map(s => s.scores[c]);
    catAvgs[c] = vals.length > 0 ? (vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : '—';
  });

  // Per-divisi averages
  const divisiScores = {};
  scoredUsers.forEach(s => {
    const d = s.user.divisi;
    if (!divisiScores[d]) divisiScores[d] = { total: 0, count: 0 };
    divisiScores[d].total += s.scores.avgScore;
    divisiScores[d].count += 1;
  });
  const divisiAvgs = Object.entries(divisiScores).map(([name, data]) => ({
    name, avg: (data.total / data.count).toFixed(1)
  })).sort((a, b) => b.avg - a.avg);

  return (
    <main className="main-content">
      <div className="welcome-bar" style={{ background: 'linear-gradient(135deg, var(--primary), #111827)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="welcome-title">Executive Analytics Dashboard</div>
            <div className="welcome-sub">Ringkasan Evaluasi 360° Core Values AKHLAK — Semester 1 2026</div>
          </div>
        </div>
      </div>

      <div className="stat-cards cols-4 mb-24">
        <div className="stat-card">
          <div className="stat-label">Total Partisipan</div>
          <div className="stat-value">{totalUsers}</div>
          <div className="stat-sub neutral">Total Karyawan Aktif</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-label">Tingkat Partisipasi</div>
          <div className="stat-value">{partisipasi}%</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Rata-rata Skor Perusahaan</div>
          <div className="stat-value">{companyAvg}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Rata-rata Gap (Self vs Others)</div>
          <div className="stat-value">—</div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Distribusi Skor Rata-rata per Divisi</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {divisiAvgs.map(d => {
              const pct = (parseFloat(d.avg) / 5) * 100;
              const color = parseFloat(d.avg) >= 4.0 ? 'var(--success)' : parseFloat(d.avg) >= 3.5 ? undefined : 'var(--danger)';
              return (
                <div key={d.name} className="h-bar-item">
                  <span className="h-bar-label">{d.name}</span>
                  <div className="h-bar-track"><div className="h-bar-fill" style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }}></div></div>
                  <span className="h-bar-value" style={color ? { color } : {}}>{d.avg}</span>
                </div>
              );
            })}
            {divisiAvgs.length === 0 && <p className="text-muted">Belum ada data skor.</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-title mb-16" style={{ textAlign: 'center' }}>Radar Chart Rata-rata Core Values AKHLAK</div>
          <svg viewBox="0 0 300 260" style={{ width: '100%', maxWidth: '280px', margin: '0 auto', display: 'block' }}>
            <polygon points="150,30 250,80 250,180 150,230 50,180 50,80" fill="none" stroke="var(--border)" strokeWidth="1"/>
            <polygon points="150,60 220,95 220,165 150,200 80,165 80,95" fill="none" stroke="var(--border-focus)" strokeWidth="0.5" strokeDasharray="4"/>
            <polygon points="150,45 235,88 240,172 150,215 65,175 55,82" fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="2"/>
            {[
              { x: 150, y: 20, label: `Amanah (${catAvgs.Amanah})` },
              { x: 260, y: 78, label: `Kompeten (${catAvgs.Kompeten})` },
              { x: 260, y: 185, label: `Harmonis (${catAvgs.Harmonis})` },
              { x: 150, y: 248, label: `Loyal (${catAvgs.Loyal})` },
              { x: 40, y: 185, label: `Adaptif (${catAvgs.Adaptif})` },
              { x: 40, y: 78, label: `Kolaboratif (${catAvgs.Kolaboratif})` },
            ].map((t, i) => (
              <text key={i} x={t.x} y={t.y} textAnchor={t.x > 150 ? 'start' : t.x < 150 ? 'end' : 'middle'} fontSize="11" fill="var(--primary)" fontWeight="700">{t.label}</text>
            ))}
          </svg>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="card-title mb-16" style={{ color: 'var(--success)' }}>🌟 Top 5 Performers (High Potential)</div>
          {top5.map((s, i) => (
            <div key={s.user.id} className="team-row" style={{ padding: '12px 0', ...(i === top5.length - 1 ? { border: 'none' } : {}) }}>
              <span style={{ fontWeight: 700, width: '24px', color: 'var(--text-muted)' }}>{i + 1}.</span>
              <span className="avatar avatar-sm">{s.user.nama_lengkap.substring(0, 2).toUpperCase()}</span>
              <div className="team-info"><div className="team-name">{s.user.nama_lengkap}</div><div className="team-sub">{s.user.divisi}</div></div>
              <strong style={{ color: 'var(--success)', fontSize: '16px' }}>{s.scores.avgScore}</strong>
            </div>
          ))}
          {top5.length === 0 && <p className="text-muted">Belum ada data.</p>}
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
          <div className="card-title mb-16" style={{ color: 'var(--danger)' }}>⚠️ Bottom 5 Performers (Need Improvement)</div>
          {bottom5.map((s, i) => (
            <div key={s.user.id} className="team-row" style={{ padding: '12px 0', ...(i === bottom5.length - 1 ? { border: 'none' } : {}) }}>
              <span style={{ fontWeight: 700, width: '24px', color: 'var(--text-muted)' }}>{i + 1}.</span>
              <span className="avatar avatar-sm">{s.user.nama_lengkap.substring(0, 2).toUpperCase()}</span>
              <div className="team-info"><div className="team-name">{s.user.nama_lengkap}</div><div className="team-sub">{s.user.divisi}</div></div>
              <strong style={{ color: 'var(--danger)', fontSize: '16px' }}>{s.scores.avgScore}</strong>
            </div>
          ))}
          {bottom5.length === 0 && <p className="text-muted">Belum ada data.</p>}
        </div>
      </div>
    </main>
  );
}
