/**
 * Lo-Fi Shared Components — Sidebar & Topbar
 * Sistem Penilaian 360° AKHLAK
 * 
 * Usage: add data-role="admin-hr|atasan|karyawan|manajemen" 
 *        and data-page="dashboard|periode|..." to <body>
 *        Then call initComponents() at bottom of page.
 */

// ============================================
// SIDEBAR MENU DEFINITIONS
// ============================================
const MENUS = {
  'admin-hr': {
    userName: 'Admin HR',
    userEmail: 'admin@energi.co.id',
    userInitial: 'AH',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
      { id: 'periode', label: 'Periode Penilaian', href: 'periode.html' },
      { id: 'karyawan', label: 'Data Karyawan', href: 'karyawan.html' },
      { id: 'peer', label: 'Daftar Peer', href: 'peer.html' },
      { id: 'kuesioner', label: 'Kuesioner AKHLAK', href: 'kuesioner.html' },
      { id: 'notifikasi', label: 'Notifikasi', href: '#' },
      { id: 'audit', label: 'Audit Trail', href: '#' },
      { id: 'rekap', label: 'Rekap Penilaian', href: 'rekap.html' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: 'profil.html' },
      { id: 'logout', label: 'Logout', href: '../login.html', isLogout: true },
    ]
  },
  'atasan': {
    userName: 'Budi Santoso',
    userEmail: 'budi.s@energi.co.id',
    userInitial: 'BS',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
      { id: 'approval', label: 'Approval Peer', href: 'approval.html' },
      { id: 'form-penilaian', label: 'Form Penilaian', href: 'form-penilaian.html' },
      { id: 'rekap', label: 'Rekap Penilaian', href: 'rekap.html' },
      { id: 'export', label: 'Export Laporan', href: 'export.html' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: '#' },
      { id: 'logout', label: 'Logout', href: '../login.html', isLogout: true },
    ]
  },
  'karyawan': {
    userName: 'Siti Nurhaliza',
    userEmail: 'siti.n@energi.co.id',
    userInitial: 'SN',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
      { id: 'form-penilaian', label: 'Form Penilaian', href: 'form-penilaian.html' },
      { id: 'hasil', label: 'Hasil Penilaian', href: 'hasil.html' },
      { id: 'idp', label: 'Laporan & IDP', href: 'idp.html' },
      { id: 'riwayat', label: 'Riwayat', href: 'riwayat.html' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: '#' },
      { id: 'logout', label: 'Logout', href: '../login.html', isLogout: true },
    ]
  },
  'manajemen': {
    userName: 'Direktur Utama',
    userEmail: 'dirut@energi.co.id',
    userInitial: 'DU',
    items: [
      { id: 'dashboard', label: 'Dashboard Analitik', href: 'dashboard.html' },
      { id: 'monitoring', label: 'Monitoring Penilaian', href: 'monitoring.html' },
      { id: 'rekap', label: 'Rekap Penilaian', href: 'rekap.html' },
      { id: 'export', label: 'Export Report', href: 'export.html' },
      { type: 'divider' },
      { id: 'profil', label: 'Profil', href: '#' },
      { id: 'logout', label: 'Logout', href: '../login.html', isLogout: true },
    ]
  }
};

// ============================================
// TOPBAR PAGE TITLES
// ============================================
const PAGE_TITLES = {
  'dashboard': 'Dashboard',
  'periode': 'Periode Penilaian',
  'karyawan': 'Data Karyawan',
  'peer': 'Daftar Peer',
  'kuesioner': 'Kuesioner AKHLAK',
  'notifikasi': 'Notifikasi',
  'audit': 'Audit Trail',
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

// Override for manajemen role
const PAGE_TITLES_MANAJEMEN = {
  'dashboard': 'Dashboard Analitik',
  'export': 'Export Report',
};

// ============================================
// RENDER FUNCTIONS
// ============================================

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
        <span class="nav-icon"></span>
        <span>${item.label}</span>
      </a>`;
  });

  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <div class="logo-box">360°</div>
          <span class="brand-text">AKHLAK 360°</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems}
      </nav>
      <div class="sidebar-user">
        <div class="user-avatar">${menu.userInitial}</div>
        <div class="user-info">
          <div class="user-name">${menu.userName}</div>
          <div class="user-email">${menu.userEmail}</div>
        </div>
      </div>
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
        <div class="topbar-bell">🔔</div>
        <div class="topbar-avatar">${menu.userInitial}</div>
        <span class="topbar-user-name">${menu.userName}</span>
      </div>
    </header>`;
}

// ============================================
// INIT
// ============================================
function initComponents() {
  const body = document.body;
  const role = body.getAttribute('data-role');
  const page = body.getAttribute('data-page');

  if (!role || !page) {
    console.warn('Missing data-role or data-page on <body>');
    return;
  }

  // Find or create sidebar container
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) {
    sidebarEl.outerHTML = renderSidebar(role, page);
  }

  // Find or create topbar container
  const topbarEl = document.getElementById('topbar');
  if (topbarEl) {
    topbarEl.outerHTML = renderTopbar(role, page);
  }
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', initComponents);
