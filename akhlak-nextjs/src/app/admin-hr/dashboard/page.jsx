import prisma from '@/lib/prisma';
import { calculateAllUserScores } from '@/lib/score-utils';
import { BulkReminderButton } from './DashboardClientUI';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const totalKaryawan = await prisma.user.count({ where: { role: 'karyawan' } });
  
  const totalPenilaian = await prisma.penilaian.count();
  const selesaiPenilaian = await prisma.penilaian.count({ where: { status: 'selesai' } });
  const prosesPenilaian = await prisma.penilaian.count({ where: { status: 'proses' } });
  const belumPenilaian = await prisma.penilaian.count({ where: { status: 'belum' } });

  const persenSelesai = totalPenilaian > 0 ? Math.round((selesaiPenilaian / totalPenilaian) * 100) : 0;

  // Recent activity
  const recentActivity = await prisma.penilaian.findMany({
    where: { status: 'selesai' },
    orderBy: { created_at: 'desc' },
    take: 3,
    include: { penilai: true, dinilai: true }
  });

  // Calculate per-divisi progress and users to remind
  const allScores = await calculateAllUserScores();
  
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

  // Users who haven't finished their assessments
  const usersToRemind = allScores
    .filter(s => s.status !== 'Selesai')
    .map(s => s.user.id);

  return (
    <main className="main-content">
      <div className="welcome-bar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="welcome-title">Selamat Datang, Admin HR</div>
            <div className="welcome-sub">Ringkasan Sistem Penilaian 360° AKHLAK — Semester 1 2026</div>
          </div>
          <BulkReminderButton targetUserIds={usersToRemind} />
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card primary">
          <div className="stat-label">Total Karyawan</div>
          <div className="stat-value">{totalKaryawan}</div>
          <div className="stat-sub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
            </svg> Terdaftar di Sistem
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-label">Penilaian Selesai</div>
          <div className="stat-value">{selesaiPenilaian}</div>
          <div className="stat-sub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
            </svg> {persenSelesai}% dari target
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-label">Sedang Proses</div>
          <div className="stat-value">{prosesPenilaian}</div>
          <div className="stat-sub neutral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg> Menunggu submit
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Belum Mulai</div>
          <div className="stat-value">{belumPenilaian}</div>
          <div className="stat-sub negative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
            </svg> Perlu reminder
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Aktivitas Terkini (Real-time)</div>
            <a href="#" className="btn btn-sm btn-outline">Lihat Semua</a>
          </div>
          
          {recentActivity.length === 0 && (
            <p className="text-muted" style={{padding: '16px 0'}}>Belum ada aktivitas penilaian.</p>
          )}

          {recentActivity.map((act) => (
            <div key={act.id} className="team-row">
              <span className="avatar avatar-sm">{act.penilai.nama_lengkap.substring(0,2).toUpperCase()}</span>
              <div className="team-info">
                <div className="team-name">{act.penilai.nama_lengkap}</div>
                <div className="team-sub">Menyelesaikan penilaian untuk {act.dinilai.nama_lengkap} ({act.tipe_relasi})</div>
              </div>
              <span className="text-xs text-muted">Baru saja</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Progres per Divisi</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {divisiData.map(d => {
              const color = d.pct === 100 ? 'var(--success)' : d.pct < 75 ? 'var(--danger)' : undefined;
              return (
                <div key={d.name} className="h-bar-item">
                  <span className="h-bar-label">{d.name}</span>
                  <div className="h-bar-track"><div className="h-bar-fill" style={{ width: `${d.pct}%`, ...(color ? { background: color } : {}) }}></div></div>
                  <span className="h-bar-value" style={color ? { color } : {}}>{d.pct}%</span>
                </div>
              );
            })}
            {divisiData.length === 0 && <p className="text-muted">Belum ada data progres divisi.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
