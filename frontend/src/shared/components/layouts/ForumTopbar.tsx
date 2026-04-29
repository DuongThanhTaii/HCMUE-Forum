import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';

export function ForumTopbar() {
  const { t } = useTranslation();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-[52px] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <img src="/logohcmue.png" alt="HCMUE" className="h-8 w-auto" />
          <span className="hidden text-sm font-semibold text-primary sm:inline">{t('forum.topbar.brand')}</span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <label className="flex h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-2 text-slate-500">
            <Search className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder={t('forum.topbar.searchPlaceholder')}
              className="w-28 border-0 bg-transparent text-xs text-slate-700 outline-none sm:w-44"
            />
          </label>
          <Link
            to="/login"
            className="inline-flex h-8 items-center rounded-md border border-primary/20 px-3 text-xs font-medium text-primary hover:bg-primary/5"
          >
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </header>
  );
}
