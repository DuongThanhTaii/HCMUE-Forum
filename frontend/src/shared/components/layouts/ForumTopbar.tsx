import { Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';

const MAIN_NAV = [
  { to: '/home', prefix: '/home' },
  { to: '/forum', prefix: '/forum' },
  { to: '/learning/documents', prefix: '/learning' },
  { to: '/career/jobs', prefix: '/career' },
  { to: '/chat', prefix: '/chat' },
] as const;

function navLinkActive(pathname: string, prefix: string) {
  if (prefix === '/home') return pathname === '/home';
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function ForumTopbar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-[52px] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link to="/home" className="flex shrink-0 items-center gap-2">
            <img src="/logohcmue.png" alt="HCMUE" className="h-8 w-auto" />
            <span className="hidden text-sm font-semibold text-primary sm:inline">{t('forum.topbar.brand')}</span>
          </Link>
          <nav className="hidden min-w-0 flex-wrap items-center gap-1 md:flex">
            {MAIN_NAV.map(({ to, prefix }) => {
              const active = navLinkActive(pathname, prefix);
              const labelKey =
                prefix === '/home'
                  ? 'nav.home'
                  : prefix === '/forum'
                    ? 'nav.forum'
                    : prefix === '/learning'
                      ? 'nav.learning'
                      : prefix === '/career'
                        ? 'nav.career'
                        : 'nav.chat';
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>
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
