import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';
import { calculateUserScores } from '@/lib/score-utils';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export default async function KaryawanDashboard() {
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

  // Find tasks where this user is the penilai AND period is active
  const penilaianTugas = await prisma.penilaian.findMany({
    where: { 
      penilai_id: userId,
      periode: {
        is_active: true
      }
    },
    include: { dinilai: true, periode: true }
  });

  const totalTugas = penilaianTugas.length;
  const tugasSelesai = penilaianTugas.filter(p => p.status === 'selesai').length;
  const progress = totalTugas > 0 ? Math.round((tugasSelesai / totalTugas) * 100) : 0;

  // Get real AKHLAK scores
  const lastScores = await calculateUserScores(userId);
  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];

  return (
    <main className="main-content">
      {/* Welcome Banner */}
      <div className="welcome-bar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="welcome-title">Halo, {user?.nama_lengkap || 'Karyawan'}!</div>
            <div className="welcome-sub">NIP: {user?.nip} | {user?.divisi} — {user?.jabatan}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Status Penilaian Saat Ini:</div>
            <span className="badge" style={{ background: '#FFF', color: 'var(--primary)', fontSize: '14px', fontWeight: 700 }}>
              Periode Aktif (Sisa 5 Hari)
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-cards cols-3 mb-24">
        <div className="stat-card">
          <div className="stat-label">Skor AKHLAK Terakhir</div>
          <div className="stat-value">{lastScores.avgScore ?? '—'}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/5.0</span></div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Tugas Penilaian Anda</div>
          <div className="stat-value">{tugasSelesai}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/{totalTugas} Selesai</span></div>
          <div className="stat-sub neutral" style={{ color: 'var(--text-main)' }}>Progres: {progress}%</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Persetujuan Peer</div>
          <div className="stat-value" style={{ fontSize: '24px', marginTop: '8px' }}>Disetujui</div>
          <div className="stat-sub success">
            <FiCheck size={16} /> Oleh Atasan
          </div>
        </div>
      </div>

      <div className="grid-55-45">
        {/* Tugas Penilaian */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Daftar Penilaian yang Harus Diisi</div>
          </div>
          
          {penilaianTugas.length === 0 && (
            <p className="text-muted" style={{ padding: '16px 0' }}>Tidak ada tugas penilaian saat ini.</p>
          )}

          {penilaianTugas.map(p => {
            const isSelesai = p.status === 'selesai';
            return (
              <div key={p.id} className="team-row" style={{ opacity: isSelesai ? 0.6 : 1 }}>
                {isSelesai ? (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✓</div>
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {p.dinilai.nama_lengkap.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="team-info">
                  <div className="team-name">{p.dinilai.nama_lengkap}</div>
                  <div className="team-sub">
                    <span className={`badge ${p.tipe_relasi === 'self' ? 'badge-primary' : 'badge-outline'}`} style={{ fontSize: '10px', padding: '2px 6px', marginRight: '4px', textTransform: 'capitalize' }}>
                      {p.tipe_relasi}
                    </span> 
                    {isSelesai ? 'Selesai' : `Deadline: ${new Date(p.periode.tanggal_selesai).toLocaleDateString('id-ID')}`}
                  </div>
                </div>
                {isSelesai ? (
                  <span className="text-sm" style={{ color: 'var(--success)', fontWeight: 600 }}>Selesai</span>
                ) : (
                  <Link href={`/karyawan/form-penilaian/${p.id}`}>
                    <button className="btn btn-sm btn-primary">Isi Sekarang</button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Radar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card-title" style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>Profil Nilai AKHLAK Terakhir</div>
          <svg viewBox="0 0 300 280" style={{ width: '100%', maxWidth: '260px' }}>
            <polygon points="150,30 250,80 250,180 150,230 50,180 50,80" fill="none" stroke="var(--border)" strokeWidth="1"/>
            <polygon points="150,60 220,95 220,165 150,200 80,165 80,95" fill="none" stroke="var(--border-focus)" strokeWidth="0.5" strokeDasharray="4"/>
            <polygon points="150,50 230,90 240,170 150,210 70,170 60,85" fill="var(--secondary)" fillOpacity="0.2" stroke="var(--secondary)" strokeWidth="2"/>
            
            {[
              { x: 150, y: 20, cat: 'Amanah' },
              { x: 260, y: 78, cat: 'Kompeten' },
              { x: 260, y: 188, cat: 'Harmonis' },
              { x: 150, y: 250, cat: 'Loyal' },
              { x: 40, y: 188, cat: 'Adaptif' },
              { x: 40, y: 78, cat: 'Kolaboratif' },
            ].map((t, i) => (
              <text key={i} x={t.x} y={t.y} textAnchor={t.x > 150 ? 'start' : t.x < 150 ? 'end' : 'middle'} fontSize="12" fill="var(--primary)" fontWeight="600">
                {t.cat} {lastScores[t.cat] ? `(${lastScores[t.cat]})` : ''}
              </text>
            ))}
          </svg>
          <Link href="/karyawan/hasil">
            <button className="btn btn-sm btn-outline mt-16">Lihat Hasil Detail</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
