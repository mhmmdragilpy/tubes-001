"use client";

import { useState } from 'react';

export default function IdpApprovalClient({ initialIdps }) {
  const [idps, setIdps] = useState(initialIdps);
  const [loadingId, setLoadingId] = useState(null);

  const handleUpdateStatus = async (id, newStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/idp/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        setIdps(idps.map(idp => idp.id === id ? { ...idp, status: newStatus } : idp));
      } else {
        alert('Gagal memperbarui status: ' + data.message);
      }
    } catch (error) {
      alert('Terjadi kesalahan.');
    }
    setLoadingId(null);
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
    <div style={{ overflowX: 'auto' }}>
      {idps.length === 0 ? (
        <div className="empty-state">Belum ada data IDP dari bawahan.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nama Bawahan</th>
              <th>Periode</th>
              <th>Area Pengembangan</th>
              <th>Target Akhir</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {idps.map(idp => (
              <tr key={idp.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{idp.nama}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{idp.jabatan}</div>
                </td>
                <td>{idp.periode}</td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{idp.area}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Timeline: {idp.timeline}</div>
                </td>
                <td>
                  <div style={{ fontSize: '13px', maxWidth: '200px' }}>{idp.target}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Aksi: </span>{idp.rencana}
                  </div>
                </td>
                <td>{getStatusBadge(idp.status)}</td>
                <td>
                  {loadingId === idp.id ? (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Memproses...</span>
                  ) : (
                    <select 
                      className="form-select" 
                      style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
                      value={idp.status}
                      onChange={(e) => handleUpdateStatus(idp.id, e.target.value)}
                    >
                      <option value="belum_mulai">Belum Mulai</option>
                      <option value="sedang_berjalan">Sedang Berjalan</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
