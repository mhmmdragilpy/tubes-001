"use client";

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Topbar({ title }) {
  const pathname = usePathname();
  const [user, setUser] = useState({ nama: 'Loading...', initial: '?' });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  
  let displayTitle = title;
  if (!displayTitle) {
    const segments = pathname.split('/').filter(Boolean);
    displayTitle = segments.length > 1 ? segments[1].replace('-', ' ') : 'Dashboard';
    displayTitle = displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1);
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({
        nama: parsed.nama,
        initial: parsed.initial || parsed.nama.substring(0, 2).toUpperCase()
      });
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifikasi');
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (e) { /* ignore */ }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleBellClick = async () => {
    setShowPanel(!showPanel);
    if (!showPanel && unreadCount > 0) {
      try {
        await fetch('/api/notifikasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_read' })
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (e) { /* ignore */ }
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} jam lalu`;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title" style={{textTransform: 'capitalize'}}>{displayTitle}</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-bell" ref={panelRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={handleBellClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
          </svg>
          {unreadCount > 0 && (
            <div className="bell-badge" style={{
              position: 'absolute', top: '-4px', right: '-4px',
              background: 'var(--danger)', color: '#FFF',
              borderRadius: '50%', width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700
            }}>{unreadCount}</div>
          )}

          {/* Notification Panel */}
          {showPanel && (
            <div style={{
              position: 'absolute', top: '40px', right: 0, width: '360px',
              background: '#FFF', borderRadius: 'var(--radius-lg)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)', zIndex: 9999,
              border: '1px solid var(--border)', overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>
                Notifikasi
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Belum ada notifikasi.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 20px', borderBottom: '1px solid var(--border)',
                      background: n.is_read ? '#FFF' : 'var(--primary-bg)',
                      cursor: n.link ? 'pointer' : 'default'
                    }} onClick={() => n.link && (window.location.href = n.link)}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>{n.judul}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.pesan}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.7 }}>{formatTime(n.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="topbar-profile">
          <div className="avatar">{user.initial}</div>
          <span className="user-name">{user.nama}</span>
        </div>
      </div>
    </header>
  );
}
