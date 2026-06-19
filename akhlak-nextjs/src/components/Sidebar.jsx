"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ICONS = {
  dashboard: <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  periode: <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>,
  users: <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  peer: <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  form: <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  file: <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>,
  person: <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  logout: <svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>,
  check: <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  chart: <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
};

const MENUS = {
  'admin-hr': {
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/admin-hr/dashboard', icon: 'dashboard' },
      { id: 'periode', label: 'Periode Penilaian', path: '/admin-hr/periode', icon: 'periode' },
      { id: 'karyawan', label: 'Data Karyawan', path: '/admin-hr/karyawan', icon: 'users' },
      { id: 'peer', label: 'Daftar Peer', path: '/admin-hr/peer', icon: 'peer' },
      { id: 'kuesioner', label: 'Kuesioner AKHLAK', path: '/admin-hr/kuesioner', icon: 'form' },
      { id: 'rekap', label: 'Rekap Penilaian', path: '/admin-hr/rekap', icon: 'file' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', path: '/admin-hr/profil', icon: 'person' },
      { id: 'logout', label: 'Logout', path: '/login', icon: 'logout', isLogout: true },
    ]
  },
  'atasan': {
    items: [
      { id: 'dashboard', label: 'Dashboard Analitik', path: '/atasan/dashboard', icon: 'dashboard' },
      { id: 'approval', label: 'Approval Peer', path: '/atasan/approval', icon: 'check' },
      { id: 'form-penilaian', label: 'Form Penilaian', path: '/atasan/form-penilaian', icon: 'form' },
      { id: 'rekap', label: 'Rekap Penilaian', path: '/atasan/rekap', icon: 'file' },
      { id: 'export', label: 'Export Laporan', path: '/atasan/export', icon: 'chart' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', path: '/atasan/profil', icon: 'person' },
      { id: 'logout', label: 'Logout', path: '/login', icon: 'logout', isLogout: true },
    ]
  },
  'karyawan': {
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/karyawan/dashboard', icon: 'dashboard' },
      { id: 'form-penilaian', label: 'Form Penilaian', path: '/karyawan/form-penilaian', icon: 'form' },
      { id: 'hasil', label: 'Hasil Penilaian', path: '/karyawan/hasil', icon: 'chart' },
      { id: 'riwayat', label: 'Riwayat', path: '/karyawan/riwayat', icon: 'periode' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', path: '/karyawan/profil', icon: 'person' },
      { id: 'logout', label: 'Logout', path: '/login', icon: 'logout', isLogout: true },
    ]
  },
  'manajemen': {
    items: [
      { id: 'dashboard', label: 'Dashboard Analitik', path: '/manajemen/dashboard', icon: 'dashboard' },
      { id: 'monitoring', label: 'Monitoring Penilaian', path: '/manajemen/monitoring', icon: 'users' },
      { id: 'rekap', label: 'Rekap Penilaian', path: '/manajemen/rekap', icon: 'file' },
      { id: 'idp', label: 'Laporan & IDP', path: '/manajemen/idp', icon: 'file' },
      { id: 'export', label: 'Export Report', path: '/manajemen/export', icon: 'chart' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', path: '/manajemen/profil', icon: 'person' },
      { id: 'logout', label: 'Logout', path: '/login', icon: 'logout', isLogout: true },
    ]
  }
};

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [user, setUser] = useState({ nama: 'Loading...', role: 'Loading...', initial: '?' });

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({
        nama: parsed.nama,
        role: parsed.role,
        initial: parsed.initial || parsed.nama.substring(0, 2).toUpperCase()
      });
    }
  }, []);

  const menu = MENUS[role] || { items: [] };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-box">360°</div>
        <span className="brand-text">AKHLAK</span>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">{user.initial}</div>
        <div className="user-info">
          <div className="user-name">{user.nama}</div>
          <div className="user-role" style={{textTransform: 'capitalize'}}>{user.role.replace('-', ' ')}</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menu.items.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="nav-divider"></div>;
          }
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.id} 
              href={item.path} 
              className={`nav-item ${isActive ? 'active' : ''} ${item.isLogout ? 'logout' : ''}`}
            >
              <span className="nav-icon">{ICONS[item.icon] || ICONS.dashboard}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
