import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { calculateUserScores } from '@/lib/score-utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RiwayatPage() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  const userId = userIdCookie ? parseInt(userIdCookie.value, 10) : 4;

  const periodes = await prisma.periode.findMany({ orderBy: { tanggal_mulai: 'desc' } });
  
  const historyData = [];
  for (const periode of periodes) {
    const scores = await calculateUserScores(userId, periode.id);
    if (scores.avgScore !== null || scores.totalPenilai > 0) {
      historyData.push({
        periode,
        scores,
        isSelesai: scores.avgScore !== null
      });
    }
  }

  // Determine trend for chart (take up to 3 most recent, reverse for chronological order)
  const chartData = historyData.slice(0, 3).reverse();

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Histori Penilaian</h1>
      </div>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <div className="card mb-24" style={{ background: 'linear-gradient(to bottom, #FFF, var(--bg-main))' }}>
          <div className="card-title mb-24">Grafik Tren Skor Akhir AKHLAK</div>
          <svg viewBox="0 0 600 220" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', display: 'block' }}>
            <rect x="70" y="20" width="480" height="150" fill="rgba(255,255,255,0.5)" rx="4"/>
            <line x1="70" y1="170" x2="550" y2="170" stroke="var(--border)" strokeWidth="1"/>
            <line x1="70" y1="120" x2="550" y2="120" stroke="var(--border-focus)" strokeWidth="0.5" strokeDasharray="4"/>
            <line x1="70" y1="70" x2="550" y2="70" stroke="var(--border-focus)" strokeWidth="0.5" strokeDasharray="4"/>
            <line x1="70" y1="20" x2="550" y2="20" stroke="var(--border-focus)" strokeWidth="0.5" strokeDasharray="4"/>
            
            <text x="55" y="174" textAnchor="end" fontSize="12" fill="var(--text-muted)" fontWeight="500">3.0</text>
            <text x="55" y="124" textAnchor="end" fontSize="12" fill="var(--text-muted)" fontWeight="500">3.5</text>
            <text x="55" y="74" textAnchor="end" fontSize="12" fill="var(--text-muted)" fontWeight="500">4.0</text>
            <text x="55" y="24" textAnchor="end" fontSize="12" fill="var(--text-muted)" fontWeight="500">4.5</text>
            
            {chartData.map((d, i) => {
              const x = 150 + (i * 160);
              return <text key={i} x={x} y="200" textAnchor="middle" fontSize="12" fill={i === chartData.length - 1 ? 'var(--primary)' : 'var(--text-main)'} fontWeight={i === chartData.length - 1 ? "700" : "600"}>{d.periode.nama_periode} {d.periode.tahun}</text>;
            })}
            
            {/* Very simple chart rendering. For production, a charting library like Recharts is recommended. */}
            <polyline points={chartData.map((d, i) => `${150 + (i * 160)},${170 - ((d.scores.avgScore - 3) * 100)}`).join(' ')} fill="none" stroke="var(--secondary)" strokeWidth="3"/>
            
            {chartData.map((d, i) => {
              const x = 150 + (i * 160);
              const y = 170 - ((d.scores.avgScore - 3) * 100);
              return (
                <g key={`point-${i}`}>
                  <circle cx={x} cy={y} r={i === chartData.length - 1 ? 8 : 6} fill={i === chartData.length - 1 ? 'var(--primary)' : '#FFF'} stroke={i === chartData.length - 1 ? '#FFF' : 'var(--secondary)'} strokeWidth="3"/>
                  {i === chartData.length - 1 ? (
                    <>
                      <rect x={x - 25} y={y - 35} width="50" height="22" rx="11" fill="var(--primary)"/>
                      <text x={x} y={y - 19} textAnchor="middle" fontSize="12" fill="#FFF" fontWeight="700">{d.scores.avgScore}</text>
                    </>
                  ) : (
                    <text x={x} y={y - 15} textAnchor="middle" fontSize="14" fill="var(--text-main)" fontWeight="700">{d.scores.avgScore}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* History Cards */}
      {historyData.map((d, i) => (
        <div key={d.periode.id} className="card mb-16" style={i === 0 ? { borderLeft: '4px solid var(--primary)' } : { opacity: 0.8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: i === 0 ? 'var(--primary)' : 'var(--text-main)' }}>{d.periode.nama_periode} — {d.periode.tahun}</div>
              <div className="text-sm text-muted" style={{ marginTop: '4px' }}>
                {new Date(d.periode.tanggal_mulai).toLocaleDateString('id-ID')} — {new Date(d.periode.tanggal_selesai).toLocaleDateString('id-ID')}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skor Akhir</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: i === 0 ? 'var(--primary)' : 'var(--text-main)', lineHeight: 1 }}>{d.scores.avgScore ?? '—'}</div>
              </div>
              {d.isSelesai ? (
                <span className={i === 0 ? "badge badge-success" : "badge badge-outline"}>Selesai</span>
              ) : (
                <span className="badge badge-warning">Proses</span>
              )}
            </div>
          </div>
          <div style={{ margin: '16px 0', padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', fontWeight: i === 0 ? 600 : 500, color: i === 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
            <span>Amanah: <span style={i === 0 ? { color: 'var(--primary)' } : {}}>{d.scores.Amanah ?? '-'}</span></span>
            <span>Kompeten: <span style={i === 0 ? { color: 'var(--primary)' } : {}}>{d.scores.Kompeten ?? '-'}</span></span>
            <span>Harmonis: <span style={i === 0 ? { color: 'var(--primary)' } : {}}>{d.scores.Harmonis ?? '-'}</span></span>
            <span>Loyal: <span style={i === 0 ? { color: 'var(--primary)' } : {}}>{d.scores.Loyal ?? '-'}</span></span>
            <span>Adaptif: <span style={i === 0 ? { color: 'var(--primary)' } : {}}>{d.scores.Adaptif ?? '-'}</span></span>
            <span>Kolaboratif: <span style={i === 0 ? { color: 'var(--primary)' } : {}}>{d.scores.Kolaboratif ?? '-'}</span></span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Link href={`/karyawan/hasil?periodeId=${d.periode.id}`} className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-outline'}`}>Lihat Detail Laporan →</Link>
          </div>
        </div>
      ))}

      {historyData.length === 0 && (
        <div className="card text-center text-muted py-32">
          Belum ada riwayat penilaian.
        </div>
      )}
    </main>
  );
}
