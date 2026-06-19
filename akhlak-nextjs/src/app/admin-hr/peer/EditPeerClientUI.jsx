"use client";

import { useState } from 'react';
import { createPeerMapping, deletePeerMapping } from './actions';
import { FiTrash2 } from 'react-icons/fi';

export function EditPeerClientUI({ user, allUsers, periodeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (penilaianId) => {
    if(!confirm("Yakin ingin menghapus penilai ini?")) return;
    setIsDeleting(true);
    const res = await deletePeerMapping(penilaianId);
    setIsDeleting(false);
    if (!res.success) {
      alert('Gagal: ' + res.message);
    }
  };

  const currentPenilaiIds = user.dinilai.map(p => p.penilai_id);
  const availablePeers = allUsers.filter(u => u.id !== user.id && !currentPenilaiIds.includes(u.id));

  return (
    <>
      <button className="btn btn-sm btn-outline" onClick={() => setIsOpen(true)}>Edit</button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3 className="mb-16">Kelola Penilai untuk {user.nama_lengkap}</h3>
            
            <div className="mb-24">
              <h4 className="mb-8" style={{fontSize: '14px', color: 'var(--text-muted)'}}>Daftar Penilai Saat Ini:</h4>
              {user.dinilai.length === 0 ? (
                <div style={{padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '13px', textAlign: 'center'}}>Belum ada penilai.</div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {user.dinilai.map(p => (
                    <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)'}}>
                      <div>
                        <div style={{fontWeight: 600, fontSize: '14px'}}>{p.penilai.nama_lengkap}</div>
                        <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{p.penilai.divisi} • {p.tipe_relasi.toUpperCase()} • Status: {p.status}</div>
                      </div>
                      {p.tipe_relasi === 'peer' && p.status !== 'selesai' && (
                        <button 
                          className="btn btn-sm btn-outline" 
                          style={{color: 'var(--danger)', borderColor: 'var(--danger)', padding: '4px 8px'}}
                          onClick={() => handleDelete(p.id)}
                          disabled={isDeleting}
                          title="Hapus Penilai"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{borderTop: '1px solid var(--border)', paddingTop: '16px'}}>
              <h4 className="mb-8" style={{fontSize: '14px', color: 'var(--text-muted)'}}>Tambahkan Peer Baru:</h4>
              <form action={async (formData) => {
                const res = await createPeerMapping(formData);
                if(!res.success) alert('Error: ' + res.message);
              }}>
                <input type="hidden" name="periode_id" value={periodeId} />
                <input type="hidden" name="dinilai_id" value={user.id} />
                <div style={{display: 'flex', gap: '12px'}}>
                  <select name="penilai_id" className="form-select" required style={{flex: 1}}>
                    <option value="">-- Pilih Peer Baru --</option>
                    {availablePeers.map(u => <option key={u.id} value={u.id}>{u.nama_lengkap} ({u.divisi})</option>)}
                  </select>
                  <button type="submit" className="btn btn-primary" disabled={availablePeers.length === 0}>Tambah</button>
                </div>
                {availablePeers.length === 0 && <div style={{fontSize: '12px', color: 'var(--warning)', marginTop: '8px'}}>Semua karyawan sudah menjadi penilai orang ini.</div>}
              </form>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px'}}>
              <button type="button" className="btn btn-primary" onClick={() => setIsOpen(false)}>Selesai</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
