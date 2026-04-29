import { Outlet } from 'react-router-dom';
import { ForumTopbar } from './ForumTopbar';
import { ForumSidebar } from '@shared/components/layouts/ForumSidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ForumTopbar />
      <ForumSidebar />
      <div className="pt-[52px] lg:pl-[250px]">
        <main className="p-4 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

