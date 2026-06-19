"use client";

import { useState } from 'react';
import { FiDownload, FiEdit2 } from 'react-icons/fi';
import { updateIndikatorUser } from './actions';

export function RekapClientUI({ tableData, periodes, activePeriodeId }) {
  const [filterDivisi, setFilterDivisi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editScores, setEditScores] = useState({ Amanah: '', Kompeten: '', Harmonis: '', Loyal: '', Adaptif: '', Kolaboratif: '' });
  const [isSaving, setIsSaving] = useState(false);

  const filtered = tableData.filter(row => {
    if (filterDivisi && row.divisi !== filterDivisi) return false;
    if (filterStatus && row.status !== filterStatus) return false;
    return true;
  });

  const divisiOptions = [...new Set(tableData.map(r => r.divisi))].sort();

  const exportCSV = () => {
    const headers = ['Nama', 'NIP', 'Divisi', 'Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif', 'Skor Akhir', 'Status'];
    const rows = filtered.map(r => [
      r.nama, r.nip, r.divisi,
      r.A ?? '-', r.K1 ?? '-', r.H ?? '-', r.L ?? '-', r.A2 ?? '-', r.K2 ?? '-',
      r.avg ?? '-', r.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_penilaian_360.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditScores({
      Amanah: user.A ?? '',
      Kompeten: user.K1 ?? '',
      Harmonis: user.H ?? '',
      Loyal: user.L ?? '',
      Adaptif: user.A2 ?? '',
      Kolaboratif: user.K2 ?? ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activePeriodeId) {
      alert("Tidak ada periode aktif!");
      return;
    }
    
    setIsSaving(true);
    const res = await updateIndikatorUser(editingUser.id, activePeriodeId, editScores);
    setIsSaving(false);
    
    if (res.success) {
      alert(res.message); // Notifikasi berhasil
      setEditingUser(null);
    } else {
      alert(res.message); // Notifikasi gagal
    }
  };

  return (
    <>
      <div className="filter-bar" style={{ marginTop: '24px' }}>
        <select className="form-select" value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)}>
          <option value="">Semua Divisi</option>
          {divisiOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="Selesai">Selesai</option>
          <option value="Proses">Proses</option>
          <option value="Belum">Belum</option>
        </select>
        <button className="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '8px'}} onClick={exportCSV}>
          <FiDownload size={16} /> Export CSV
        </button>
      </div>

      <div className="card mt-24">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nama Karyawan</th>
                <th>Divisi</th>
                <th title="Amanah">A</th>
                <th title="Kompeten">K</th>
                <th title="Harmonis">H</th>
                <th title="Loyal">L</th>
                <th title="Adaptif">A</th>
                <th title="Kolaboratif">K</th>
                <th>Skor Akhir</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  <td>
                    <div style={{fontWeight: 600}}>{row.nama}</div>
                    <div className="text-xs text-muted">{row.nip}</div>
                  </td>
                  <td>{row.divisi}</td>
                  <td>{row.A ?? '—'}</td>
                  <td>{row.K1 ?? '—'}</td>
                  <td>{row.H ?? '—'}</td>
                  <td>{row.L ?? '—'}</td>
                  <td>{row.A2 ?? '—'}</td>
                  <td>{row.K2 ?? '—'}</td>
                  <td>
                    <strong style={{color: row.avg !== null ? 'var(--primary)' : 'var(--text-muted)'}}>
                      {row.avg ?? '-'}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${row.status === 'Selesai' ? 'badge-success' : row.status === 'Proses' ? 'badge-warning' : 'badge-outline'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => handleEditClick(row)} title="Edit Indikator">
                      <FiEdit2 />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="11" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                    Tidak ada data yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span className="pagination-info">Menampilkan {filtered.length} dari {tableData.length} data</span>
        </div>
      </div>

      {editingUser && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '400px'}}>
            <h3 className="mb-16">Edit Indikator Penilaian</h3>
            <p className="text-sm text-muted mb-16">Karyawan: <strong>{editingUser.nama}</strong></p>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Amanah</label>
                  <input type="number" min="1" max="5" step="0.1" className="form-input" value={editScores.Amanah} onChange={e => setEditScores({...editScores, Amanah: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Kompeten</label>
                  <input type="number" min="1" max="5" step="0.1" className="form-input" value={editScores.Kompeten} onChange={e => setEditScores({...editScores, Kompeten: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Harmonis</label>
                  <input type="number" min="1" max="5" step="0.1" className="form-input" value={editScores.Harmonis} onChange={e => setEditScores({...editScores, Harmonis: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Loyal</label>
                  <input type="number" min="1" max="5" step="0.1" className="form-input" value={editScores.Loyal} onChange={e => setEditScores({...editScores, Loyal: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Adaptif</label>
                  <input type="number" min="1" max="5" step="0.1" className="form-input" value={editScores.Adaptif} onChange={e => setEditScores({...editScores, Adaptif: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Kolaboratif</label>
                  <input type="number" min="1" max="5" step="0.1" className="form-input" value={editScores.Kolaboratif} onChange={e => setEditScores({...editScores, Kolaboratif: e.target.value})} required />
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingUser(null)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
