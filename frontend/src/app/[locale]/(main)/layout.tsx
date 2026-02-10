import { Navbar } from '@/components/shared/layouts/Navbar';
import { Sidebar } from '@/components/shared/layouts/Sidebar';
import { Footer } from '@/components/shared/layouts/Footer';
import { Breadcrumbs } from '@/components/shared/layouts/Breadcrumbs';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
