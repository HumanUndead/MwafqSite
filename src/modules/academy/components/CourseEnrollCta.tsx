'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, PlayCircle } from 'lucide-react';
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

/** Full-width sky primary action used on the course landing purchase card. */
const ctaClass =
  'h-12 w-full whitespace-nowrap rounded-full bg-[#00a8f1] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(0,168,241,0.8)] hover:bg-[#0090d1] focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2';

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
        <p className='hidden items-center gap-1.5 text-sm font-semibold text-emerald-700 lg:flex'>
          <CheckCircle2 className='size-4 shrink-0' aria-hidden />
          {t.owned}
        </p>
        <Link
          href={learnBasePath(locale, owned.enrollmentId, courseId)}
          className={cn(buttonVariants({ variant: 'brand' }), ctaClass)}
        >
          <PlayCircle className='size-[18px] shrink-0' strokeWidth={2.2} aria-hidden />
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
