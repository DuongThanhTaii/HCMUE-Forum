'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'vi' ? 'en' : 'vi';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={switchLocale}
      title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <Globe className="h-5 w-5" />
      <span className="ml-2 text-sm font-medium">{locale === 'vi' ? 'EN' : 'VI'}</span>
      <span className="sr-only">Switch language</span>
    </Button>
  );
}
