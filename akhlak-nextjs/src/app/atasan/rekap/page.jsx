import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { calculateUserScores } from '@/lib/score-utils';
import { RekapClientUI } from '../../admin-hr/rekap/RekapClientUI'; // Reuse for filtering and export

export const dynamic = 'force-dynamic';

export default async function AtasanRekapPage() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  const userId = userIdCookie ? parseInt(userIdCookie.value, 10) : 3;

  const bawahan = await prisma.user.findMany({
    where: { atasan_id: userId }
  });
  
  const periodes = await prisma.periode.findMany({ orderBy: { tanggal_mulai: 'desc' } });
  const activePeriode = periodes.find(p => p.is_active);

  const allScores = [];
  for (const b of bawahan) {
    const scores = await calculateUserScores(b.id, activePeriode?.id || null);
    
    const allPenilaian = await prisma.penilaian.count({
      where: {
        dinilai_id: b.id,
        ...(activePeriode ? { periode_id: activePeriode.id } : {})
      }
    });
    const selesaiPenilaian = await prisma.penilaian.count({
      where: {
        dinilai_id: b.id,
        status: 'selesai',
        ...(activePeriode ? { periode_id: activePeriode.id } : {})
      }
    });

    const status = allPenilaian === 0 ? 'Belum' : (selesaiPenilaian === allPenilaian ? 'Selesai' : 'Proses');

    allScores.push({ user: b, scores, status });
  }

  const scoredUsers = allScores.filter(s => s.scores.avgScore !== null);
  
  const teamAvg = scoredUsers.length > 0 
    ? (scoredUsers.reduce((acc, curr) => acc + curr.scores.avgScore, 0) / scoredUsers.length).toFixed(1) 
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

      <div className="stat-cards cols-3">
        <div className="stat-card primary">
          <div className="stat-label">Rata-rata Skor Tim</div>
          <div className="stat-value">{teamAvg}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Skor Tertinggi</div>
          <div className="stat-value">{maxScore}</div>
          <div className="stat-sub neutral">{topUser ? topUser.user.nama_lengkap : '—'}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Skor Terendah</div>
          <div className="stat-value">{minScore}</div>
          <div className="stat-sub neutral">{bottomUser ? bottomUser.user.nama_lengkap : '—'}</div>
        </div>
      </div>

      <RekapClientUI tableData={tableData} periodes={periodes} />
    </main>
  );
}
