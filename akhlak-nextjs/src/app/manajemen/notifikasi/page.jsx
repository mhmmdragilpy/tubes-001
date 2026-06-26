import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyToken } from '@/lib/jwt';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function markAllAsRead(userId) {
  'use server';
  await prisma.notifikasi.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true }
  });
  revalidatePath('/manajemen/notifikasi');
}

export default async function ManajemenNotifikasiPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  
  let userId = null;
  if (tokenCookie) {
    const payload = await verifyToken(tokenCookie.value);
    if (payload) userId = payload.userId;
  }

  if (!userId) {
    return (
      <main className="main-content">
        <div className="card mb-24" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: '#fef2f2' }}>
          <div style={{ padding: '16px 0' }}>
            <h3 style={{color: '#991b1b', marginBottom: '8px'}}>Sesi Berakhir / Token Tidak Ditemukan</h3>
            <p style={{color: '#7f1d1d', fontSize: '14px'}}>Silakan login ulang untuk melihat notifikasi Anda.</p>
            <Link href="/login" className="btn btn-sm btn-primary mt-16" style={{display: 'inline-block'}}>Login Ulang</Link>
          </div>
        </div>
      </main>
    );
  }

  const notifications = await prisma.notifikasi.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async () => {
    'use server';
    await markAllAsRead(userId);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <main className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Notifikasi Sistem</h1>
          <div className="text-sm text-muted">Melihat pemberitahuan sistem dan riwayat pembaruan periode penilaian.</div>
        </div>
        {unreadCount > 0 && (
          <form action={handleMarkRead}>
            <button type="submit" className="btn btn-sm btn-outline">Tandai Semua Dibaca</button>
          </form>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Tidak Ada Notifikasi</h3>
            <p style={{ fontSize: '14px' }}>Belum ada notifikasi sistem untuk Anda saat ini.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: n.is_read ? '#FFF' : 'var(--primary-bg)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }}></span>}
                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>{n.judul}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{n.pesan}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', opacity: 0.7 }}>{formatTime(n.created_at)}</div>
                </div>
                {n.link && (
                  <Link href={n.link} className="btn btn-sm btn-outline">Lihat</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
