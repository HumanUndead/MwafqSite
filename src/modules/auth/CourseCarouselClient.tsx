'use client';

import Image from 'next/image';

import { localeToLangId, type Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import {
  ChevronRightSmIcon,
  StarFilledSmIcon,
} from '@/shared/components/icons/academy';
import type { CourseListItem } from './course.types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

function CourseCard({
  course,
  locale,
  labels,
}: {
  course: CourseListItem;
  locale: Locale;
  labels: {
    enrollNow: string;
    reviewsCount: string;
  };
}) {
  const title = getTranslationName(course.translations, locale);
  const langId = localeToLangId[locale];
  const translation =
    course.translations.length === 1
      ? course.translations[0]
      : (course.translations.find((tr) => tr.langId === langId) ??
        course.translations[0]);
  const description = translation?.description ?? '';

  return (
    <article className='group relative flex min-h-full flex-col overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white transition-all duration-[0.4s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#00a8f1] hover:bg-[#fbfcff]'>
      <div className='relative flex h-[200px] items-center justify-center overflow-hidden bg-[#1e2364] max-[640px]:h-40'>
        <Image
          src={
            course.fullImagePath
              ? `${MWAFQ_API_BASE_URL}/${course.fullImagePath}.png`
              : 'https://loremflickr.com/640/400/medical,training/all?lock=academy'
          }
          alt={title}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw'
          className='object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105'
        />
      </div>
      <div className='flex flex-1 flex-col gap-2.5 px-[22px] pb-3.5 pt-[22px]'>
        <h3 className='min-h-[44px] text-[17px] font-extrabold leading-[1.3] tracking-[-0.3px] text-[#1e2364]'>
          {title}
        </h3>
        <p className='min-h-[38px] text-[13px] leading-[1.55] text-[#6b7196]'>
          {description}
        </p>
      </div>
      <div className='flex items-center justify-between gap-2.5 border-t-2 border-[#eef0f7] px-[22px] pb-[22px] pt-3.5'>
        <span className='inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1e2364]'>
          <span className='inline-flex text-[#1e2364]'>
            <StarFilledSmIcon className='size-3.5' />
          </span>
          4.5{' '}
          <span className='font-semibold text-[#6b7196]'>
            {labels.reviewsCount.replace('{{count}}', '0')}
          </span>
        </span>
        <span className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:gap-3'>
          {labels.enrollNow}
          <ChevronRightSmIcon className='size-3 transition-transform duration-300 rtl:rotate-180' />
        </span>
      </div>
    </article>
  );
}

export type CourseCarouselClientProps = {
  categoryName: string;
  courses: readonly CourseListItem[];
  locale: Locale;
};

export function CourseCarouselClient({
  categoryName,
  courses,
  locale,
}: CourseCarouselClientProps) {
  const t = useTranslations('academyCourses');

  return (
    <Carousel opts={{ align: 'start' }}>
      <section className='py-[30px] last:pb-[120px]'>
        <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
          <div className='mb-[26px] flex flex-wrap items-center justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-3.5'>
              <h2 className='text-[clamp(24px,2.4vw,30px)] font-extrabold leading-[1.15] tracking-[-0.6px] text-[#1e2364]'>
                {categoryName}
              </h2>
            </div>
            <div className='mt-7 flex items-center justify-center gap-2'>
              <CarouselPrevious
                aria-label={t.carousel.previous}
                className='static size-10 translate-y-0 rounded-full border-2 border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:text-[#00a8f1] '
              />
              <CarouselNext
                aria-label={t.carousel.next}
                className='static size-10 translate-y-0 rounded-full border-2 border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:text-[#00a8f1] '
              />
            </div>
          </div>

          <CarouselContent className='ml-[-22px]'>
            {courses?.map((course) => (
              <CarouselItem
                key={course.id}
                className='pl-[22px] basis-full sm:basis-1/2 lg:basis-1/3'
              >
                <CourseCard
                  course={course}
                  locale={locale}
                  labels={{
                    enrollNow: t.carousel.enrollNow,
                    reviewsCount: t.carousel.reviewsCount,
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </section>
    </Carousel>
  );
}
