"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StartPenilaianClient({ bawahanList, activePeriodeId }) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/atasan/start-penilaian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dinilaiId: parseInt(selectedUserId),
          periodeId: activePeriodeId
        })
      });
      
      const data = await res.json();
      if (data.success) {
        router.push(`/atasan/form-penilaian/${data.penilaianId}`);
      } else {
        alert('Gagal memulai penilaian: ' + data.message);
        setLoading(false);
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
      setLoading(false);
    }
  };

  if (!bawahanList || bawahanList.length === 0) return null;

  return (
    <div className="card mb-24" style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <label className="form-label">Mulai Penilaian Baru untuk Bawahan:</label>
        <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
          <option value="">-- Pilih Bawahan --</option>
          {bawahanList.map(b => (
            <option key={b.id} value={b.id}>{b.nama_lengkap} - {b.jabatan}</option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" onClick={handleStart} disabled={!selectedUserId || loading}>
        {loading ? 'Memproses...' : 'Buat Sesi Penilaian'}
      </button>
    </div>
  );
}
