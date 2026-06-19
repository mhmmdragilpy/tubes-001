"use client";

import { useState } from 'react';
import { approvePeer, rejectPeer } from './actions';
import { FiCheck, FiX } from 'react-icons/fi';

export function ApproveButton({ penilaianId }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    setLoading(true);
    const res = await approvePeer(penilaianId);
    if (res.success) setDone(true);
    else alert('Error: ' + res.message);
    setLoading(false);
  };

  if (done) return <span className="badge badge-success">Disetujui ✓</span>;

  return (
    <button className="btn btn-success" style={{ background: 'var(--success)', color: '#FFF', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handle} disabled={loading}>
      <FiCheck size={16} /> {loading ? '...' : 'Setujui'}
    </button>
  );
}

export function RejectButton({ penilaianId }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    if (!confirm('Yakin ingin menolak pengajuan peer ini?')) return;
    setLoading(true);
    const res = await rejectPeer(penilaianId);
    if (res.success) setDone(true);
    else alert('Error: ' + res.message);
    setLoading(false);
  };

  if (done) return <span className="badge badge-danger">Ditolak ✕</span>;

  return (
    <button className="btn btn-danger" style={{ background: 'var(--danger)', color: '#FFF', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handle} disabled={loading}>
      <FiX size={16} /> {loading ? '...' : 'Tolak'}
    </button>
  );
}
