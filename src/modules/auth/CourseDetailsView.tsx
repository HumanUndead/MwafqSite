import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ClipboardCheck,
  Download,
  FileText,
  Play,
  Star,
  Video,
} from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { getTranslations } from '@/i18n/server';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { CourseCarousel } from './CourseCarousel';
import type { CourseLesson, CourseListItem } from './course.types';
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
        className='h-48 animate-pulse rounded-xl border border-[#e5e7f0] bg-[#eef0f7]'
        aria-hidden
      />
    ),
  }
);

const easeClass = 'duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

function courseImageSrc(course: CourseListItem): string {
  if (course.fullImagePath) {
    return `${MWAFQ_API_BASE_URL}/${course.fullImagePath}.png`;
  }
  return 'https://loremflickr.com/640/400/medical,training/all?lock=academy-detail';
}

export type CourseDetailsViewProps = {
  locale: Locale;
  langId: number;
  course: CourseListItem;
  lecturesDuration: number;
  lessons: CourseLesson[];
};

export async function CourseDetailsView({
  locale,
  langId,
  course,
  lecturesDuration,
  lessons,
}: CourseDetailsViewProps) {
  const lecturesDurationInHours = Math.ceil(lecturesDuration / 60);
  const t = await getTranslations('academyCourseDetails');
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

  return (
    <div className='mx-auto w-full max-w-full overflow-x-clip bg-[#eeeeef] text-[#1e2364]'>
      <div className='pb-3'>
        <div className='mx-auto w-full max-w-[1320px] min-w-0 px-4 md:px-7'>
          <ScrollReveal variant='y' revealAfterLoadMs={200}>
            <nav
              aria-label='Breadcrumb'
              className='flex items-center gap-2.5 text-sm font-bold text-[#1e2364]'
            >
              <Link
                href={coursesBase}
                className='group inline-flex items-center gap-2 text-[14.5px] font-bold text-[#1e2364] transition-colors hover:text-[#00a8f1]'
              >
                <ChevronLeft className='size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1' />
                {t.breadcrumb}
              </Link>
            </nav>
          </ScrollReveal>
        </div>
      </div>

      <section className='overflow-x-clip pb-12 pt-3 md:pb-[50px]'>
        <div className='mx-auto w-full max-w-[1320px] min-w-0 px-4 md:px-7'>
          <div className='mx-auto grid w-full min-w-0 max-w-[1100px] grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]'>
            <ScrollReveal
              variant='y'
              revealAfterLoadMs={200}
              className='min-w-0'
            >
              <div className='relative flex min-w-0 flex-col py-1.5'>
                <h1 className='mb-2.5 wrap-break-word text-[clamp(22px,2.6vw,32px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1e2364]'>
                  {title}
                </h1>
                <p className='mb-10 min-w-0 max-w-full wrap-break-word text-[14.5px] leading-[1.55] text-[#6b7196] lg:max-w-[560px]'>
                  {description}
                </p>

                <div className='mb-10'>
                  <h2 className='mb-2 text-[19px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                    {t.whatYouWillLearn}
                  </h2>
                  <p className='min-w-0 wrap-break-word text-sm leading-relaxed whitespace-pre-line text-[#6b7196]'>
                    {whatLearn}
                  </p>
                </div>

                {tags.length > 0 ? (
                  <div className='mb-9 flex flex-wrap gap-2.5'>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className='inline-flex items-center rounded-full border-[1.5px] border-[#e5e7f0] bg-white px-[22px] py-[7px] text-[13px] font-bold text-[#1e2364]'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className='mb-9'>
                  <div className='mb-3 inline-block text-[19px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                    {t.courseIncludes}
                  </div>
                  <ul className='flex flex-col gap-2.5'>
                    <li className='flex items-center gap-3.5 text-sm leading-[1.55] text-[#4a4f78]'>
                      <Video
                        className='size-[18px] shrink-0 text-[#1e2364]'
                        strokeWidth={2}
                        aria-hidden
                      />
                      {t.hoursOnDemandVideo.replace(
                        '{{hours}}',
                        String(lecturesDurationInHours)
                      )}
                    </li>
                    <li className='flex items-center gap-3.5 text-sm leading-[1.55] text-[#4a4f78]'>
                      <ClipboardCheck
                        className='size-[18px] shrink-0 text-[#1e2364]'
                        strokeWidth={2}
                        aria-hidden
                      />
                      {t.assignments}
                    </li>
                    <li className='flex items-center gap-3.5 text-sm leading-[1.55] text-[#4a4f78]'>
                      <FileText
                        className='size-[18px] shrink-0 text-[#1e2364]'
                        strokeWidth={2}
                        aria-hidden
                      />
                      {t.article}
                    </li>
                    <li className='flex items-center gap-3.5 text-sm leading-[1.55] text-[#4a4f78]'>
                      <Download
                        className='size-[18px] shrink-0 text-[#1e2364]'
                        strokeWidth={2}
                        aria-hidden
                      />
                      {t.downloadableResource}
                    </li>
                  </ul>
                </div>

                <CourseContentAccordion
                  lessons={lessons}
                  labels={{
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
            </ScrollReveal>

            <ScrollReveal
              variant='y'
              revealAfterLoadMs={200}
              transitionDelay={0.12}
              className='min-w-0 w-full max-w-[380px] lg:max-w-full lg:mx-0 mx-auto'
            >
              <div
                className={`group flex min-w-0 flex-col overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white transition-all ${easeClass} hover:border-[#00a8f1] hover:bg-[#fbfcff]`}
              >
                <div className='relative h-[260px] w-full overflow-hidden bg-[#1e2364]'>
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className='object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]'
                    sizes='(max-width: 1024px) 380px, 420px'
                  />
                  <button
                    type='button'
                    aria-label={t.playPreview}
                    className='absolute left-1/2 top-1/2 z-3 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1e2364] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 hover:bg-white'
                  >
                    <Play
                      className='ml-0.5 size-[22px] fill-current'
                      aria-hidden
                    />
                  </button>
                </div>
                <div className='flex flex-1 flex-col gap-2.5 px-[22px] pb-3.5 pt-[22px]'>
                  <span className='inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1e2364]'>
                    <Star
                      className='size-[13px] fill-[#1e2364] text-[#1e2364]'
                      aria-hidden
                    />
                    4.8{' '}
                    <span className='font-semibold text-[#6b7196]'>(12)</span>
                  </span>
                  <p className='min-w-0 wrap-break-word text-[12.5px] leading-[1.55] text-[#6b7196]'>
                    {description}
                  </p>
                </div>
                <div className='flex min-w-0 items-center justify-between gap-2.5 border-t-2 border-[#eef0f7] px-[22px] pb-[22px] pt-3.5'>
                  <span className='inline-flex items-baseline gap-1.5 font-extrabold text-[#1e2364]'>
                    <span className='text-2xl leading-none tracking-[-0.5px]'>
                      14.99
                    </span>
                    <span className='text-[13px] font-bold text-[#6b7196]'>
                      DJ
                    </span>
                  </span>
                  <Link
                    href='#'
                    className='group/enroll inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2 text-xs font-bold text-white transition-[gap] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:gap-2'
                  >
                    {t.enrollNow}
                    <ArrowRight
                      className='size-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/enroll:translate-x-1 rtl:-scale-x-100 rtl:group-hover/enroll:-translate-x-1'
                      strokeWidth={2.4}
                      aria-hidden
                    />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className='overflow-x-clip border-t-2 border-[#e5e7f0] pb-16 pt-2 md:pb-24 md:pt-4'>
        <CourseCarousel
          categoryId={course.categoryId}
          categoryName={t.relatedCourses}
          locale={locale}
          excludeCourseId={course.id}
        />
      </section>
    </div>
  );
}
