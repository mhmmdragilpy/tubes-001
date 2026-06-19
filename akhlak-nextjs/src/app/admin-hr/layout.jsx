import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AdminHRLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar role="admin-hr" />
      <div className="main-wrapper">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
