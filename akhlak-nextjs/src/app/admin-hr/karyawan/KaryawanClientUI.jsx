"use client";

import { useState } from 'react';
import { createKaryawan, updateKaryawan, deleteKaryawan } from './actions';
import { FiPlus, FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi';

export function AddKaryawanButton({ atasans }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <FiPlus size={18} /> Tambah Karyawan
      </button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '500px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3 className="mb-16">Tambah Karyawan Baru</h3>
            <form action={async (formData) => {
              const res = await createKaryawan(formData);
              if(res.success) setIsOpen(false);
              else alert('Error: ' + res.message);
            }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">NIP</label>
                  <input type="text" name="nip" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" name="nama_lengkap" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Divisi</label>
                  <input type="text" name="divisi" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jabatan</label>
                  <input type="text" name="jabatan" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role Akses</label>
                  <select name="role" className="form-select" required>
                    <option value="karyawan">Karyawan</option>
                    <option value="atasan">Atasan</option>
                    <option value="admin_hr">Admin HR</option>
                    <option value="manajemen">Manajemen</option>
                  </select>
                </div>
                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label className="form-label">Atasan Langsung (Opsional)</label>
                  <select name="atasan_id" className="form-select">
                    <option value="">-- Tidak Ada --</option>
                    {atasans.map(a => (
                      <option key={a.id} value={a.id}>{a.nama_lengkap} ({a.jabatan})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
                <button type="button" className="btn btn-outline" onClick={() => setIsOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function EditKaryawanButton({ user, atasans }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn btn-sm btn-outline" onClick={() => setIsOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
        <FiEdit2 size={12} /> Edit
      </button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '500px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3 className="mb-16">Edit Karyawan</h3>
            <form action={async (formData) => {
              const res = await updateKaryawan(user.id, formData);
              if(res.success) setIsOpen(false);
              else alert('Error: ' + res.message);
            }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">NIP</label>
                  <input type="text" name="nip" defaultValue={user.nip} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" name="nama_lengkap" defaultValue={user.nama_lengkap} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" defaultValue={user.email} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Divisi</label>
                  <input type="text" name="divisi" defaultValue={user.divisi} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jabatan</label>
                  <input type="text" name="jabatan" defaultValue={user.jabatan} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role Akses</label>
                  <select name="role" defaultValue={user.role} className="form-select" required>
                    <option value="karyawan">Karyawan</option>
                    <option value="atasan">Atasan</option>
                    <option value="admin_hr">Admin HR</option>
                    <option value="manajemen">Manajemen</option>
                  </select>
                </div>
                <div className="form-group" style={{gridColumn: 'span 2'}}>
                  <label className="form-label">Atasan Langsung (Opsional)</label>
                  <select name="atasan_id" defaultValue={user.atasan_id || ''} className="form-select">
                    <option value="">-- Tidak Ada --</option>
                    {atasans.filter(a => a.id !== user.id).map(a => (
                      <option key={a.id} value={a.id}>{a.nama_lengkap} ({a.jabatan})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
                <button type="button" className="btn btn-outline" onClick={() => setIsOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteKaryawanButton({ userId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteKaryawan(userId);
    if (!res.success) alert('Error: ' + res.message);
    setShowConfirm(false);
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-sm btn-danger" onClick={() => setShowConfirm(true)} style={{display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--danger)', color: '#FFF', border: 'none'}}>
        <FiTrash2 size={12} /> Hapus
      </button>

      {showConfirm && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '400px', textAlign: 'center'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>⚠️</div>
            <h3 className="mb-8">Hapus data ini?</h3>
            <p className="text-muted mb-24">Data karyawan akan dihapus secara permanen dan tidak bisa dikembalikan.</p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} disabled={loading}>Batal</button>
              <button className="btn" style={{background: 'var(--danger)', color: '#FFF', border: 'none'}} onClick={handleDelete} disabled={loading}>
                {loading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SearchFilterBar({ divisiOptions, jabatanOptions }) {
  const [search, setSearch] = useState('');
  const [divisi, setDivisi] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [status, setStatus] = useState('');

  // Use URL params for server-side filtering
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (divisi) params.set('divisi', divisi);
    if (jabatan) params.set('jabatan', jabatan);
    if (status) params.set('status', status);
    window.location.href = `/admin-hr/karyawan?${params.toString()}`;
  };

  return (
    <div className="filter-bar">
      <div className="form-input-icon" style={{ flex: 1 }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Cari nama, NIP..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
      </div>
      <select className="form-select" value={divisi} onChange={(e) => setDivisi(e.target.value)}>
        <option value="">Semua Divisi</option>
        {divisiOptions.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className="form-select" value={jabatan} onChange={(e) => setJabatan(e.target.value)}>
        <option value="">Semua Jabatan</option>
        {jabatanOptions.map(j => <option key={j} value={j}>{j}</option>)}
      </select>
      <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Semua Status</option>
        <option value="Selesai">Selesai</option>
        <option value="Proses">Proses</option>
        <option value="Belum">Belum</option>
      </select>
      <button className="btn btn-primary" style={{minWidth: 'auto'}} onClick={applyFilters}>Terapkan</button>
    </div>
  );
}

export function ImportKaryawanButton() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await fetch('/api/import-karyawan', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUploading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <label className="btn btn-outline" style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: isUploading ? 0.7 : 1}}>
      <FiDownload size={16} /> {isUploading ? 'Memproses...' : 'Import Excel'}
      <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleFileChange} disabled={isUploading} />
    </label>
  );
}
