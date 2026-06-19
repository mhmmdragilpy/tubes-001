import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function ManajemenLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar role="manajemen" />
      <div className="main-wrapper">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
