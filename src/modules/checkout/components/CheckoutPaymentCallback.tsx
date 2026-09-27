'use client';

import { useCallback } from 'react';
import { useLocale } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { PaymentStatusView } from '@/modules/payment';
import { useBasketStore } from '@/modules/services/store/basketStore';
import { ROUTES } from '@/shared/constants/routes';
import { useCheckoutDraftStore } from '../store/checkoutDraftStore';

const INVALIDATE_KEYS = [['reservations'], ['academy-my-courses']] as const;

/** Moyasar return page for reservations: confirm, then clear the booking. */
export function CheckoutPaymentCallback() {
  const locale = useLocale();
  const onSettled = useCallback(() => {
    useCheckoutDraftStore.getState().reset();
    useBasketStore.getState().clear();
  }, []);

  return (
    <PaymentStatusView
      target='reservation'
      continueHref={getLocalizedRoute(locale, ROUTES.MY_RESERVATIONS)}
      retryHref={`${getLocalizedRoute(locale, ROUTES.CHECKOUT)}?step=confirm`}
      invalidateKeys={INVALIDATE_KEYS}
      onSettled={onSettled}
    />
  );
}
