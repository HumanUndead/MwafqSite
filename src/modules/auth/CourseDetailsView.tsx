import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ClipboardCheck, Clock, Trophy } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { getAcademyTranslations } from '@/i18n/academyDictionary';
import { getLocalizedRoute } from '@/i18n/routing';
import { Panel, PanelHeader, Skeleton } from '@/shared/components/product';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { ROUTES } from '@/shared/constants/routes';
import { courseDisplayPrice } from '@/shared/lib/coursePlan.shared';
import { interpolate } from '@/shared/lib/interpolate';
import { ImageSize, imageUrl } from '@/shared/lib/media';
import { CourseCarousel } from './CourseCarousel';
import { CourseEnrollCta } from '@/modules/academy/components/CourseEnrollCta';
import { AcademyBackdrop, StatChip } from '@/modules/academy/components/ui/AcademyGlass';
import type { CoursePaymentSettings } from '@/modules/academy/types/payment.types';
import type { CourseLesson, CourseListItem, CourseViewQuiz } from './course.types';
import {
  formatCourseDuration,
  plainTextFromHtml,
  tagListFromCourse,
} from './courseDetails.shared';
import { getTranslation } from '@/shared/lib/getTranslationName';

const CourseContentAccordion = dynamic(
  () =>
    import('./components/course-details/CourseContentAccordion').then(
      (mod) => mod.CourseContentAccordion
    ),
  { loading: () => <Skeleton className='h-72 rounded-2xl' /> }
);

function courseImageSrc(course: CourseListItem): string | null {
  return course.fullImagePath ? imageUrl(course.fullImagePath, ImageSize.card) : null;
}

export type CourseDetailsViewProps = {
  locale: Locale;
  langId: number;
  course: CourseListItem;
  lecturesDuration: number;
  lessons: CourseLesson[];
  paymentSettings?: CoursePaymentSettings | null;
  /** Course-level quizzes and exams (`Course/View`). */
  courseQuizzes?: CourseViewQuiz[];
  totalHours?: number;
  /** Academy content language for related courses. */
  culture?: string;
};

/**
 * Public course page. Desktop: content on the start side, a sticky purchase
 * panel (cover, price, enrol) on the end side. Mobile: cover first, then the
 * content, with price + enrol pinned to a bottom bar.
 */
export async function CourseDetailsView({
  locale,
  langId,
  course,
  lecturesDuration,
  lessons,
  paymentSettings,
  courseQuizzes = [],
  totalHours,
  culture,
}: CourseDetailsViewProps) {
  const lecturesDurationInHours =
    totalHours && totalHours > 0
      ? Math.round(totalHours * 10) / 10
      : Math.ceil(lecturesDuration / 60);
  const t = await getAcademyTranslations(locale, 'academyCourseDetails');
  const allQuizzes = [...lessons.flatMap((lesson) => lesson.quizzes ?? []), ...courseQuizzes];
  const quizCount = allQuizzes.filter((quiz) => !quiz.isExam).length;
  const examCount = allQuizzes.filter((quiz) => quiz.isExam).length;
  const price = courseDisplayPrice(paymentSettings);
  const courseTranslation = getTranslation(course.translations, langId);
  const coursesHref = getLocalizedRoute(locale, ROUTES.COURSES);

  const title = plainTextFromHtml(courseTranslation?.name ?? '');
  const description = plainTextFromHtml(courseTranslation?.description ?? '');
  const whatLearn = plainTextFromHtml(courseTranslation?.whatYouWillLearn?.trim() ?? '');
  // Only a separate section when it adds something beyond the description.
  const showWhatLearn = whatLearn.length > 0 && whatLearn !== description;
  const tags = tagListFromCourse(courseTranslation?.tags);

  const lectureCount = lessons.reduce((acc, lesson) => acc + lesson.lectures.length, 0);
  const imageSrc = courseImageSrc(course);

  const facts = [
    { key: 'hours', icon: Clock, text: interpolate(t.hoursTotal, { count: lecturesDurationInHours }) },
    { key: 'lectures', icon: BookOpen, text: interpolate(t.lecturesCount, { count: lectureCount }) },
    ...(quizCount > 0
      ? [{ key: 'quizzes', icon: ClipboardCheck, text: interpolate(t.quizzesCount, { count: quizCount }) }]
      : []),
    ...(examCount > 0
      ? [{ key: 'exams', icon: Trophy, text: interpolate(t.examsCount, { count: examCount }) }]
      : []),
  ];

  const priceBlock = price.free ? (
    <span className='text-[22px] font-bold leading-none text-[#1e2364] lg:text-[26px]'>
      {t.free}
    </span>
  ) : (
    <span className='inline-flex flex-col gap-1'>
      {price.label && (
        <span className='text-[13px] font-semibold text-[#6b7196]'>
          {price.label === 'fullPrice' ? t.fullPrice : t.startsFrom}
        </span>
      )}
      <SarAmount
        amount={price.amount}
        className='text-[22px] font-bold leading-none text-[#1e2364] lg:text-[26px]'
      />
    </span>
  );

  return (
    <AcademyBackdrop className='min-h-0 w-full max-w-full overflow-x-clip'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 pt-2 sm:px-6 lg:px-8 lg:pb-20'>
        <Link
          href={coursesHref}
          className='inline-flex w-fit items-center gap-1 rounded-md text-[14px] font-semibold text-[#0077ad] transition-colors duration-150 hover:text-[#1e2364] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
        >
          <ChevronLeft className='size-4 shrink-0 rtl:rotate-180' aria-hidden />
          {t.breadcrumb}
        </Link>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8'>
          {/* Purchase panel: first on mobile (cover), sticky end column on lg. */}
          <aside
            aria-label={title}
            // z-30: the enrol modal is not portalled and must sit above the body.
            className='min-w-0 lg:sticky lg:top-[110px] lg:z-30 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start'
          >
            <Panel flush className='overflow-hidden'>
              <div className='relative aspect-video w-full bg-[#eceef5]'>
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    priority
                    className='object-cover'
                    sizes='(max-width: 1024px) 100vw, 360px'
                  />
                ) : (
                  <div className='flex size-full items-center justify-center'>
                    <Image
                      src='/demo-assets/logo.svg'
                      alt=''
                      width={80}
                      height={80}
                      className='size-20 object-contain opacity-25'
                    />
                  </div>
                )}
              </div>

              {/* One CTA instance (so the enrol dialog / ?pay= deep link is
                  never duplicated): a fixed bottom bar on mobile, part of the
                  panel on lg. */}
              <div className='fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-[#e5e7f0] bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:static lg:z-auto lg:flex-col lg:items-stretch lg:gap-4 lg:border-0 lg:p-6'>
                <div className='min-w-0 shrink-0'>{priceBlock}</div>
                <div className='min-w-0 flex-1'>
                  <CourseEnrollCta
                    courseId={course.id}
                    courseTitle={title}
                    paymentSettings={paymentSettings}
                  />
                </div>
              </div>
            </Panel>
          </aside>

          <header className='min-w-0 lg:col-start-1 lg:row-start-1'>
            {course.categoryName ? (
              <p className='text-[13px] font-semibold text-[#6b7196]'>{course.categoryName}</p>
            ) : null}
            <h1 className='mt-1 wrap-break-word text-[24px] font-bold leading-tight text-[#1e2364] sm:text-[28px]'>
              {title}
            </h1>
            {description ? (
              <p className='mt-3 max-w-[70ch] wrap-break-word text-[15px] leading-7 text-[#4a5078]'>
                {description}
              </p>
            ) : null}
            <ul className='mt-4 flex flex-wrap gap-x-5 gap-y-2' aria-label={t.courseIncludes}>
              {facts.map(({ key, icon: Icon, text }) => (
                <li key={key}>
                  <StatChip icon={<Icon aria-hidden />}>{text}</StatChip>
                </li>
              ))}
            </ul>
          </header>

          <div className='flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-2'>
            {showWhatLearn || tags.length > 0 ? (
              <Panel>
                {showWhatLearn ? (
                  <>
                    <PanelHeader title={t.whatYouWillLearn} />
                    <p className='mt-3 wrap-break-word whitespace-pre-line text-[15px] leading-7 text-[#4a5078]'>
                      {whatLearn}
                    </p>
                  </>
                ) : null}
                {tags.length > 0 ? (
                  <div
                    className={
                      showWhatLearn ? 'mt-5 border-t border-[#eef0f7] pt-4' : undefined
                    }
                  >
                    <h2 className='text-[13px] font-semibold text-[#6b7196]'>{t.topics}</h2>
                    <p className='mt-1 text-[14px] leading-6 text-[#1e2364]'>{tags.join(' · ')}</p>
                  </div>
                ) : null}
              </Panel>
            ) : null}

            <CourseContentAccordion
              lessons={lessons}
              courseQuizzes={courseQuizzes}
              labels={{
                quiz: t.quiz,
                finalExam: t.finalExam,
                quizzesAndExams: t.quizzesAndExams,
                minutes: t.minutes,
                lectures: t.lecturesCount,
                title: t.courseContent.title,
                meta: t.courseContent.sectionsMeta
                  .replace('{{sections}}', String(lessons.length))
                  .replace('{{lectures}}', String(lectureCount))
                  .replace('{{duration}}', formatCourseDuration(lecturesDuration)),
              }}
            />
          </div>
        </div>

        <CourseCarousel
          categoryId={course.categoryId}
          categoryName={t.relatedCourses}
          locale={locale}
          excludeCourseId={course.id}
          culture={culture}
        />

        {/* Room for the fixed mobile purchase bar. */}
        <div aria-hidden className='h-20 lg:hidden' />
      </div>
    </AcademyBackdrop>
  );
}
