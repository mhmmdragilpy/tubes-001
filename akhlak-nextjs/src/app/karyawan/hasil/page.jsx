import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { calculateUserScores, calculateScoresBySource } from '@/lib/score-utils';
import { FiDownload } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function HasilPage() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  const userId = userIdCookie ? parseInt(userIdCookie.value, 10) : 4;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const catScores = await calculateUserScores(userId);
  const sourceData = await calculateScoresBySource(userId);

  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
  const overallScore = catScores.avgScore ?? 0;
  const conicPercent = Math.round((overallScore / 5) * 100);

  const bobot = { atasan: 40, peer: 20, bawahan: 30, self: 10 };

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Hasil Penilaian AKHLAK</h1>
        <div className="page-actions">
          <select className="form-select" style={{width: 'auto'}}>
            <option>Semester 1 — 2026</option>
          </select>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="card mb-24" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="donut-chart" style={{ width: '140px', height: '140px', background: `conic-gradient(var(--accent) 0% ${conicPercent}%, rgba(255,255,255,0.2) ${conicPercent}% 100%)`, border: 'none', boxShadow: 'none' }}>
              <div className="donut-inner" style={{ width: '110px', height: '110px', background: 'var(--primary)', boxShadow: 'none' }}>
                <div className="donut-value" style={{ fontSize: '36px', color: '#FFF' }}>{overallScore || '—'}</div>
                <div className="donut-label" style={{ color: 'rgba(255,255,255,0.7)' }}>/5.0</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontWeight: 600 }}>Skor Keseluruhan</div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px' }}>Rincian Sumber Penilaian (Bobot)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['atasan', 'peer', 'bawahan', 'self'].map(src => (
                <div key={src} className="h-bar-item">
                  <span className="h-bar-label" style={{ color: '#FFF', textTransform: 'capitalize' }}>{src} ({bobot[src]}%)</span>
                  <div className="h-bar-track" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <div className="h-bar-fill" style={{ width: `${(sourceData[src] || 0) / 5 * 100}%`, background: 'var(--accent)' }}></div>
                  </div>
                  <span className="h-bar-value" style={{ color: '#FFF' }}>{sourceData[src] ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        {/* Skor per AKHLAK */}
        <div className="card">
          <div className="card-title mb-16">Skor per Nilai AKHLAK</div>
          <div className="h-bar-chart">
            {categories.map(cat => {
              const score = catScores[cat];
              const pct = score ? (score / 5) * 100 : 0;
              const color = score && score < 3.8 ? 'var(--warning)' : undefined;
              return (
                <div key={cat} className="h-bar-item">
                  <span className="h-bar-label">{cat}</span>
                  <div className="h-bar-track">
                    <div className="h-bar-fill" style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }}></div>
                  </div>
                  <span className="h-bar-value">{score ?? '—'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gap Analysis */}
        <div className="card">
          <div className="card-title mb-16">Gap Analysis (Self vs Others)</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Nilai AKHLAK</th><th>Self</th><th>Others</th><th>Gap</th></tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const gap = sourceData.gap?.[cat] || {};
                  const diff = gap.diff;
                  const isWarning = diff !== null && diff < -0.5;
                  return (
                    <tr key={cat} style={isWarning ? { background: 'var(--danger-bg)' } : {}}>
                      <td>{isWarning ? <strong>{cat}</strong> : cat}</td>
                      <td>{gap.self ?? '—'}</td>
                      <td>{gap.others ?? '—'}</td>
                      <td>
                        {diff !== null ? (
                          <span style={{ color: diff >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: isWarning ? 700 : 400 }}>
                            {diff > 0 ? '+' : ''}{diff}{isWarning ? ' ⚠' : ''}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-muted mt-16" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--danger)"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            Gap &gt; 0.5 (Self lebih tinggi) menandakan &quot;Blind Spot&quot; perlu diperbaiki.
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="card">
        <div className="card-title mb-16">Feedback Kualitatif (Anonim)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {sourceData.feedback && sourceData.feedback.length > 0 ? (
            sourceData.feedback.map((fb, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--success)' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '13px', marginBottom: '8px', textTransform: 'capitalize' }}>
                  Penilai #{i + 1} ({fb.tipe_relasi})
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.5 }}>&quot;{fb.catatan}&quot;</div>
              </div>
            ))
          ) : (
            <div className="text-muted" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '24px' }}>
              Belum ada feedback kualitatif.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
