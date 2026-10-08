'use client';

import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { Notice } from '@/shared/components/product';
import { ROUTES } from '@/shared/constants/routes';
import { stripHtmlTags } from '@/shared/lib/htmlText';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { getAllCourseItems } from '../courseLocking.shared';
import { transformCourseDetailToCourseData } from '../courseTransform.shared';
import { lecturePath, quizPath } from '../learnRoutes.shared';
import type { CoursePlayerLesson } from '../types/player.types';
import { AcademyBackdrop } from './ui/AcademyGlass';
import { OverviewCurriculum } from './overview/OverviewCurriculum';
import { OverviewHero } from './overview/OverviewHero';
import { OverviewSidebar } from './overview/OverviewSidebar';
import {
  OverviewNotFound,
  OverviewSkeleton,
  overviewContainerClass,
} from './overview/OverviewStates';

interface CoursePlayerOverviewProps {
  userCourseId: number;
  courseId: number;
}

/** Enrolled course home: progress + resume, then the curriculum. */
export function CoursePlayerOverview({ userCourseId, courseId }: CoursePlayerOverviewProps) {
  const t = useTranslations('academyPlayer');
  const locale = useLocale();
  const {
    data: courseDetail,
    isLoading,
    isError,
    refetch,
  } = useCourseDetail(userCourseId, courseId, locale);

  const myCoursesHref = getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES);
  // GetCourseByUserId has no course-level flag: 100% progress means done.
  const courseCompleted = Boolean(
    courseDetail &&
      (courseDetail.isCompleted || courseDetail.courseProgressPercentage >= 100)
  );

  if (isLoading) {
    return (
      <AcademyBackdrop>
        <OverviewSkeleton t={t} />
      </AcademyBackdrop>
    );
  }

  if (isError || !courseDetail) {
    return (
      <AcademyBackdrop>
        <OverviewNotFound
          t={t}
          backHref={myCoursesHref}
          onRetry={isError ? () => void refetch() : undefined}
        />
      </AcademyBackdrop>
    );
  }

  const courseData = transformCourseDetailToCourseData(courseDetail, String(courseId));
  const allItems = getAllCourseItems(courseData.sections);
  // Resume: the last lecture while unfinished, else the first required item
  // still to do, else the last lecture / first lecture.
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

  // Display-only counts for the progress panel (attachments aren't tracked).
  const trackedItems = allItems.filter((item) => item.type !== 'attachment');
  const completedCount = trackedItems.filter((item) => item.isCompleted).length;
  const reviewText = courseDetail.isReviewActive ? stripHtmlTags(courseDetail.reviewText) : null;
  const hasSidebar = courseData.whatYouLearn.length > 0;

  return (
    <AcademyBackdrop>
      <div className={overviewContainerClass}>
        <OverviewHero
          t={t}
          title={courseData.title}
          description={courseData.description}
          duration={courseData.duration}
          totalLectures={courseDetail.totalLectures}
          sectionsCount={courseData.sections.length}
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

        {reviewText && (
          <Notice>
            <span className='font-bold'>{t.reviewNotice}:</span>{' '}
            <span className='font-normal'>{reviewText}</span>
          </Notice>
        )}

        <div
          className={
            hasSidebar
              ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start'
              : 'grid gap-6'
          }
        >
          <OverviewCurriculum
            t={t}
            courseData={courseData}
            totalItems={totalItems}
            locale={locale}
            userCourseId={userCourseId}
            courseId={courseId}
            currentItem={resumeItem}
          />
          {hasSidebar && (
            <aside className='lg:sticky lg:top-[110px]'>
              <OverviewSidebar t={t} whatYouLearn={courseData.whatYouLearn} />
            </aside>
          )}
        </div>
      </div>
    </AcademyBackdrop>
  );
}
