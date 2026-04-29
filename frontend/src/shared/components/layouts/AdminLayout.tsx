import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layout Tree:
// AdminLayout [min-h-screen bg-rose-50]
// ├── Header [h-14 flex items-center px-6 border-b border-rose-200 bg-white]
// └── Body [p-6]
export function AdminLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-rose-50">
      <header className="h-14 border-b border-rose-200 bg-white px-6 flex items-center">
        <h1 className="text-base font-semibold text-rose-700">{t('admin.layout.title')}</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

