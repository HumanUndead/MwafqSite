import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Trophy,
  Video,
} from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { getAcademyTranslations } from '@/i18n/academyDictionary';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { courseDisplayPrice } from '@/shared/lib/coursePlan.shared';
import { interpolate } from '@/shared/lib/interpolate';
import { ImageSize, imageUrl } from '@/shared/lib/media';
import { CourseCarousel } from './CourseCarousel';
import { CourseEnrollCta } from '@/modules/academy/components/CourseEnrollCta';
import {
  AcademyBackdrop,
  AcademySectionTitle,
  AcademyStage,
  GlassPanel,
  StatChip,
} from '@/modules/academy/components/ui/AcademyGlass';
import type { CoursePaymentSettings } from '@/modules/academy/types/payment.types';
import type {
  CourseLesson,
  CourseListItem,
  CourseViewQuiz,
} from './course.types';
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
  {
    loading: () => (
      <div
        className='h-48 animate-pulse rounded-[20px] border border-white/70 bg-white/60 motion-reduce:animate-none'
        aria-hidden
      />
    ),
  }
);

function courseImageSrc(course: CourseListItem): string | null {
  return course.fullImagePath
    ? imageUrl(course.fullImagePath, ImageSize.card)
    : null;
}

/**
 * Frosted surface whose blur lives on a background layer, not on an ancestor
 * of its content. `backdrop-filter` makes an element the containing block for
 * `position: fixed` descendants, which would trap the enrol modal (not
 * portalled) and the mobile sticky bar inside the card.
 */
function PurchaseSurface({ children }: { children: ReactNode }) {
  return (
    <div className='relative isolate overflow-hidden rounded-[24px] border border-white/70 shadow-[0_24px_60px_-24px_rgba(30,35,100,0.35)]'>
      <div
        aria-hidden
        // Opaque: the card overlaps the navy hero, and a translucent glass
        // turned the part over the hero into a grey band.
        className='absolute inset-0 -z-10 bg-white'
      />
      {children}
    </div>
  );
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
  const allQuizzes = [
    ...lessons.flatMap((lesson) => lesson.quizzes ?? []),
    ...courseQuizzes,
  ];
  const quizCount = allQuizzes.filter((quiz) => !quiz.isExam).length;
  const examCount = allQuizzes.filter((quiz) => quiz.isExam).length;
  const price = courseDisplayPrice(paymentSettings);
  const courseTranslation = getTranslation(course.translations, langId);
  const coursesBase = `/${locale}/courses`;

  const title = plainTextFromHtml(courseTranslation?.name ?? '');
  const description = plainTextFromHtml(courseTranslation?.description ?? '');
  const whatLearn = plainTextFromHtml(
    courseTranslation?.whatYouWillLearn?.trim() ||
      courseTranslation?.description ||
      ''
  );
  const tags = tagListFromCourse(courseTranslation?.tags);

  const lectureCount = lessons.reduce(
    (acc, lesson) => acc + lesson.lectures.length,
    0
  );

  const imageSrc = courseImageSrc(course);

  const includes = [
    {
      key: 'hours',
      icon: Video,
      text: interpolate(t.hoursTotal, { count: lecturesDurationInHours }),
    },
    {
      key: 'lectures',
      icon: BookOpen,
      text: interpolate(t.lecturesCount, { count: lectureCount }),
    },
    ...(quizCount > 0
      ? [
          {
            key: 'quizzes',
            icon: ClipboardCheck,
            text: interpolate(t.quizzesCount, { count: quizCount }),
          },
        ]
      : []),
    ...(examCount > 0
      ? [
          {
            key: 'exams',
            icon: Trophy,
            text: interpolate(t.examsCount, { count: examCount }),
          },
        ]
      : []),
  ];

  const priceBlock = price.free ? (
    <span className='text-[28px] font-bold leading-none text-emerald-600 max-lg:text-xl'>
      {t.free}
    </span>
  ) : (
    <span className='inline-flex flex-col gap-1'>
      {price.label && (
        <span className='text-xs font-semibold text-[#6b7196]'>
          {price.label === 'fullPrice' ? t.fullPrice : t.startsFrom}
        </span>
      )}
      <SarAmount
        amount={price.amount}
        className='text-xl font-bold leading-none text-[#1e2364] lg:text-[28px]'
      />
    </span>
  );

  return (
    <AcademyBackdrop className='min-h-0 w-full max-w-full overflow-x-clip text-[#1e2364]'>
      {/* Hero stage: inset panel under the transparent floating header. */}
      <div className='px-2 sm:px-3'>
        <AcademyStage
          image={imageSrc}
          className='rounded-[28px] sm:rounded-[36px] lg:min-h-[440px]'
          innerClassName='pb-14 pt-8 sm:pt-10 lg:pb-16 lg:pt-12'
        >
          <div className='min-w-0 lg:pe-[420px]'>
            <nav aria-label='Breadcrumb'>
              <ol className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold'>
                <li>
                  <Link
                    href={coursesBase}
                    className='group inline-flex items-center gap-1.5 rounded-full text-[#7fd4f9] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141848] motion-reduce:transition-none'
                  >
                    <ChevronLeft
                      className='size-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5 motion-reduce:transition-none'
                      aria-hidden
                    />
                    {t.breadcrumb}
                  </Link>
                </li>
                {course.categoryName ? (
                  <li className='inline-flex min-w-0 items-center gap-2 text-white/60'>
                    <ChevronRight
                      className='size-3.5 shrink-0 rtl:rotate-180'
                      aria-hidden
                    />
                    <span className='min-w-0 wrap-break-word'>
                      {course.categoryName}
                    </span>
                  </li>
                ) : null}
              </ol>
            </nav>

            <h1 className='mt-4 wrap-break-word text-[28px] font-bold leading-[1.2] text-white sm:text-4xl sm:leading-[1.15]'>
              {title}
            </h1>
            {description ? (
              <p className='mt-4 max-w-2xl wrap-break-word text-base leading-relaxed text-white/75'>
                {description}
              </p>
            ) : null}

            <ul className='mt-6 flex flex-wrap gap-2'>
              <li>
                <StatChip
                  tone='dark'
                  icon={<Clock className='size-4 text-[#7fd4f9]' aria-hidden />}
                >
                  {interpolate(t.hoursTotal, { count: lecturesDurationInHours })}
                </StatChip>
              </li>
              <li>
                <StatChip
                  tone='dark'
                  icon={<BookOpen className='size-4 text-[#7fd4f9]' aria-hidden />}
                >
                  {interpolate(t.lecturesCount, { count: lectureCount })}
                </StatChip>
              </li>
              {quizCount > 0 ? (
                <li>
                  <StatChip
                    tone='dark'
                    icon={
                      <ClipboardCheck
                        className='size-4 text-[#7fd4f9]'
                        aria-hidden
                      />
                    }
                  >
                    {interpolate(t.quizzesCount, { count: quizCount })}
                  </StatChip>
                </li>
              ) : null}
              {examCount > 0 ? (
                <li>
                  <StatChip
                    tone='dark'
                    icon={<Trophy className='size-4 text-amber-300' aria-hidden />}
                  >
                    {interpolate(t.examsCount, { count: examCount })}
                  </StatChip>
                </li>
              ) : null}
            </ul>
          </div>
        </AcademyStage>
      </div>

      <div className='mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10'>
          {/* Purchase card: under the hero on mobile, sticky and overlapping
              the hero on lg. z-30 keeps the (non-portalled) enrol modal above
              the page body. */}
          <aside
            aria-label={title}
            className='relative z-30 -mt-8 min-w-0 lg:col-start-2 lg:row-start-1 lg:-mt-[300px]'
          >
            <div className='mx-auto w-full max-w-xl lg:sticky lg:top-[110px] lg:max-w-none'>
              <PurchaseSurface>
                <div className='relative aspect-video w-full overflow-hidden bg-[#1e2364]'>
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={title}
                      fill
                      className='object-cover'
                      sizes='(max-width: 1024px) 100vw, 380px'
                    />
                  ) : (
                    <div className='flex size-full items-center justify-center'>
                      <Image
                        src='/demo-assets/logo.svg'
                        alt=''
                        width={96}
                        height={96}
                        className='h-20 w-20 object-contain opacity-30 brightness-0 invert'
                      />
                    </div>
                  )}
                </div>

                <div className='p-5 sm:p-6'>
                  {/* On mobile this row becomes the fixed bottom bar (single
                      CTA instance, so the enrol dialog / ?pay= deep link is
                      never duplicated); on lg it sits inside the card. */}
                  <div className='fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-[#e5e7f0] bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_-16px_rgba(30,35,100,0.35)] sm:px-6 lg:static lg:z-auto lg:flex-col lg:items-stretch lg:gap-4 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none'>
                    <div className='min-w-0 shrink-0'>{priceBlock}</div>
                    <div className='min-w-0 flex-1'>
                      <CourseEnrollCta
                        courseId={course.id}
                        courseTitle={title}
                        paymentSettings={paymentSettings}
                      />
                    </div>
                  </div>

                  <div className='lg:mt-6 lg:border-t lg:border-[#e5e7f0] lg:pt-5'>
                    <h2 className='text-base font-bold text-[#1e2364]'>
                      {t.courseIncludes}
                    </h2>
                    <ul className='mt-3 flex flex-col gap-2.5'>
                      {includes.map(({ key, icon: Icon, text }) => (
                        <li
                          key={key}
                          className='flex items-center gap-3 text-sm text-[#4a4f78]'
                        >
                          <Icon
                            className='size-[18px] shrink-0 text-[#1e2364]'
                            strokeWidth={2}
                            aria-hidden
                          />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </PurchaseSurface>
            </div>
          </aside>

          <div className='flex min-w-0 flex-col gap-8 lg:col-start-1 lg:row-start-1 lg:pt-10'>
            <GlassPanel as='section' className='p-5 sm:p-7'>
              <AcademySectionTitle>{t.whatYouWillLearn}</AcademySectionTitle>
              <p className='wrap-break-word text-base leading-relaxed whitespace-pre-line text-[#4a4f78]'>
                {whatLearn}
              </p>
              {tags.length > 0 ? (
                <ul className='mt-6 flex flex-wrap gap-2 border-t border-[#e5e7f0] pt-5'>
                  {tags.map((tag) => (
                    <li key={tag}>
                      <StatChip>{tag}</StatChip>
                    </li>
                  ))}
                </ul>
              ) : null}
            </GlassPanel>

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
                  .replace(
                    '{{duration}}',
                    formatCourseDuration(lecturesDuration)
                  ),
              }}
            />
          </div>
        </div>
      </div>

      <section className='overflow-x-clip border-t border-[#e5e7f0] pb-16 pt-2 md:pb-24 md:pt-4'>
        <CourseCarousel
          categoryId={course.categoryId}
          categoryName={t.relatedCourses}
          locale={locale}
          excludeCourseId={course.id}
          culture={culture}
        />
      </section>

      {/* Room for the fixed mobile purchase bar. */}
      <div aria-hidden className='h-24 lg:hidden' />
    </AcademyBackdrop>
  );
}
