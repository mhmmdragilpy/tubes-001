import prisma from '@/lib/prisma';
import { calculateAllUserScores } from '@/lib/score-utils';
import { RekapClientUI } from './RekapClientUI';

export const dynamic = 'force-dynamic';

export default async function RekapPage() {
  const periodes = await prisma.periode.findMany({ orderBy: { tanggal_mulai: 'desc' } });
  const activePeriode = periodes.find(p => p.is_active);

  const allScores = await calculateAllUserScores(activePeriode?.id || null);

  const totalResponden = allScores.length;
  const selesaiCount = allScores.filter(s => s.status === 'Selesai').length;
  
  const scoredUsers = allScores.filter(s => s.scores.avgScore !== null);
  const companyAvg = scoredUsers.length > 0
    ? (scoredUsers.reduce((a, s) => a + s.scores.avgScore, 0) / scoredUsers.length).toFixed(1)
    : '0.0';

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
        <h1 className="page-title">Rekap Hasil Penilaian 360°</h1>
      </div>

      <div className="stat-cards cols-3">
        <div className="stat-card primary">
          <div className="stat-label">Total Responden</div>
          <div className="stat-value">{totalResponden}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Rata-rata Skor Perusahaan</div>
          <div className="stat-value">{companyAvg}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Penilaian Selesai</div>
          <div className="stat-value">{selesaiCount}</div>
        </div>
      </div>

      <RekapClientUI tableData={tableData} periodes={periodes} activePeriodeId={activePeriode?.id} />
    </main>
  );
}
