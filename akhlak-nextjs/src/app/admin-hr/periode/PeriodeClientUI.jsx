"use client";

import { useState } from 'react';
import { createPeriode, tutupPeriode } from './actions';
import { FiPlus } from 'react-icons/fi';

export function AddPeriodeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    if (val) {
      const date = new Date(val);
      date.setMonth(date.getMonth() + 6);
      setEndDate(date.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <FiPlus size={18} /> Buat Periode Baru
      </button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '400px'}}>
            <h3 className="mb-16">Buat Periode Baru</h3>
            <form action={async (formData) => {
              const res = await createPeriode(formData);
              if(res.success) setIsOpen(false);
              else alert('Error: ' + res.message);
            }}>
              <div className="form-group">
                <label className="form-label">Nama Periode</label>
                <input type="text" name="nama_periode" className="form-input" required placeholder="e.g. Semester 2 - 2026" />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Mulai</label>
                <input type="date" name="tanggal_mulai" className="form-input" required value={startDate} onChange={handleStartDateChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Selesai (Default 6 Bulan)</label>
                <input type="date" name="tanggal_selesai" className="form-input" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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

export function ClosePeriodeButton({ periodeId }) {
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if(confirm('Yakin ingin menutup periode ini?')) {
      setLoading(true);
      await tutupPeriode(periodeId);
      setLoading(false);
    }
  };

  return (
    <button className="btn btn-sm btn-danger" onClick={handleClose} disabled={loading}>
      {loading ? 'Memproses...' : 'Tutup Periode'}
    </button>
  );
}

export function DetailPeriodeButton({ periode }) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <>
      <button className="btn btn-sm btn-outline" onClick={() => setIsOpen(true)}>Detail</button>

      {isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '400px'}}>
            <h3 className="mb-16">Detail Periode</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div>
                <div className="text-sm text-muted">Nama Periode</div>
                <div style={{fontWeight: 600}}>{periode.nama_periode}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Tanggal Mulai</div>
                <div>{formatDate(periode.tanggal_mulai)}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Tanggal Selesai</div>
                <div>{formatDate(periode.tanggal_selesai)}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Status</div>
                <div>
                  {periode.is_active ? <span className="badge badge-success">Aktif</span> : <span className="badge badge-outline">Selesai/Non-aktif</span>}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '24px'}}>
              <button type="button" className="btn btn-primary" onClick={() => setIsOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
