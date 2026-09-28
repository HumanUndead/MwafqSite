'use client';

import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { AcademyCourseCard } from '@/modules/academy/components/AcademyCourseCard';
import { AcademySectionTitle } from '@/modules/academy/components/ui/AcademyGlass';
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

const navButtonClass =
  'static size-10 translate-y-0 rounded-full border border-white/70 bg-white/70 text-[#1e2364] shadow-[0_8px_24px_-12px_rgba(30,35,100,0.25)] backdrop-blur-xl transition-colors hover:border-[#00a8f1] hover:bg-white hover:text-[#00a8f1] focus-visible:ring-2 focus-visible:ring-[#00a8f1] disabled:opacity-40';

export function CourseCarouselClient({
  categoryName,
  courses,
  locale,
}: CourseCarouselClientProps) {
  const t = useTranslations('academyCourses');

  return (
    <Carousel opts={{ align: 'start' }}>
      <section className='py-8 last:pb-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <AcademySectionTitle
            className='mb-5'
            action={
              <div className='flex items-center gap-2'>
                <CarouselPrevious
                  aria-label={t.carousel.previous}
                  className={navButtonClass}
                />
                <CarouselNext
                  aria-label={t.carousel.next}
                  className={navButtonClass}
                />
              </div>
            }
          >
            {categoryName}
          </AcademySectionTitle>

          {/* Embla measures physical offsets, so the gutter stays -ml/pl. */}
          <CarouselContent className='-ml-5 py-2'>
            {courses?.map((course) => (
              <CarouselItem
                key={course.id}
                className='basis-full pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
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
