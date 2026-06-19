import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AtasanLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar role="atasan" />
      <div className="main-wrapper">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
