'use client';

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Locale } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { AcademyLanguagePicker } from '@/modules/academy/components/AcademyLanguagePicker';
import {
  EmptyState,
  Notice,
  PageHeader,
  Panel,
  productCountClass,
  productTabsListClass,
  productTabsTriggerClass,
} from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { ContinueLearningCard } from './components/ContinueLearningCard';
import { EnrolledCourseCard } from './components/EnrolledCourseCard';
import type { AcademyCourseRow } from './types/academy.types';

/** Highest progress, then rank, then lowest id (mobile `pickResumeCourse`). */
function pickResume(courses: AcademyCourseRow[]): AcademyCourseRow | null {
  return (
    [...courses].sort(
      (a, b) =>
        b.progress - a.progress ||
        b.rank - a.rank ||
        a.enrollmentId - b.enrollmentId
    )[0] ?? null
  );
}

type FilterKey = 'all' | 'inProgress' | 'awaitingPayment' | 'completed';

export type AcademyCoursesViewProps = {
  courses?: readonly AcademyCourseRow[];
  /** Shown above the list (e.g. viewing a family member's courses). */
  notice?: string;
};

/**
 * "My learning": the course to resume, then every course filtered by status
 * (all / in progress / awaiting payment / completed). Grouping and resume
 * rules match the mobile app.
 */
export function AcademyCoursesView({ courses, notice }: AcademyCoursesViewProps) {
  const rows = [...(courses ?? [])];
  const t = useTranslations('profileAcademy');
  const locale = useLocale() as Locale;
  const [filter, setFilter] = useState<FilterKey>('all');

  const awaitingPayment = rows.filter((c) => c.awaitingPayment);
  const paid = rows.filter((c) => !c.awaitingPayment);
  const completed = paid.filter((c) => c.isCourseCompleted);
  const studying = paid.filter((c) => !c.isCourseCompleted);
  const resume = pickResume(studying.filter((c) => !c.isLocked));

  const lists: Record<FilterKey, AcademyCourseRow[]> = {
    all: [...studying, ...awaitingPayment, ...completed],
    inProgress: studying,
    awaitingPayment,
    completed,
  };
  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'inProgress', label: t.inProgress },
    { key: 'awaitingPayment', label: t.awaitingPayment },
    { key: 'completed', label: t.completed },
  ];

  // Own stack: the page wraps this in AcademyScope's <div dir>, which hides
  // it from the profile layout's gap.
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={<AcademyLanguagePicker />}
      />

      {notice ? <Notice>{notice}</Notice> : null}

      {rows.length === 0 ? (
        // A blocked family view already explains itself in the notice.
        notice ? null : (
          <Panel>
            <EmptyState
              icon={<GraduationCap aria-hidden />}
              title={t.emptyTitle}
              description={t.emptyBody}
              action={
                <Link
                  href={getLocalizedRoute(locale, ROUTES.COURSES)}
                  className={buttonVariants({ variant: 'product', size: 'control' })}
                >
                  {t.browseCourses}
                </Link>
              }
            />
          </Panel>
        )
      ) : (
        <>
          {resume ? (
            <ContinueLearningCard course={resume} locale={locale} t={t} />
          ) : null}

          <Tabs value={filter} onValueChange={(next) => setFilter(next as FilterKey)}>
            <TabsList
              variant='line'
              aria-label={t.filterLabel}
              className={cn(
                productTabsListClass,
                // shadcn sets h-8 via a group variant; plain h-auto loses to it.
                'group-data-[orientation=horizontal]/tabs:h-auto'
              )}
            >
              {filters.map((item) => (
                <TabsTrigger
                  key={item.key}
                  value={item.key}
                  className={productTabsTriggerClass}
                >
                  {item.label}
                  <span className={productCountClass}>{lists[item.key].length}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {filters.map((item) => (
              <TabsContent key={item.key} value={item.key} className='mt-4'>
                {lists[item.key].length === 0 ? (
                  <Panel>
                    <EmptyState title={t.emptyFilter} />
                  </Panel>
                ) : (
                  <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                    {lists[item.key].map((course) => (
                      <li key={course.id} className='min-w-0'>
                        <EnrolledCourseCard course={course} locale={locale} t={t} />
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}
