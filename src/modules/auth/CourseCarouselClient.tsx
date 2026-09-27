'use client';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { AcademyCourseCard } from '@/modules/academy/components/AcademyCourseCard';
import type { CourseListItem } from './course.types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
      <section className='py-7.5 last:pb-30'>
        <div className='mx-auto max-w-330 px-4 md:px-7'>
          <div className='mb-6.5 flex flex-wrap items-center justify-between gap-4'>
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

          <CarouselContent className='-ml-5.5'>
            {courses?.map((course) => (
              <CarouselItem
                key={course.id}
                className='pl-5.5 basis-full sm:basis-1/2 lg:basis-1/3'
              >
                <AcademyCourseCard course={course} locale={locale} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </section>
    </Carousel>
  );
}
