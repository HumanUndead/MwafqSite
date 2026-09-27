'use client';

import { useLocale } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { PaymentStatusView } from '@/modules/payment';
import { ROUTES } from '@/shared/constants/routes';

const INVALIDATE_KEYS = [['academy-my-courses'], ['academy-course']] as const;

/** Moyasar return page for course purchases (confirms, "Confirm again"). */
export function PaymentCallbackView() {
  const locale = useLocale();
  return (
    <PaymentStatusView
      target='course'
      continueHref={getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES)}
      invalidateKeys={INVALIDATE_KEYS}
    />
  );
}
