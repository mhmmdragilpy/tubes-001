import prisma from '@/lib/prisma';
import { calculateAllUserScores } from '@/lib/score-utils';
import { RekapClientUI } from '../../admin-hr/rekap/RekapClientUI'; // Reuse component

export const dynamic = 'force-dynamic';

export default async function ManajemenRekapPage() {
  const periodes = await prisma.periode.findMany({ orderBy: { tanggal_mulai: 'desc' } });
  const activePeriode = periodes.find(p => p.is_active);

  const allScores = await calculateAllUserScores(activePeriode?.id || null);

  const totalResponden = allScores.length;
  const selesaiCount = allScores.filter(s => s.status === 'Selesai').length;
  
  const scoredUsers = allScores.filter(s => s.scores.avgScore !== null);
  const companyAvg = scoredUsers.length > 0
    ? (scoredUsers.reduce((a, s) => a + s.scores.avgScore, 0) / scoredUsers.length).toFixed(1)
    : '0.0';

  const maxScore = scoredUsers.length > 0 ? Math.max(...scoredUsers.map(s => s.scores.avgScore)).toFixed(1) : '—';
  const minScore = scoredUsers.length > 0 ? Math.min(...scoredUsers.map(s => s.scores.avgScore)).toFixed(1) : '—';

  const topUser = scoredUsers.find(s => s.scores.avgScore.toFixed(1) === maxScore);
  const bottomUser = scoredUsers.find(s => s.scores.avgScore.toFixed(1) === minScore);

  // Serialize for client
  const tableData = allScores.map(s => ({
    id: s.user.id,
    nama: s.user.nama_lengkap,
    nip: s.user.nip,
    divisi: s.user.divisi,
    jabatan: s.user.jabatan,
    A: s.scores.Amanah,
    K1: s.scores.Kompeten,
    H: s.scores.Harmonis,
    L: s.scores.Loyal,
    A2: s.scores.Adaptif,
    K2: s.scores.Kolaboratif,
    avg: s.scores.avgScore,
    status: s.status
  }));

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Histori Penilaian</h1>
      </div>

      <div className="stat-cards mb-24">
        <div className="stat-card">
          <div className="stat-label">Total Responden</div>
          <div className="stat-value">{totalResponden}</div>
          <div className="stat-sub neutral">Karyawan Aktif</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-label">Rata-rata Perusahaan</div>
          <div className="stat-value">{companyAvg}</div>
          <div className="stat-sub success">Cukup Baik</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Skor Tertinggi</div>
          <div className="stat-value">{maxScore}</div>
          <div className="stat-sub neutral">{topUser ? `${topUser.user.nama_lengkap} (${topUser.user.divisi})` : '—'}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Skor Terendah</div>
          <div className="stat-value">{minScore}</div>
          <div className="stat-sub neutral">{bottomUser ? `${bottomUser.user.nama_lengkap} (${bottomUser.user.divisi})` : '—'}</div>
        </div>
      </div>

      <RekapClientUI tableData={tableData} periodes={periodes} />
    </main>
  );
}
