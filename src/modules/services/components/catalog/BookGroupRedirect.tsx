'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useLocale } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ROUTES } from '@/shared/constants/routes';
import { useBasketStore, type BasketGroup } from '../../store/basketStore';

/**
 * Legacy `/services/[id]/buy` entry: select the group (replacing whatever
 * the basket held — the user explicitly chose to buy it) and open checkout.
 */
export function BookGroupRedirect({ group }: { group: BasketGroup }) {
  const router = useRouter();
  const locale = useLocale();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    useBasketStore.getState().setServiceGroup(group);
    router.replace(getLocalizedRoute(locale, ROUTES.CHECKOUT));
  }, [group, locale, router]);

  return (
    <div className='flex min-h-[50vh] items-center justify-center'>
      <Spinner size='lg' />
    </div>
  );
}
