import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
