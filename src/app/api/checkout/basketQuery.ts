import type { NextRequest } from 'next/server';
import { resolveLocale } from '@/i18n/routing';
import type { BasketQuery } from '@/modules/checkout/server/checkoutService';
import { toPositiveInt } from '@/shared/lib/upstream';

/** Reads `serviceIds=1,2` / `serviceGroupId=3` + `locale` from a request. */
export function readBasketQuery(request: NextRequest): {
  basket: BasketQuery | null;
  locale: ReturnType<typeof resolveLocale>;
} {
  const params = request.nextUrl.searchParams;
  const serviceGroupId = toPositiveInt(params.get('serviceGroupId'));
  const serviceIds = params
    .getAll('serviceIds')
    .flatMap((value) => value.split(','))
    .map(toPositiveInt)
    .filter((id): id is number => id !== null);
  const locale = resolveLocale(params.get('locale'));

  if (!serviceGroupId && serviceIds.length === 0) {
    return { basket: null, locale };
  }
  return { basket: { serviceIds, serviceGroupId }, locale };
}
