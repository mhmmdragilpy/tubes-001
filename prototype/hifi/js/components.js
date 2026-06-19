/**
 * Hi-Fi Shared Components — Sidebar & Topbar
 * Sistem Penilaian 360° AKHLAK
 */

const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`,
  periode: `<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,
  users: `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  peer: `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  form: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
  file: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  person: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  chart: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`
};

const MENUS = {
  'admin-hr': {
    userName: 'Admin HR', userEmail: 'admin@energi.co.id', userInitial: 'AH', roleName: 'Administrator',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard' },
      { id: 'periode', label: 'Periode Penilaian', href: 'periode.html', icon: 'periode' },
      { id: 'karyawan', label: 'Data Karyawan', href: 'karyawan.html', icon: 'users' },
      { id: 'peer', label: 'Daftar Peer', href: 'peer.html', icon: 'peer' },
      { id: 'kuesioner', label: 'Kuesioner AKHLAK', href: 'kuesioner.html', icon: 'form' },
      { id: 'rekap', label: 'Rekap Penilaian', href: 'rekap.html', icon: 'file' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: 'profil.html', icon: 'person' },
      { id: 'logout', label: 'Logout', href: '../login.html', icon: 'logout', isLogout: true },
    ]
  },
  'atasan': {
    userName: 'Budi Santoso', userEmail: 'budi.s@energi.co.id', userInitial: 'BS', roleName: 'Atasan / Manager',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard' },
      { id: 'approval', label: 'Approval Peer', href: 'approval.html', icon: 'check' },
      { id: 'form-penilaian', label: 'Form Penilaian', href: 'form-penilaian.html', icon: 'form' },
      { id: 'rekap', label: 'Rekap Penilaian', href: 'rekap.html', icon: 'file' },
      { id: 'export', label: 'Export Laporan', href: 'export.html', icon: 'chart' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: '#', icon: 'person' },
      { id: 'logout', label: 'Logout', href: '../login.html', icon: 'logout', isLogout: true },
    ]
  },
  'karyawan': {
    userName: 'Siti Nurhaliza', userEmail: 'siti.n@energi.co.id', userInitial: 'SN', roleName: 'Karyawan',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard' },
      { id: 'form-penilaian', label: 'Form Penilaian', href: 'form-penilaian.html', icon: 'form' },
      { id: 'hasil', label: 'Hasil Penilaian', href: 'hasil.html', icon: 'chart' },
      { id: 'idp', label: 'Laporan & IDP', href: 'idp.html', icon: 'file' },
      { id: 'riwayat', label: 'Riwayat', href: 'riwayat.html', icon: 'periode' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: '#', icon: 'person' },
      { id: 'logout', label: 'Logout', href: '../login.html', icon: 'logout', isLogout: true },
    ]
  },
  'manajemen': {
    userName: 'Direktur Utama', userEmail: 'dirut@energi.co.id', userInitial: 'DU', roleName: 'Executive',
    items: [
      { id: 'dashboard', label: 'Dashboard Analitik', href: 'dashboard.html', icon: 'dashboard' },
      { id: 'monitoring', label: 'Monitoring Penilaian', href: 'monitoring.html', icon: 'users' },
      { id: 'rekap', label: 'Rekap Penilaian', href: 'rekap.html', icon: 'file' },
      { id: 'export', label: 'Export Report', href: 'export.html', icon: 'chart' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: '#', icon: 'person' },
      { id: 'logout', label: 'Logout', href: '../login.html', icon: 'logout', isLogout: true },
    ]
  }
};

const PAGE_TITLES = {
  'dashboard': 'Dashboard',
  'periode': 'Periode Penilaian',
  'karyawan': 'Data Karyawan',
  'peer': 'Daftar Peer',
  'kuesioner': 'Kuesioner AKHLAK',
  'rekap': 'Rekap Penilaian',
  'profil': 'Profil',
  'approval': 'Approval Peer',
  'form-penilaian': 'Form Penilaian',
  'export': 'Export Laporan',
  'hasil': 'Hasil Penilaian',
  'idp': 'Laporan & IDP',
  'riwayat': 'Riwayat Penilaian',
  'monitoring': 'Monitoring Penilaian',
};

const PAGE_TITLES_MANAJEMEN = {
  'dashboard': 'Dashboard Analitik',
  'export': 'Export Report',
};

function renderSidebar(role, activePage) {
  const menu = MENUS[role];
  if (!menu) return '';

  let navItems = '';
  menu.items.forEach(item => {
    if (item.type === 'divider') {
      navItems += '<div class="nav-divider"></div>';
      return;
    }
    const isActive = item.id === activePage ? ' active' : '';
    const isLogout = item.isLogout ? ' logout' : '';
    navItems += `
      <a href="${item.href}" class="nav-item${isActive}${isLogout}">
        <span class="nav-icon">${ICONS[item.icon] || ICONS.dashboard}</span>
        <span>${item.label}</span>
      </a>`;
  });

  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo-box">360°</div>
        <span class="brand-text">AKHLAK</span>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar">${menu.userInitial}</div>
        <div class="user-info">
          <div class="user-name">${menu.userName}</div>
          <div class="user-role">${menu.roleName}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems}
      </nav>
    </aside>`;
}

function renderTopbar(role, activePage) {
  const menu = MENUS[role];
  if (!menu) return '';

  let titles = PAGE_TITLES;
  if (role === 'manajemen') {
    titles = { ...PAGE_TITLES, ...PAGE_TITLES_MANAJEMEN };
  }
  const pageTitle = titles[activePage] || activePage;

  return `
    <header class="topbar">
      <div class="topbar-left">
        <span class="topbar-title">${pageTitle}</span>
      </div>
      <div class="topbar-right">
        <div class="topbar-bell">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
          <div class="bell-badge"></div>
        </div>
        <div class="topbar-profile">
          <div class="avatar">${menu.userInitial}</div>
          <span class="user-name">${menu.userName}</span>
        </div>
      </div>
    </header>`;
}

function initComponents() {
  const body = document.body;
  const role = body.getAttribute('data-role');
  const page = body.getAttribute('data-page');

  if (!role || !page) return;

  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) sidebarEl.outerHTML = renderSidebar(role, page);

  const topbarEl = document.getElementById('topbar');
  if (topbarEl) topbarEl.outerHTML = renderTopbar(role, page);
}

document.addEventListener('DOMContentLoaded', initComponents);
