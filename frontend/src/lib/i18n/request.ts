import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This is called before layout.tsx so we need to get locale from routing
  let locale = await requestLocale;

  // Ensure locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
