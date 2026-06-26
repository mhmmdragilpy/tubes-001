"use client";

import { useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';

export default function ExportPage({ periodes }) {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [selectedPeriode, setSelectedPeriode] = useState(periodes[0]?.id || '');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this would hit an API endpoint that generates a PDF or PPTX
      // For now, we simulate generation and download the CSV instead as a demonstration
      const res = await fetch('/api/export-manajemen', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodeId: selectedPeriode })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      alert("Gagal meng-generate laporan.");
    }

    setLoading(false);
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Generate Laporan Eksekutif</h1>
        <div className="text-sm text-muted">Hasilkan laporan komprehensif tingkat perusahaan untuk keperluan audit dan evaluasi direksi.</div>
      </div>

      <div className="grid-60-40">
        <div className="card">
          <div className="card-title mb-16">Konfigurasi Laporan</div>
          <form onSubmit={handleGenerate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Periode</label>
                <select 
                  className="form-select" 
                  value={selectedPeriode} 
                  onChange={(e) => {
                    setSelectedPeriode(e.target.value);
                    setDownloadUrl(null);
                  }}
                >
                  {periodes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama_periode} ({new Date(p.tanggal_mulai).getFullYear()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Format Output</label>
                <select className="form-select">
                  <option>Executive Summary (PDF)</option>
                  <option>Raw Data (Excel / CSV)</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Filter Divisi</label>
                <select className="form-select">
                  <option>Seluruh Perusahaan (Semua Divisi)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-16 mb-24" style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)' }}>Pilih Metrik untuk Disertakan:</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: '14px' }}>Ringkasan KPI Partisipasi</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: '14px' }}>Distribusi Skor per Divisi & Demografi</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: '14px' }}>Daftar Top 10 & Bottom 10 Performers</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiDownload size={20} /> {loading ? 'Memproses...' : 'Generate Laporan Eksekutif'}
            </button>
          </form>
        </div>

        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, var(--bg-main), #FFF)', border: '1px dashed var(--border-focus)' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(46,134,171,0.1)', color: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <FiFileText size={40} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
            {downloadUrl ? 'Laporan Siap Diunduh' : 'Laporan Belum Dibuat'}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '250px' }}>
            {downloadUrl ? 'Silakan klik tombol di bawah untuk mengunduh.' : 'Atur konfigurasi di sebelah kiri, dan klik "Generate" untuk menghasilkan laporan.'}
          </div>
          
          {downloadUrl ? (
            <a href={downloadUrl} download="Executive_Report_AKHLAK.csv" className="btn btn-success" style={{ background: 'var(--success)', color: '#FFF', border: 'none' }}>
              Unduh Sekarang
            </a>
          ) : (
            <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Unduh Laporan</button>
          )}
        </div>
      </div>
    </main>
  );
}
