'use client';

import { useLocale } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { PaymentStatusView } from '@/modules/payment';
import { ROUTES } from '@/shared/constants/routes';
import { AcademyBackdrop } from './ui/AcademyGlass';

const INVALIDATE_KEYS = [['academy-my-courses'], ['academy-course']] as const;

/**
 * Aligns the shared status card (owned by the payment module) with the
 * product panel from the outside: 1px border, 16px radius, no extra height.
 * Selectors target `root > div` (wrapper) and `root > div > div` (card).
 */
const statusPanelClass =
  '[&>div]:min-h-[50vh] [&>div]:py-10 [&>div>div]:rounded-2xl [&>div>div]:border [&>div>div]:p-6 sm:[&>div>div]:p-8';

/** Moyasar return page for course purchases (confirms, "Confirm again"). */
export function PaymentCallbackView() {
  const locale = useLocale();
  return (
    <AcademyBackdrop className='min-h-[70vh]'>
      <div className={statusPanelClass}>
        <PaymentStatusView
          target='course'
          continueHref={getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES)}
          invalidateKeys={INVALIDATE_KEYS}
        />
      </div>
    </AcademyBackdrop>
  );
}
