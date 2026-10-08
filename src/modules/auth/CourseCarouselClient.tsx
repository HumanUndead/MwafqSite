'use client';

import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { academyDir } from '@/modules/academy/academyLanguage.shared';
import { AcademyCourseCard } from '@/modules/academy/components/AcademyCourseCard';
import { useAcademyLanguage } from '@/modules/academy/components/AcademyLanguageProvider';
import { PanelHeader } from '@/shared/components/product';
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
  'static size-9 translate-y-0 rounded-[10px] border-[#d9ddea] bg-white text-[#1e2364] shadow-none transition-colors duration-150 hover:bg-[#f7f8fb] focus-visible:ring-2 focus-visible:ring-[#1e2364] disabled:opacity-40';

/** One catalog row: category title, prev/next, and a swipeable row of cards. */
export function CourseCarouselClient({
  categoryName,
  courses,
  locale,
}: CourseCarouselClientProps) {
  const t = useTranslations('academyCourses');
  const academy = useAcademyLanguage();
  const direction = academy
    ? academyDir(academy.language)
    : isRtl(locale)
      ? 'rtl'
      : 'ltr';

  return (
    <Carousel opts={{ align: 'start', direction }}>
      <section aria-label={categoryName} className='flex flex-col gap-4'>
        <PanelHeader
          className='items-center'
          title={categoryName}
          action={
            <div className='flex items-center gap-2'>
              <CarouselPrevious aria-label={t.carousel.previous} className={navButtonClass} />
              <CarouselNext aria-label={t.carousel.next} className={navButtonClass} />
            </div>
          }
        />

        {/* Embla measures physical offsets, so the gutter stays -ml/pl. */}
        <CarouselContent className='-ml-4 sm:-ml-5'>
          {courses.map((course) => (
            <CarouselItem
              key={course.id}
              className='basis-[85%] pl-4 sm:basis-1/2 sm:pl-5 lg:basis-1/3 xl:basis-1/4'
            >
              <AcademyCourseCard course={course} locale={locale} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </section>
    </Carousel>
  );
}
