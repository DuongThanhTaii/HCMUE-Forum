'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  MessageSquare,
  BookOpen,
  MessageCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'home', href: '/' },
  { icon: MessageSquare, label: 'forum', href: '/forum' },
  { icon: BookOpen, label: 'learning', href: '/learning' },
  { icon: MessageCircle, label: 'chat', href: '/chat' },
  { icon: Briefcase, label: 'career', href: '/career' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <aside
      className={cn(
        'hidden border-r bg-muted/10 transition-all duration-300 md:block',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full',
                      collapsed ? 'justify-center px-2' : 'justify-start'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                    {!collapsed && <span>{t(item.label)}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
