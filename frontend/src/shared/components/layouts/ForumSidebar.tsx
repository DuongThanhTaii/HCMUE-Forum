import { Link, useLocation } from 'react-router-dom';
import { Hash, Layers3, MessageSquare, Tag } from 'lucide-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

type SidebarItem = {
  to: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
};

const TOPIC_ITEMS: SidebarItem[] = [
  { to: '/forum?topic=all', labelKey: 'forum.sidebar.topics.all', icon: MessageSquare },
  { to: '/forum?topic=thong-bao', labelKey: 'forum.sidebar.topics.announcements', icon: Hash },
];

const CATEGORY_ITEMS: SidebarItem[] = [
  { to: '/learning/documents', labelKey: 'forum.sidebar.categories.learningDocs', icon: Layers3 },
  { to: '/career/jobs', labelKey: 'forum.sidebar.categories.career', icon: Layers3 },
];

const TAG_ITEMS: SidebarItem[] = [
  { to: '/forum?tag=hot', labelKey: 'forum.sidebar.tags.hot', icon: Tag },
  { to: '/forum?tag=hoi-dap', labelKey: 'forum.sidebar.tags.qa', icon: Tag },
];

function isItemActive(pathname: string, search: string, to: string) {
  const currentParams = new URLSearchParams(search);
  const targetUrl = new URL(to, 'https://hcmue.local');
  const targetPath = targetUrl.pathname;
  const targetParams = targetUrl.searchParams;

  if (!(pathname === targetPath || pathname.startsWith(`${targetPath}/`))) {
    return false;
  }

  let matchesQuery = true;
  targetParams.forEach((value, key) => {
    if (currentParams.get(key) !== value) {
      matchesQuery = false;
    }
  });

  if (!matchesQuery) {
    return false;
  }

  return true;
}

function SidebarSection({
  title,
  items,
  pathname,
  search,
}: {
  title: string;
  items: SidebarItem[];
  pathname: string;
  search: string;
}) {
  const { t } = useTranslation();

  return (
    <section className="space-y-1">
      <h2 className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = isItemActive(pathname, search, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                active ? 'bg-primary/10 font-medium text-primary' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ForumSidebar() {
  const { pathname, search } = useLocation();
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-[52px] z-30 hidden h-[calc(100vh-52px)] w-[250px] border-r border-slate-200 bg-white lg:block">
      <div className="h-full space-y-4 overflow-y-auto p-3">
        <SidebarSection title={t('forum.sidebar.sections.topics')} items={TOPIC_ITEMS} pathname={pathname} search={search} />
        <SidebarSection title={t('forum.sidebar.sections.categories')} items={CATEGORY_ITEMS} pathname={pathname} search={search} />
        <SidebarSection title={t('forum.sidebar.sections.tags')} items={TAG_ITEMS} pathname={pathname} search={search} />
        <div className="rounded-md border border-jasper/20 bg-jasper/5 px-2 py-1.5 text-[11px] text-jasper">
          {t('forum.sidebar.notice')}
        </div>
      </div>
    </aside>
  );
}
