import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { calculateUserScores } from '@/lib/score-utils';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

function getRadarPoints(scores) {
  const cx = 150;
  const cy = 130;
  const maxR = 100;
  const angles = [
    -Math.PI / 2,         // Amanah (Up)
    -Math.PI / 6,         // Kompeten (Up-Right)
    Math.PI / 6,          // Harmonis (Down-Right)
    Math.PI / 2,          // Loyal (Down)
    5 * Math.PI / 6,      // Adaptif (Down-Left)
    -5 * Math.PI / 6,     // Kolaboratif (Up-Left)
  ];
  
  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
  
  const points = angles.map((angle, idx) => {
    const cat = categories[idx];
    const val = parseFloat(scores[cat]) || 0;
    const r = (val / 5) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  
  return points.join(' ');
}

export default async function AtasanDashboard() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  
  let userId = null;
  if (tokenCookie) {
    const payload = await verifyToken(tokenCookie.value);
    if (payload) userId = payload.userId;
  }

  if (!userId) {
    // Redirect to login if not authenticated
    return null; 
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  const bawahan = await prisma.user.findMany({
    where: { atasan_id: userId }
  });

  const totalBawahan = bawahan.length;

  const bawahanIds = bawahan.map(b => b.id);
  
  // Find penilaian directed AT bawahan BY this atasan for the ACTIVE periode
  const penilaianKeBawahan = await prisma.penilaian.findMany({
    where: {
      penilai_id: userId,
      dinilai_id: { in: bawahanIds },
      tipe_relasi: 'bawahan',
      periode: {
        is_active: true
      }
    },
    include: { dinilai: true, periode: true }
  });

  const selesai = penilaianKeBawahan.filter(p => p.status === 'selesai').length;
  const belum = penilaianKeBawahan.filter(p => p.status !== 'selesai').length;
  const persenSelesai = totalBawahan > 0 ? Math.round((selesai / totalBawahan) * 100) : 0;
  
  const pendingPeers = await prisma.penilaian.findMany({
    where: {
      dinilai_id: { in: bawahanIds },
      tipe_relasi: 'peer',
      approval_status: 'pending'
    },
    include: { dinilai: true, penilai: true }
  });
  const pendingCount = pendingPeers.length;

  // Get scores for all subordinates
  const subordinateScores = [];
  for (const b of bawahan) {
    const scores = await calculateUserScores(b.id);
    subordinateScores.push({
      user: b,
      scores: scores
    });
  }

  // Filter out those that have no score yet
  const scoredSubordinates = subordinateScores.filter(s => s.scores.avgScore !== null);

  // Team average score
  const teamAvg = scoredSubordinates.length > 0
    ? (scoredSubordinates.reduce((a, s) => a + s.scores.avgScore, 0) / scoredSubordinates.length).toFixed(1)
    : '0.0';

  // Team average percentage for progress bar (avgScore is out of 5)
  const teamAvgPct = scoredSubordinates.length > 0
    ? Math.round((parseFloat(teamAvg) / 5) * 100)
    : 0;

  // Rekap Indikator AKHLAK for subordinates
  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
  const teamCatAvgs = {};
  categories.forEach(c => {
    const vals = scoredSubordinates.filter(s => s.scores[c] !== null).map(s => s.scores[c]);
    teamCatAvgs[c] = vals.length > 0 ? (vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : '—';
  });

  // Sort subordinates by score to find Top Performers
  const topPerformers = [...scoredSubordinates].sort((a, b) => (b.scores.avgScore || 0) - (a.scores.avgScore || 0));

  return (
    <main className="main-content">
      {/* Welcome Bar with Gradient like Manajemen */}
      <div className="welcome-bar" style={{ background: 'linear-gradient(135deg, var(--primary), #111827)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="welcome-title">Dashboard Analitik Tim</div>
            <div className="welcome-sub">Evaluasi 360° Core Values AKHLAK — Semester 1 2026 | Manajer: {user?.nama_lengkap}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-cards cols-3 mb-24">
        <div className="stat-card primary">
          <div className="stat-label">Total Bawahan Langsung</div>
          <div className="stat-value">{totalBawahan}</div>
          <div className="stat-sub">Anggota tim aktif</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Penilaian Selesai</div>
          <div className="stat-value">{selesai}</div>
          <div className="stat-sub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
            </svg> {persenSelesai}% selesai
          </div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Rata-rata Nilai Tim</div>
          <div className="stat-value">{teamAvg}</div>
          <div className="stat-sub" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${teamAvgPct}%`, height: '100%', background: 'var(--success)' }}></div>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Skor skala 1.0 - 5.0</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts (Horizontal Bars & Radar Chart like Manajemen) */}
      <div className="grid-2 mb-24">
        {/* Distribusi Skor Rata-rata Bawahan */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Distribusi Skor Rata-rata Bawahan</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {subordinateScores.map(s => {
              const score = s.scores.avgScore;
              const hasScore = score !== null;
              const displayScore = hasScore ? score.toFixed(1) : '—';
              const pct = hasScore ? (score / 5) * 100 : 0;
              const color = hasScore 
                ? (score >= 4.0 ? 'var(--success)' : score >= 3.5 ? undefined : 'var(--danger)')
                : 'var(--text-muted)';
              return (
                <div key={s.user.id} className="h-bar-item">
                  <span className="h-bar-label" style={{ fontWeight: 500 }}>
                    {s.user.nama_lengkap} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({s.user.jabatan})</span>
                  </span>
                  <div className="h-bar-track">
                    <div className="h-bar-fill" style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }}></div>
                  </div>
                  <span className="h-bar-value" style={color ? { color } : {}}>{displayScore}</span>
                </div>
              );
            })}
            {subordinateScores.length === 0 && (
              <p className="text-muted" style={{ padding: '16px 0' }}>Belum ada data skor.</p>
            )}
          </div>
        </div>

        {/* Radar Chart Rata-rata Core Values AKHLAK */}
        <div className="card">
          <div className="card-title mb-16" style={{ textAlign: 'center' }}>Radar Chart Rata-rata Core Values AKHLAK Tim</div>
          <svg viewBox="0 0 300 260" style={{ width: '100%', maxWidth: '280px', margin: '0 auto', display: 'block' }}>
            <polygon points="150,30 250,80 250,180 150,230 50,180 50,80" fill="none" stroke="var(--border)" strokeWidth="1"/>
            <polygon points="150,60 220,95 220,165 150,200 80,165 80,95" fill="none" stroke="var(--border-focus)" strokeWidth="0.5" strokeDasharray="4"/>
            <polygon points={getRadarPoints(teamCatAvgs)} fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="2"/>
            {[
              { x: 150, y: 20, label: 'Amanah' },
              { x: 260, y: 78, label: 'Kompeten' },
              { x: 260, y: 185, label: 'Harmonis' },
              { x: 150, y: 248, label: 'Loyal' },
              { x: 40, y: 185, label: 'Adaptif' },
              { x: 40, y: 78, label: 'Kolaboratif' },
            ].map((t, idx) => {
              const labels = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
              const label = `${labels[idx]} (${teamCatAvgs[labels[idx]] || '—'})`;
              return (
                <text key={idx} x={t.x} y={t.y} textAnchor={t.x > 150 ? 'start' : t.x < 150 ? 'end' : 'middle'} fontSize="11" fill="var(--primary)" fontWeight="700">{label}</text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Operational Actions & Details - 3 Column Grid */}
      <div className="grid-3">
        {/* Tim Progress */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ fontSize: '14px' }}>Progres Penilaian Tim</div>
            <Link href="/atasan/form-penilaian" className="btn btn-sm btn-outline">Lihat Semua</Link>
          </div>
          
          {penilaianKeBawahan.length === 0 && (
            <p className="text-muted" style={{padding: '16px 0'}}>Belum ada daftar bawahan untuk dinilai.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {penilaianKeBawahan.map(p => {
              let progress = 0;
              let badgeClass = 'badge-danger';
              let statusText = 'Belum';
              
              if (p.status === 'selesai') {
                progress = 100;
                badgeClass = 'badge-success';
                statusText = 'Selesai';
              } else if (p.status === 'proses') {
                progress = 50;
                badgeClass = 'badge-warning';
                statusText = 'Proses';
              }

              return (
                <div key={p.id} className="team-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
                  <span className="avatar avatar-sm" style={{ marginRight: '8px' }}>{p.dinilai.nama_lengkap.substring(0, 2).toUpperCase()}</span>
                  <div className="team-info" style={{ flex: 1 }}>
                    <div className="team-name" style={{ fontSize: '13px', fontWeight: 600 }}>{p.dinilai.nama_lengkap}</div>
                    <div className="team-sub" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.dinilai.jabatan}</div>
                  </div>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '10px' }}>{statusText}</span>
                </div>
              );
            })}
          </div>
          
          {belum > 0 && (
            <Link href="/atasan/form-penilaian">
              <button className="btn btn-primary mt-16" style={{ width: '100%', justifyContent: 'center' }}>
                Lanjutkan Penilaian ({belum} tersisa)
              </button>
            </Link>
          )}
        </div>

        {/* Top Performer Tim */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ fontSize: '14px' }}>🏆 Top Performer Tim</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {topPerformers.slice(0, 3).map((p, idx) => (
              <div key={p.user.id} className="team-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: idx < topPerformers.slice(0, 3).length - 1 ? '1px dashed var(--border)' : 'none' }}>
                <div style={{ width: '28px', height: '28px', background: idx === 0 ? 'gold' : idx === 1 ? 'silver' : '#cd7f32', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{p.user.nama_lengkap}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.user.jabatan}</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)' }}>{p.scores.avgScore}</div>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <div className="text-sm text-muted" style={{ padding: '32px 0', textAlign: 'center' }}>
                Belum ada data penilaian bawahan yang selesai.
              </div>
            )}
          </div>
        </div>

        {/* Approval Pending */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <div className="card-title" style={{ fontSize: '14px' }}>Approval Peer</div>
            <span className={`badge ${pendingCount > 0 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '10px' }}>
              {pendingCount} Menunggu
            </span>
          </div>
          <div className="text-sm text-muted mb-16">Pengajuan penilai peer bawahan.</div>
          
          {pendingPeers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }} className="text-muted">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3, marginBottom: '8px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p style={{ fontSize: '12px' }}>Tidak ada pengajuan peer.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingPeers.slice(0, 2).map(p => (
                <div key={p.id} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{p.dinilai.nama_lengkap}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mengajukan: {p.penilai.nama_lengkap}</div>
                </div>
              ))}
              {pendingPeers.length > 2 && (
                <div className="text-xs text-center text-muted">+{pendingPeers.length - 2} pengajuan lainnya</div>
              )}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Link href="/atasan/approval" className="btn btn-sm btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Proses Approval &rarr;</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

