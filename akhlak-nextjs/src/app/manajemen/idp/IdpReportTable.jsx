"use client";

import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function IdpReportTable({ initialData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredData = initialData.filter(row => {
    const matchesSearch = row.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivisi = filterDivisi ? row.divisi === filterDivisi : true;
    const matchesStatus = filterStatus ? row.status === filterStatus : true;
    return matchesSearch && matchesDivisi && matchesStatus;
  });

  const divisiOptions = [...new Set(initialData.map(r => r.divisi))].sort();

  const exportCSV = () => {
    const headers = ['NIP', 'Nama', 'Divisi', 'Jabatan', 'Periode', 'Area Pengembangan', 'Target Akhir', 'Rencana Aksi', 'Timeline', 'Status'];
    const rows = filteredData.map(r => [
      `"${r.nip}"`, `"${r.nama}"`, `"${r.divisi}"`, `"${r.jabatan}"`, `"${r.periode}"`,
      `"${r.area}"`, `"${r.target}"`, `"${r.rencana}"`, `"${r.timeline}"`, `"${r.status}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_idp_karyawan.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'selesai') return 'badge-success';
    if (status === 'sedang_berjalan') return 'badge-warning';
    return 'badge-outline';
  };

  const getStatusLabel = (status) => {
    if (status === 'selesai') return 'Selesai';
    if (status === 'sedang_berjalan') return 'Sedang Berjalan';
    return 'Belum Mulai';
  };

  return (
    <>
      <div className="filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Cari nama atau NIP..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '220px' }}
        />
        <select 
          className="form-select" 
          value={filterDivisi} 
          onChange={e => setFilterDivisi(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">Semua Divisi</option>
          {divisiOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select 
          className="form-select" 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">Semua Status</option>
          <option value="belum_mulai">Belum Mulai</option>
          <option value="sedang_berjalan">Sedang Berjalan</option>
          <option value="selesai">Selesai</option>
        </select>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }} 
          onClick={exportCSV}
        >
          <FiDownload size={16} /> Export CSV
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama Karyawan</th>
              <th>Divisi / Jabatan</th>
              <th>Area Pengembangan</th>
              <th>Target Akhir</th>
              <th>Rencana Aksi / Program</th>
              <th>Timeline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => (
              <tr key={row.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.nama}</div>
                  <div className="text-xs text-muted">NIP: {row.nip}</div>
                </td>
                <td>
                  <div>{row.divisi}</div>
                  <div className="text-xs text-muted">{row.jabatan}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.area}</span>
                </td>
                <td>{row.target}</td>
                <td>{row.rencana}</td>
                <td>{row.timeline}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(row.status)}`}>
                    {getStatusLabel(row.status)}
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  Tidak ada data rencana aksi (IDP) karyawan yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination" style={{ marginTop: '16px' }}>
        <span className="pagination-info">Menampilkan {filteredData.length} dari {initialData.length} data IDP</span>
      </div>
    </>
  );
}
