'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { academyApi } from '@/modules/profile-academy/api/academyApi';
import { buttonVariants } from '@/shared/components/ui/Button';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { cn } from '@/shared/lib/cn';
import { learnBasePath } from '../learnRoutes.shared';
import type { CoursePaymentSettings } from '../types/payment.types';
import { EnrollButton } from './EnrollButton';

interface CourseEnrollCtaProps {
  courseId: number;
  courseTitle: string;
  paymentSettings?: CoursePaymentSettings | null;
}

/** The page's one primary action, full width in the purchase panel / bar. */
const ctaClass = 'w-full whitespace-nowrap';

/**
 * Owned → Continue learning; pending payment → Continue payment (resume);
 * otherwise the enrol / buy flow.
 */
export function CourseEnrollCta({ courseId, courseTitle, paymentSettings }: CourseEnrollCtaProps) {
  const t = useTranslations('academyCourseDetails');
  const locale = useLocale();
  const hydrated = useHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const searchParams = useSearchParams();
  const payParam = Number(searchParams.get('pay')) || null;

  const mine = useQuery({
    queryKey: ['academy-my-courses', 'rows'],
    queryFn: async () => (await academyApi.getMyCourses()).data,
    enabled: hydrated && isAuthenticated,
  });
  const owned = mine.data?.find((row) => row.courseId === courseId);

  if (owned && !owned.awaitingPayment) {
    return (
      <div className='flex w-full flex-col gap-2'>
        <p className='hidden items-center gap-1.5 text-[14px] font-semibold text-green-800 lg:flex'>
          <CheckCircle2 className='size-4 shrink-0' aria-hidden />
          {t.owned}
        </p>
        <Link
          href={learnBasePath(locale, owned.enrollmentId, courseId)}
          className={cn(buttonVariants({ variant: 'product', size: 'control' }), ctaClass)}
        >
          {t.continueLearning}
        </Link>
      </div>
    );
  }

  return (
    <EnrollButton
      key={owned?.enrollmentId ?? 'new'}
      courseId={courseId}
      courseTitle={courseTitle}
      paymentSettings={paymentSettings}
      className={ctaClass}
      resume={owned ? { userCourseId: owned.enrollmentId, amountOwed: owned.amountOwed } : undefined}
      defaultOpen={!!owned && payParam === owned.enrollmentId}
      label={owned ? undefined : t.enrollNow}
    />
  );
}
