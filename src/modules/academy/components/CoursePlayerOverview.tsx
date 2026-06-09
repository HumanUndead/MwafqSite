'use client';

import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Lock,
  Play,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import type { Dictionary } from '@/locales/types';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { useCourseDetail } from '../hooks/useCourseDetail';
import {
  getAllCourseItems,
  isCourseQuizLocked,
  isItemLocked,
} from '../courseLocking.shared';
import { transformCourseDetailToCourseData } from '../courseTransform.shared';
import { lecturePath, quizHistoryPath, quizPath } from '../learnRoutes.shared';
import type { CourseItem, CoursePlayerLesson } from '../types/player.types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';

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

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4'>
        <div className='space-y-6 text-center'>
          <div className='flex justify-center'>
            <div className='size-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#00a8f1]' />
          </div>
          <p className='text-xl font-semibold text-gray-900'>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (isError || !courseDetail) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
        <div className='mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
          <div className='space-y-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg'>
            <div className='mx-auto flex size-20 items-center justify-center rounded-full bg-red-100'>
              <BookOpen className='size-10 text-red-600' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {t.notFoundTitle}
            </h1>
            <p className='text-lg text-gray-600'>{t.notFoundMessage}</p>
            <Link
              href={getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES)}
              className='inline-block rounded-lg bg-[#00a8f1] px-6 py-3 font-medium text-white transition-all hover:opacity-90'
            >
              {t.backToMyCourses}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const courseData = transformCourseDetailToCourseData(
    courseDetail,
    String(courseId)
  );
  const allItems = getAllCourseItems(courseData.sections);
  const firstLecture = allItems.find((item) => item.type === 'lecture');
  const continueLectureId = courseDetail.lastLecture?.id ?? firstLecture?.id;
  const myCoursesHref = getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES);

  const totalItems = courseData.sections.reduce((acc, section) => {
    if (section.type === 'lesson' || section.type === 'attachments') {
      return acc + (section.data as CoursePlayerLesson).items.length;
    }
    return acc + 1;
  }, 0);

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Review notice */}
      {courseDetail.isReviewActive && courseDetail.reviewText && (
        <div className='mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8'>
          <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 shadow-sm'>
            <div className='flex items-start'>
              <Star className='mt-0.5 size-5 shrink-0 text-blue-500' />
              <div className='ms-3 flex-1'>
                <h3 className='text-sm font-medium text-blue-800'>
                  {t.reviewNotice}
                </h3>
                <p className='mt-1 text-sm text-blue-700'>
                  {courseDetail.reviewText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className='relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900'>
        <div className='absolute inset-0 opacity-20'>
          <Image
            src={courseData.image}
            alt={courseData.title}
            fill
            className='object-cover'
            priority
            sizes='100vw'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90' />
        </div>

        <div className='relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
          <div className='grid gap-8 lg:grid-cols-3'>
            <div className='space-y-6 lg:col-span-2'>
              <nav className='flex items-center gap-2 text-sm'>
                <Link
                  href={myCoursesHref}
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  {t.breadcrumbHome}
                </Link>
                <ChevronDown className='size-4 -rotate-90 text-gray-500 rtl:rotate-90' />
                <span className='font-medium text-white'>
                  {t.currentCourse}
                </span>
              </nav>

              <div className='space-y-4'>
                <h1 className='text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl'>
                  {courseData.title}
                </h1>
                {courseData.description && (
                  <div
                    className='max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg'
                    dangerouslySetInnerHTML={{ __html: courseData.description }}
                  />
                )}
              </div>

              {courseData.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {courseData.tags.map((tag) => (
                    <span
                      key={tag}
                      className='rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-300 sm:gap-6 sm:text-base'>
                <div className='flex items-center gap-2'>
                  <Clock className='size-5' />
                  <span>{courseData.duration}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <BookOpen className='size-5' />
                  <span>
                    {courseDetail.totalLectures} {t.lectures}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop course card */}
            <div className='hidden lg:block'>
              <div className='sticky top-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl'>
                <div className='relative h-48 w-full'>
                  <Image
                    src={courseData.image}
                    alt={courseData.title}
                    fill
                    className='object-cover'
                    sizes='420px'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                    <div className='flex size-16 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm'>
                      <Play className='ms-1 size-8 text-gray-900' />
                    </div>
                  </div>
                </div>
                <div className='space-y-4 p-6'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>
                      {t.lastUpdated}
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {courseDetail.totalLectures}
                    </span>
                  </div>

                  {continueLectureId ? (
                    <Link
                      href={lecturePath(
                        locale,
                        userCourseId,
                        courseId,
                        continueLectureId
                      )}
                      className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00a8f1] to-[#1e2364] py-4 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-xl'
                    >
                      <Play className='size-5' />
                      {courseDetail.lastLecture
                        ? t.continueLearning
                        : t.startLearning}
                    </Link>
                  ) : null}

                  <div className='flex items-center justify-center gap-6 border-t border-gray-200 pt-4'>
                    <div className='text-center'>
                      <BookOpen className='mx-auto mb-1 size-6 text-[#00a8f1]' />
                      <span className='text-xs text-gray-600'>
                        {courseData.sections.length} {t.sections}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className='border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl space-y-3 px-4 py-6 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {t.yourProgress}
            </h3>
            <span className='text-2xl font-bold text-[#00a8f1]'>
              {courseData.currentProgress}%
            </span>
          </div>
          <div className='relative h-4 overflow-hidden rounded-full bg-gray-200'>
            <div
              className='absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-[#00a8f1] to-[#1e2364] shadow-md transition-all duration-500 ease-out'
              style={{ width: `${courseData.currentProgress}%` }}
            >
              <div className='absolute inset-0 animate-pulse bg-white/20' />
            </div>
          </div>
          <p className='text-sm text-gray-600'>{t.keepGoing}</p>
        </div>
      </div>

      {/* Continue learning */}
      {courseDetail.lastLecture && (
        <div className='border-b border-gray-200 bg-gradient-to-r from-[#00a8f1]/5 to-[#1e2364]/5'>
          <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
            <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg'>
              <div className='flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between'>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Clock className='size-4' />
                    <span>{t.lastWatched}</span>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {courseDetail.lastLecture.name ||
                      `${t.lecture} ${courseDetail.lastLecture.id}`}
                  </h3>
                  {courseDetail.lastLecture.description && (
                    <div
                      className='line-clamp-2 text-sm text-gray-600'
                      dangerouslySetInnerHTML={{
                        __html: courseDetail.lastLecture.description,
                      }}
                    />
                  )}
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <span className='flex items-center gap-1'>
                      <Play className='size-4' />
                      {courseDetail.lastLecture.videoLengthInMinutes}{' '}
                      {t.minutes}
                    </span>
                    {courseDetail.lastLecture.textContent && (
                      <span className='flex items-center gap-1'>
                        <FileText className='size-4' />
                        {t.hasContent}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={lecturePath(
                    locale,
                    userCourseId,
                    courseId,
                    courseDetail.lastLecture.id
                  )}
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00a8f1] to-[#1e2364] px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg'
                >
                  <Play className='size-5' />
                  {t.continueLearning}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg'>
              <div className='border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6'>
                <h2 className='flex items-center gap-3 text-2xl font-bold text-gray-900'>
                  <BookOpen className='size-7 text-[#00a8f1]' />
                  {t.courseCurriculum}
                </h2>
                <p className='mt-2 text-gray-600'>
                  {courseData.sections.length} {t.sectionsCount} • {totalItems}{' '}
                  {t.itemsCount}
                </p>
              </div>

              <Accordion
                multiple
                defaultValue={courseData.sections
                  .filter((s) => s.type === 'lesson')
                  .slice(0, 1)
                  .map((s) => (s.data as CoursePlayerLesson).id)}
                className='divide-y divide-gray-200'
              >
                {courseData.sections.map((section, sectionIndex) => {
                  if (
                    section.type === 'lesson' ||
                    section.type === 'attachments'
                  ) {
                    const lesson = section.data as CoursePlayerLesson;
                    const completed = lesson.items.filter(
                      (i) => i.isCompleted
                    ).length;
                    const isAttachments = section.type === 'attachments';

                    return (
                      <AccordionItem
                        key={lesson.id}
                        value={lesson.id}
                        className='border-b-0'
                      >
                        <AccordionPrimitive.Header>
                          <AccordionPrimitive.Trigger className='group w-full'>
                            <div
                              className={`flex items-center justify-between p-6 transition-colors hover:bg-gray-50 ${
                                isAttachments ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className='flex flex-1 items-start gap-4 text-left'>
                                <div
                                  className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold transition-colors ${
                                    isAttachments
                                      ? 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
                                      : 'bg-[#00a8f1]/10 text-[#1e2364] group-hover:bg-[#00a8f1] group-hover:text-white'
                                  }`}
                                >
                                  {isAttachments ? (
                                    <Download className='size-5' />
                                  ) : (
                                    sectionIndex + 1
                                  )}
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                                    {isAttachments
                                      ? t.courseAttachments
                                      : lesson.title}
                                  </h3>
                                  <div className='flex items-center gap-4 text-sm text-gray-600'>
                                    <span>
                                      {isAttachments
                                        ? `${lesson.items.length} ${t.files}`
                                        : `${completed} ${t.of} ${lesson.items.length} ${t.completed}`}
                                    </span>
                                    {!isAttachments && (
                                      <div className='h-1.5 w-32 max-w-32 flex-1 overflow-hidden rounded-full bg-gray-200'>
                                        <div
                                          className='h-full rounded-full bg-green-500 transition-all duration-300'
                                          style={{
                                            width: `${
                                              lesson.items.length
                                                ? (completed /
                                                    lesson.items.length) *
                                                  100
                                                : 0
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronDown className='size-6 shrink-0 text-gray-400 transition-transform duration-200 group-aria-expanded:rotate-180' />
                            </div>
                          </AccordionPrimitive.Trigger>
                        </AccordionPrimitive.Header>
                        <AccordionContent className='p-0'>
                          <div className='border-t border-gray-200 bg-gray-50'>
                            {lesson.items
                              .slice()
                              .sort((a, b) => a.rank - b.rank)
                              .map((item, itemIndex) => (
                                <CurriculumItemRow
                                  key={item.id}
                                  item={item}
                                  locked={
                                    isAttachments
                                      ? false
                                      : isItemLocked(
                                          courseData.sections,
                                          lesson.id,
                                          itemIndex
                                        )
                                  }
                                  locale={locale}
                                  userCourseId={userCourseId}
                                  courseId={courseId}
                                  labels={labelsFrom(t)}
                                />
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }

                  const quizItem = section.data as CourseItem;
                  const locked = isCourseQuizLocked(
                    courseData.sections,
                    quizItem
                  );
                  const isExam = section.type === 'exam' || quizItem.isExam;

                  return (
                    <div
                      key={`${section.type}-${quizItem.id}`}
                      className='border-b border-gray-200 last:border-b-0'
                    >
                      <div
                        className={`flex flex-col justify-between gap-4 p-6 transition-colors md:flex-row md:items-center ${
                          locked
                            ? 'cursor-not-allowed bg-gray-100 opacity-60'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {locked ? (
                          <div className='flex flex-1 items-start gap-4'>
                            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-500'>
                              <Lock className='size-5' />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='mb-1 flex items-center gap-2'>
                                <h3 className='text-lg font-semibold text-gray-500'>
                                  {quizItem.title}
                                </h3>
                                {isExam && (
                                  <span className='rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold uppercase text-gray-600'>
                                    {t.exam}
                                  </span>
                                )}
                              </div>
                              <div className='flex items-center gap-4 text-sm text-gray-500'>
                                <span className='flex items-center gap-1'>
                                  <Clock className='size-4' />
                                  {quizItem.duration} {t.minutes}
                                </span>
                                <span className='font-medium text-amber-600'>
                                  {t.locked}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={quizPath(
                              locale,
                              userCourseId,
                              courseId,
                              quizItem.id
                            )}
                            className='group flex flex-1 items-start gap-4'
                          >
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold transition-colors ${
                                isExam
                                  ? 'bg-red-500/10 text-red-600 group-hover:bg-red-500 group-hover:text-white'
                                  : 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white'
                              }`}
                            >
                              <FileText className='size-5' />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='mb-1 flex items-center gap-2'>
                                <h3 className='text-lg font-semibold text-gray-900'>
                                  {quizItem.title}
                                </h3>
                                {isExam && (
                                  <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold uppercase text-red-700'>
                                    {t.exam}
                                  </span>
                                )}
                              </div>
                              <div className='flex items-center gap-4 text-sm text-gray-600'>
                                <span className='flex items-center gap-1'>
                                  <Clock className='size-4' />
                                  {quizItem.duration} {t.minutes}
                                </span>
                                {isExam && (
                                  <span className='font-medium text-red-600'>
                                    {t.finalExam}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        )}
                        <div className='flex shrink-0 items-center gap-3'>
                          {!locked && (
                            <Link
                              href={quizHistoryPath(
                                locale,
                                userCourseId,
                                courseId,
                                quizItem.id
                              )}
                              className='whitespace-nowrap rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-[#00a8f1] hover:text-[#00a8f1]'
                            >
                              {t.history}
                            </Link>
                          )}
                          {locked ? (
                            <span className='flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500'>
                              <Lock className='size-3' />
                              {t.locked}
                            </span>
                          ) : quizItem.isCompleted ? (
                            <span className='flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'>
                              <CheckCircle2 className='size-4' />
                              {t.completedBadge}
                            </span>
                          ) : (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                isExam
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {t.start}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Accordion>
            </div>
          </div>

          {/* Sidebar */}
          <div className='hidden lg:block'>
            <div className='sticky top-8 space-y-6'>
              {courseData.whatYouLearn.length > 0 && (
                <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg'>
                  <h3 className='mb-4 flex items-center gap-2 text-xl font-bold text-gray-900'>
                    <Award className='size-6 text-[#00a8f1]' />
                    {t.whatYouLearn}
                  </h3>
                  <ul className='space-y-3'>
                    {courseData.whatYouLearn.map((item, index) => (
                      <li key={index} className='flex items-start gap-3'>
                        <CheckCircle2 className='mt-0.5 size-5 shrink-0 text-green-500' />
                        <span className='text-sm text-gray-700'>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className='rounded-2xl border border-[#1e2364] bg-gradient-to-br from-[#00a8f1]/10 to-[#1e2364]/10 p-6 shadow-lg'>
                <h3 className='mb-4 text-lg font-bold text-gray-900'>
                  {t.courseStats}
                </h3>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-700'>{t.completion}</span>
                  <span className='font-bold text-[#00a8f1]'>
                    {courseData.currentProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type PlayerLabels = ReturnType<typeof labelsFrom>;

function labelsFrom(t: Dictionary['academyPlayer']) {
  return {
    locked: t.locked,
    completedBadge: t.completedBadge,
    minutes: t.minutes,
    history: t.history,
    extraContent: t.extraContent,
    lecture: t.lecture,
    quiz: t.quiz,
    attachment: t.attachment,
  };
}

function CurriculumItemRow({
  item,
  locked,
  locale,
  userCourseId,
  courseId,
  labels,
}: {
  item: CourseItem;
  locked: boolean;
  locale: ReturnType<typeof useLocale>;
  userCourseId: number;
  courseId: number;
  labels: PlayerLabels;
}) {
  const typeLabel =
    item.type === 'lecture'
      ? labels.lecture
      : item.type === 'quiz'
        ? labels.quiz
        : labels.attachment;

  const icon = item.isCompleted ? (
    <CheckCircle2 className='size-5 shrink-0 text-green-500' />
  ) : item.type === 'lecture' ? (
    <Play className='size-5 shrink-0 text-gray-400' />
  ) : item.type === 'quiz' ? (
    <FileText className='size-5 shrink-0 text-purple-500' />
  ) : (
    <Download className='size-5 shrink-0 text-[#00a8f1]' />
  );

  const inner = (
    <div className='flex min-w-0 flex-1 items-center gap-3'>
      {locked ? <Lock className='size-5 shrink-0 text-gray-400' /> : icon}
      <div className='min-w-0 flex-1'>
        <p
          className={`line-clamp-2 text-sm font-medium ${
            locked
              ? 'text-gray-500'
              : item.isCompleted
                ? 'text-gray-600'
                : 'text-gray-900'
          }`}
        >
          {item.title}
        </p>
        <div className='mt-1 flex flex-wrap items-center gap-2 text-xs'>
          <span className='capitalize text-gray-500'>{typeLabel}</span>
          {item.duration && item.type !== 'attachment' && (
            <>
              <span className='text-gray-300'>•</span>
              <span className='text-gray-500'>
                {item.duration} {labels.minutes}
              </span>
            </>
          )}
          {item.isExtraLecture && (
            <span className='rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 font-medium text-blue-700'>
              {labels.extraContent}
            </span>
          )}
          {locked && (
            <>
              <span className='text-gray-300'>•</span>
              <span className='font-medium text-amber-600'>
                {labels.locked}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const href =
    item.type === 'lecture'
      ? lecturePath(locale, userCourseId, courseId, item.id)
      : item.type === 'quiz'
        ? quizPath(locale, userCourseId, courseId, item.id)
        : item.path
          ? `${MWAFQ_API_BASE_URL}/${item.path}`
          : '#';

  return (
    <div
      className={`flex flex-col justify-between gap-3 border-b border-gray-200 p-4 transition-all duration-150 last:border-b-0 md:flex-row md:items-center ${
        locked ? 'bg-gray-100 opacity-60' : 'hover:bg-white'
      }`}
    >
      {locked ? (
        inner
      ) : item.type === 'attachment' ? (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='group/item flex min-w-0 flex-1'
        >
          {inner}
        </a>
      ) : (
        <Link href={href} className='group/item flex min-w-0 flex-1'>
          {inner}
        </Link>
      )}

      <div className='flex shrink-0 items-center gap-2'>
        {!locked && item.type === 'quiz' && (
          <Link
            href={quizHistoryPath(
              locale,
              userCourseId,
              courseId,
              item.id,
              item.lessonId
            )}
            className='whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-[#00a8f1] hover:text-[#00a8f1]'
          >
            {labels.history}
          </Link>
        )}
        {locked ? (
          <span className='flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500'>
            <Lock className='size-3' />
            {labels.locked}
          </span>
        ) : item.isCompleted ? (
          <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'>
            {labels.completedBadge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
