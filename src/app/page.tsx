import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  defaultLocale,
  hasLocale,
  localeCookieName,
  type Locale,
} from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';

export default async function Page() {
  const cookieStore = await cookies();
  const localeValue = cookieStore.get(localeCookieName)?.value;
  const locale: Locale =
    localeValue && hasLocale(localeValue) ? localeValue : defaultLocale;

  redirect(getLocalizedRoute(locale, ROUTES.HOME));
}
