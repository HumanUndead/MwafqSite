import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';

export function getServiceGroupDetailPath(
  locale: Locale,
  serviceGroupId: number
): string {
  return `${getLocalizedRoute(locale, ROUTES.SERVICES)}/${serviceGroupId}`;
}

/** Legacy entry: selects the group in the basket and opens checkout. */
export function getServiceGroupBuyPath(
  locale: Locale,
  serviceGroupId: number
): string {
  return `${getLocalizedRoute(locale, ROUTES.SERVICES)}/${serviceGroupId}/buy`;
}
