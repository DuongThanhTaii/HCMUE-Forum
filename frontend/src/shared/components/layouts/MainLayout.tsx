import { Outlet } from 'react-router-dom';
import { ForumTopbar } from './ForumTopbar';
import { ForumSidebar } from '@shared/components/layouts/ForumSidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ForumTopbar />
      <ForumSidebar />
      <div className="pt-14 lg:pl-64">
        <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

