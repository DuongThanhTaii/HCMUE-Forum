import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">UniHub</h3>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">{t('products')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/forum" className="hover:underline">{t('forum')}</Link></li>
              <li><Link href="/learning" className="hover:underline">{t('learning')}</Link></li>
              <li><Link href="/chat" className="hover:underline">{t('chat')}</Link></li>
              <li><Link href="/career" className="hover:underline">{t('career')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">{t('support')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:underline">{t('help')}</Link></li>
              <li><Link href="/about" className="hover:underline">{t('about')}</Link></li>
              <li><Link href="/contact" className="hover:underline">{t('contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">{t('legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:underline">{t('privacy')}</Link></li>
              <li><Link href="/terms" className="hover:underline">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          {t('copyright', { year: currentYear })}
        </div>
      </div>
    </footer>
  );
}
