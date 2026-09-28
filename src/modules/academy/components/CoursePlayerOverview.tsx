'use client';

import { Star } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { safeHtml } from '@/shared/lib/safeHtml';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { getAllCourseItems } from '../courseLocking.shared';
import { transformCourseDetailToCourseData } from '../courseTransform.shared';
import { lecturePath, quizPath } from '../learnRoutes.shared';
import type { CoursePlayerLesson } from '../types/player.types';
import { AcademyBackdrop, GlassPanel } from './ui/AcademyGlass';
import { OverviewCurriculum } from './overview/OverviewCurriculum';
import { OverviewHero } from './overview/OverviewHero';
import { OverviewSidebar } from './overview/OverviewSidebar';
import { OverviewNotFound, OverviewSkeleton } from './overview/OverviewStates';

interface CoursePlayerOverviewProps {
  userCourseId: number;
  courseId: number;
}

export function CoursePlayerOverview({
  userCourseId,
  courseId,
}: CoursePlayerOverviewProps) {
  const t = useTranslations('academyPlayer');
  const locale = useLocale();
  const {
    data: courseDetail,
    isLoading,
    isError,
  } = useCourseDetail(userCourseId, courseId, locale);

  const myCoursesHref = getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES);
  // GetCourseByUserId has no course-level flag: 100% progress means done.
  const courseCompleted = Boolean(
    courseDetail &&
      (courseDetail.isCompleted || courseDetail.courseProgressPercentage >= 100)
  );

  if (isLoading) {
    return <OverviewSkeleton t={t} />;
  }

  if (isError || !courseDetail) {
    return <OverviewNotFound t={t} backHref={myCoursesHref} />;
  }

  const courseData = transformCourseDetailToCourseData(
    courseDetail,
    String(courseId)
  );
  const allItems = getAllCourseItems(courseData.sections);
  // Resume (mobile): the last lecture while unfinished, else the first
  // required item still to do, else the last lecture / first lecture.
  const lastLectureItem = courseDetail.lastLecture
    ? allItems.find(
        (item) =>
          item.type === 'lecture' && item.id === String(courseDetail.lastLecture?.id)
      )
    : undefined;
  const firstPending = allItems.find(
    (item) =>
      item.type !== 'attachment' &&
      !item.isCompleted &&
      !item.isExtraLecture &&
      !item.isRevision
  );
  const resumeItem =
    lastLectureItem && !lastLectureItem.isCompleted
      ? lastLectureItem
      : (firstPending ??
        lastLectureItem ??
        allItems.find((item) => item.type === 'lecture'));
  const resumeHref = resumeItem
    ? resumeItem.type === 'quiz'
      ? quizPath(locale, userCourseId, courseId, resumeItem.id)
      : lecturePath(locale, userCourseId, courseId, resumeItem.id)
    : null;

  const totalItems = courseData.sections.reduce((acc, section) => {
    if (section.type === 'lesson' || section.type === 'attachments') {
      return acc + (section.data as CoursePlayerLesson).items.length;
    }
    return acc + 1;
  }, 0);

  // Display-only counts for the progress card (attachments aren't tracked).
  const trackedItems = allItems.filter((item) => item.type !== 'attachment');
  const completedCount = trackedItems.filter((item) => item.isCompleted).length;

  const lastLectureHref = courseDetail.lastLecture
    ? lecturePath(locale, userCourseId, courseId, courseDetail.lastLecture.id)
    : null;

  return (
    <AcademyBackdrop>
      <OverviewHero
        t={t}
        title={courseData.title}
        description={courseData.description}
        image={courseData.image}
        tags={courseData.tags}
        duration={courseData.duration}
        totalLectures={courseDetail.totalLectures}
        sectionsCount={courseData.sections.length}
        totalItems={totalItems}
        progress={courseData.currentProgress}
        completedCount={completedCount}
        trackedCount={trackedItems.length}
        isRevisionAvailable={courseData.isRevisionAvailable}
        revisionProgress={courseData.revisionProgress}
        myCoursesHref={myCoursesHref}
        resumeHref={resumeHref}
        upNext={
          resumeItem && resumeItem.type !== 'attachment'
            ? {
                title: resumeItem.title,
                type: resumeItem.type === 'quiz' ? 'quiz' : 'lecture',
                minutes: Number(resumeItem.duration) || 0,
              }
            : null
        }
        hasLastLecture={!!courseDetail.lastLecture}
        courseCompleted={courseCompleted}
      />

      <div className='mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-10'>
        {courseDetail.isReviewActive && courseDetail.reviewText && (
          <GlassPanel
            role='note'
            className='mb-8 flex items-center gap-3 rounded-[18px] border-[#00a8f1]/25 bg-[#00a8f1]/[0.07] px-4 py-3'
          >
            <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-[#00a8f1]/15 text-[#0090d1]'>
              <Star aria-hidden className='size-4' />
            </span>
            <div className='flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
              <h2 className='text-[14px] font-bold text-[#1e2364]'>
                {t.reviewNotice}
              </h2>
              {/* Dashboard rich text (e.g. `<p>…</p>`), not plain text. */}
              <div
                className='min-w-0 text-[14px] text-[#1e2364]/80 [&_p]:m-0'
                dangerouslySetInnerHTML={{
                  __html: safeHtml(courseDetail.reviewText),
                }}
              />
            </div>
          </GlassPanel>
        )}

        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start'>
          <OverviewCurriculum
            t={t}
            courseData={courseData}
            totalItems={totalItems}
            locale={locale}
            userCourseId={userCourseId}
            courseId={courseId}
            currentItem={resumeItem}
          />
          <aside className='lg:sticky lg:top-[110px]'>
            <OverviewSidebar
              t={t}
              lastLecture={courseDetail.lastLecture}
              lastLectureHref={lastLectureHref}
              whatYouLearn={courseData.whatYouLearn}
              progress={courseData.currentProgress}
              sectionsCount={courseData.sections.length}
              totalItems={totalItems}
              totalLectures={courseDetail.totalLectures}
              courseCompleted={courseCompleted}
            />
          </aside>
        </div>
      </div>
    </AcademyBackdrop>
  );
}
