"use client";

import { useState } from 'react';
import { sendReminder } from './actions';

export function ReminderButton({ targetUserId, targetUserName }) {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!confirm(`Kirim reminder penilaian ke ${targetUserName}?`)) return;
    setLoading(true);
    
    const judul = "Reminder: Selesaikan Penilaian 360° Anda";
    const pesan = "Mohon segera selesaikan form penilaian AKHLAK 360° Anda. Deadline sudah semakin dekat.";
    const link = "/karyawan/dashboard";
    
    const res = await sendReminder([targetUserId], judul, pesan, link);
    
    if (res.success) {
      alert("Reminder berhasil dikirim!");
    } else {
      alert("Gagal mengirim reminder: " + res.message);
    }
    
    setLoading(false);
  };

  return (
    <button 
      className="btn btn-sm btn-outline" 
      onClick={handleSend} 
      disabled={loading}
    >
      {loading ? 'Mengirim...' : 'Kirim Reminder'}
    </button>
  );
}

export function BulkReminderButton({ targetUserIds }) {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (targetUserIds.length === 0) {
      alert("Tidak ada karyawan yang perlu diingatkan saat ini.");
      return;
    }
    
    if (!confirm(`Kirim reminder ke ${targetUserIds.length} karyawan sekaligus?`)) return;
    setLoading(true);
    
    const judul = "Reminder: Selesaikan Penilaian 360° Anda";
    const pesan = "Mohon segera selesaikan form penilaian AKHLAK 360° Anda. Deadline sudah semakin dekat.";
    const link = "/karyawan/dashboard";
    
    const res = await sendReminder(targetUserIds, judul, pesan, link);
    
    if (res.success) {
      alert(`Berhasil mengirim reminder ke ${res.count} karyawan!`);
    } else {
      alert("Gagal mengirim reminder bulk: " + res.message);
    }
    
    setLoading(false);
  };

  return (
    <button 
      className="btn btn-sm btn-primary" 
      onClick={handleSend} 
      disabled={loading || targetUserIds.length === 0}
      style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
    >
      {loading ? 'Mengirim...' : `Kirim Reminder Massal (${targetUserIds.length})`}
    </button>
  );
}
