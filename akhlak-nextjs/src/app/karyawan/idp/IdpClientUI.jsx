"use client";

import { useState } from 'react';

export default function IdpClientUI({ initialIdps, activePeriode }) {
  const [idps, setIdps] = useState(initialIdps);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    area_pengembangan: 'Kompeten',
    target_akhir: '',
    rencana_aksi: '',
    timeline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activePeriode) {
      alert('Tidak ada periode aktif saat ini.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/idp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periode_id: activePeriode.id,
          ...formData
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('IDP berhasil disimpan!');
        // Refresh page to get updated data from server
        window.location.reload();
      } else {
        alert('Gagal menyimpan IDP: ' + data.message);
      }
    } catch (error) {
      alert('Terjadi kesalahan.');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'belum_mulai': return <span className="badge warning">Belum Mulai</span>;
      case 'sedang_berjalan': return <span className="badge primary">Sedang Berjalan</span>;
      case 'selesai': return <span className="badge success">Selesai</span>;
      default: return <span className="badge neutral">{status}</span>;
    }
  };

  return (
    <div className="grid-60-40">
      <div className="card">
        <div className="card-header mb-16">
          <div className="card-title">Buat Rencana IDP Baru</div>
        </div>
        
        {activePeriode ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Periode Aktif</label>
              <input type="text" className="form-input" value={activePeriode.nama_periode} disabled style={{ background: 'var(--bg-main)' }} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Area Pengembangan (AKHLAK)</label>
              <select 
                className="form-select" 
                value={formData.area_pengembangan}
                onChange={(e) => setFormData({...formData, area_pengembangan: e.target.value})}
                required
              >
                <option value="Amanah">Amanah</option>
                <option value="Kompeten">Kompeten</option>
                <option value="Harmonis">Harmonis</option>
                <option value="Loyal">Loyal</option>
                <option value="Adaptif">Adaptif</option>
                <option value="Kolaboratif">Kolaboratif</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Target Akhir (Goals)</label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Contoh: Menguasai teknologi baru X dalam 3 bulan"
                value={formData.target_akhir}
                onChange={(e) => setFormData({...formData, target_akhir: e.target.value})}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Rencana Aksi</label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Contoh: Mengikuti kursus online, membaca dokumentasi"
                value={formData.rencana_aksi}
                onChange={(e) => setFormData({...formData, rencana_aksi: e.target.value})}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Timeline / Waktu Pelaksanaan</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Contoh: Q3 2026 atau September 2026"
                value={formData.timeline}
                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Menyimpan...' : 'Simpan Rencana IDP'}
            </button>
          </form>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--radius-md)' }}>
            Tidak ada periode penilaian yang aktif. Anda tidak dapat membuat IDP saat ini.
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header mb-16">
          <div className="card-title">Riwayat IDP Saya</div>
        </div>
        
        {idps.length === 0 ? (
          <div className="empty-state">Belum ada data IDP.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {idps.map(idp => (
              <div key={idp.id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{idp.area}</span>
                  {getStatusBadge(idp.status)}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Periode: {idp.periode}</div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Target:</div>
                  <div style={{ fontSize: '14px' }}>{idp.target}</div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Rencana Aksi:</div>
                  <div style={{ fontSize: '14px' }}>{idp.rencana}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Timeline:</div>
                  <div style={{ fontSize: '14px' }}>{idp.timeline}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
