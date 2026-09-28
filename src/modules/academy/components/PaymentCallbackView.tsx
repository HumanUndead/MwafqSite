'use client';

import { useLocale } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { PaymentStatusView } from '@/modules/payment';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { AcademyBackdrop, AcademyStage } from './ui/AcademyGlass';

const INVALIDATE_KEYS = [['academy-my-courses'], ['academy-course']] as const;

/**
 * Restyles the shared status view (owned by the payment module) from the
 * outside: its root is pulled up over the stage and its white card becomes a
 * light glass panel. Selectors target `root > div` and `root > div > div`.
 */
const statusGlassClass = cn(
  // Root wrapper: stop vertical centring so the card overlaps the stage.
  '[&>div]:min-h-0 [&>div]:items-start [&>div]:px-4 [&>div]:pb-16 [&>div]:pt-0',
  // Card → glass.
  '[&>div>div]:rounded-[28px] [&>div>div]:border [&>div>div]:border-white/70 [&>div>div]:bg-white/75 [&>div>div]:p-7 [&>div>div]:shadow-[0_24px_60px_-24px_rgba(30,35,100,0.35)] [&>div>div]:backdrop-blur-xl sm:[&>div>div]:p-9'
);

/** Moyasar return page for course purchases (confirms, "Confirm again"). */
export function PaymentCallbackView() {
  const locale = useLocale();
  return (
    <AcademyBackdrop className='min-h-[70vh]'>
      <div className='px-2 sm:px-3'>
        <AcademyStage
          className='rounded-[28px] sm:rounded-[36px]'
          innerClassName='h-[200px] py-0 sm:h-[240px]'
        >
          <span aria-hidden />
        </AcademyStage>
      </div>
      <div className={cn('relative z-10 -mt-[150px] sm:-mt-[180px]', statusGlassClass)}>
        <PaymentStatusView
          target='course'
          continueHref={getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES)}
          invalidateKeys={INVALIDATE_KEYS}
        />
      </div>
    </AcademyBackdrop>
  );
}
