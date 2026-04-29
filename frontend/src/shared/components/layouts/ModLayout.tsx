import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layout Tree:
// ModLayout [min-h-screen bg-amber-50]
// ├── Header [h-14 flex items-center px-6 border-b border-amber-200 bg-white]
// └── Body [p-6]
export function ModLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="h-14 border-b border-amber-200 bg-white px-6 flex items-center">
        <h1 className="text-base font-semibold text-amber-700">{t('mod.layout.title')}</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

