'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
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

const ctaClass =
  'w-auto whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2 text-xs font-bold text-white hover:bg-[#0098db]';

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
      <Link href={learnBasePath(locale, owned.enrollmentId, courseId)} className={cn(buttonVariants({ variant: 'brand' }), ctaClass)}>
        {t.continueLearning}
        <ArrowRight className='size-3 rtl:-scale-x-100' strokeWidth={2.4} aria-hidden />
      </Link>
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
      label={
        owned ? undefined : (
          <>
            {t.enrollNow}
            <ArrowRight className='size-3 rtl:-scale-x-100' strokeWidth={2.4} aria-hidden />
          </>
        )
      }
    />
  );
}
