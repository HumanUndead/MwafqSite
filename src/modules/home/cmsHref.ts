import type { Locale } from '@/i18n/config';
import { hasLocale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';

export function resolveCmsHref(
  locale: Locale,
  href: string | null | undefined
): string | null {
  if (!href) {
    return null;
  }

  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return href;
  }

  if (href.startsWith('#')) {
    return `${getLocalizedRoute(locale, ROUTES.HOME)}${href}`;
  }

  if (!href.startsWith('/')) {
    return href;
  }

  const segments = href.split('/').filter(Boolean);

  if (segments[0] && hasLocale(segments[0])) {
    return href;
  }

  return href === '/'
    ? getLocalizedRoute(locale, ROUTES.HOME)
    : `/${locale}${href}`;
}

export function isNativeAnchorHref(href: string | null | undefined): boolean {
  return Boolean(
    href &&
    !href.startsWith('http://') &&
    !href.startsWith('https://') &&
    !href.startsWith('mailto:') &&
    !href.startsWith('tel:')
  );
}
