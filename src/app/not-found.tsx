import { cookies, headers } from 'next/headers';
import { getDictionary } from '@/i18n/dictionaries';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { NotFoundView } from '@/shared/components/NotFoundView';

export default async function GlobalNotFound() {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const headerLocale = headerStore.get('x-mwafq-locale');
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const raw = headerLocale ?? cookieLocale;
  const locale = raw && hasLocale(raw) ? raw : defaultLocale;

  const dict = await getDictionary(locale);
  const t = dict.notFound;

  return (
    <NotFoundView
      code={t.code}
      title={t.title}
      message={t.message}
      cta={t.cta}
      homeHref={`/${locale}`}
    />
  );
}
