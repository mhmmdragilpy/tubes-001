import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function KaryawanLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar role="karyawan" />
      <div className="main-wrapper">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
