"use client";

import { useState } from 'react';
import { createPertanyaan, updatePertanyaan, togglePertanyaan } from './actions';
import { FiPlus } from 'react-icons/fi';

export function AddPertanyaanButton({ kategori }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <FiPlus size={18} /> Tambah Pertanyaan
      </button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '500px'}}>
            <h3 className="mb-16">Tambah Pertanyaan ({kategori})</h3>
            <form action={async (formData) => {
              const res = await createPertanyaan(formData);
              if(res.success) setIsOpen(false);
              else alert('Error: ' + res.message);
            }}>
              <input type="hidden" name="kategori" value={kategori} />
              <div className="form-group">
                <label className="form-label">Teks Pertanyaan</label>
                <textarea name="teks_pertanyaan" className="form-textarea" required rows="3" placeholder="Masukkan teks pertanyaan..."></textarea>
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

export function EditPertanyaanButton({ q }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn btn-sm btn-outline" onClick={() => setIsOpen(true)}>Edit</button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '500px'}}>
            <h3 className="mb-16">Edit Pertanyaan</h3>
            <form action={async (formData) => {
              const res = await updatePertanyaan(q.id, formData);
              if(res.success) setIsOpen(false);
              else alert('Error: ' + res.message);
            }}>
              <div className="form-group">
                <label className="form-label">Teks Pertanyaan</label>
                <textarea name="teks_pertanyaan" defaultValue={q.teks_pertanyaan} className="form-textarea" required rows="3"></textarea>
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

export function TogglePertanyaanButton({ q }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await togglePertanyaan(q.id, !q.is_active);
    setLoading(false);
  };

  return (
    <div 
      className={`toggle ${q.is_active ? 'active' : ''}`} 
      onClick={!loading ? handleToggle : undefined}
      style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
    ></div>
  );
}
