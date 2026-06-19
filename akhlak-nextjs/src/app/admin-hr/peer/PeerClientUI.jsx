"use client";

import { useState } from 'react';
import { createPeerMapping } from './actions';

export function AddPeerMappingButton({ users, periodeId }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!periodeId) {
    return <button className="btn btn-primary" onClick={() => alert('Tidak ada periode aktif!')}>Tambah Mapping</button>;
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>Tambah Mapping</button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '500px'}}>
            <h3 className="mb-16">Tambah Mapping Penilai Peer</h3>
            <form action={async (formData) => {
              const res = await createPeerMapping(formData);
              if(res.success) setIsOpen(false);
              else alert('Error: ' + res.message);
            }}>
              <input type="hidden" name="periode_id" value={periodeId} />
              <div className="form-group">
                <label className="form-label">Karyawan (Dinilai)</label>
                <select name="dinilai_id" className="form-select" required>
                  <option value="">-- Pilih Karyawan --</option>
                  {users.map(u => <option key={`d-${u.id}`} value={u.id}>{u.nama_lengkap} ({u.divisi})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Penilai (Peer)</label>
                <select name="penilai_id" className="form-select" required>
                  <option value="">-- Pilih Penilai --</option>
                  {users.map(u => <option key={`p-${u.id}`} value={u.id}>{u.nama_lengkap} ({u.divisi})</option>)}
                </select>
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
