'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import {
  ChevronRightSmIcon,
  StarFilledSmIcon,
} from '@/shared/components/icons/academy';
import { isRtl, type Locale } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { cn } from '@/shared/lib/cn';
import { courseCardVariants, courseMediaVariants, EASE } from './constants';
import type { AcademyCourseRow } from './types/academy.types';

const sectionArrowTransition = { duration: 0.25, ease: EASE };

function CourseProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <div
      ref={ref}
      className='order-1 h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e5e7f0]'
    >
      <motion.div
        className='h-full rounded-full bg-[#00a8f1]'
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      />
    </div>
  );
}

export type AcademyCoursesViewProps = {
  courses?: readonly AcademyCourseRow[];
};

export function AcademyCoursesView({ courses }: AcademyCoursesViewProps) {
  const rows = courses ?? [];
  const t = useTranslations('profileAcademy');
  const locale = useLocale() as Locale;
  const rtl = isRtl(locale);
  const ctaArrowShift = rtl ? -4 : 4;

  return (
    <section className='relative pt-2'>
      <ScrollReveal className='mb-[22px] flex flex-wrap items-center justify-between gap-4'>
        <h2 className='text-[clamp(22px,2vw,28px)] font-extrabold leading-[1.15] tracking-[-0.6px] text-[#1e2364]'>
          {t.title}
        </h2>
        <div
          className='inline-flex items-center gap-2'
          role='group'
          aria-label={t.carouselControls}
        >
          <motion.button
            type='button'
            className='inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:text-[#00a8f1]'
            aria-label={t.previousCourses}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={sectionArrowTransition}
          >
            <ChevronRightSmIcon className='size-[14px] rotate-180 rtl:rotate-0' />
          </motion.button>
          <motion.button
            type='button'
            className='inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:text-[#00a8f1]'
            aria-label={t.nextCourses}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={sectionArrowTransition}
          >
            <ChevronRightSmIcon className='size-[14px] rtl:rotate-180' />
          </motion.button>
        </div>
      </ScrollReveal>

      <div className='grid grid-cols-3 gap-[22px] pb-1 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1'>
        {rows.map((course) => (
          <ScrollReveal
            key={course.id}
            transitionDelay={course.transitionDelay}
            className='contents'
          >
            <motion.article
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-white'
              )}
              variants={courseCardVariants}
              initial='rest'
              whileHover='hover'
            >
              <div className='relative h-[180px] overflow-hidden bg-[#1e2364]'>
                <motion.div
                  className='absolute inset-0 z-1'
                  variants={courseMediaVariants}
                >
                  <Image
                    src={course.imageSrc}
                    alt={course.imageAlt}
                    fill
                    sizes='(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw'
                    className='object-cover'
                  />
                </motion.div>
              </div>
              <div className='flex flex-1 flex-col gap-2.5 px-5 pb-3 pt-5'>
                <h3 className='text-[17px] font-extrabold leading-[1.3] tracking-[-0.3px] text-[#1e2364]'>
                  {course.title}
                </h3>
                <div
                  className='text-[13px] leading-[1.55] text-[#6b7196]'
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
                <div className='flex flex-row items-center gap-2.5'>
                  <CourseProgressBar value={course.progress} />
                  <span className='order-2 shrink-0 text-xs font-bold text-[#1e2364]'>
                    {course.progress}%
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between gap-2.5 border-t-2 border-[#eef0f7] px-5 pb-5 pt-3.5'>
                <span className='inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1e2364]'>
                  <span className='inline-flex text-[#1e2364]'>
                    <StarFilledSmIcon className='size-3.5' />
                  </span>
                  {course.rating}{' '}
                  <span className='font-semibold text-[#6b7196]'>
                    ({course.reviewCount})
                  </span>
                </span>
                <motion.a
                  href={
                    course.enrollmentId && course.courseId
                      ? `/${locale}/courses/learn/${course.enrollmentId}/${course.courseId}`
                      : `/${locale}/courses/${course.courseId}`
                  }
                  className={cn(
                    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#00a8f1] px-4 py-2',
                    'text-xs font-bold text-white no-underline'
                  )}
                  data-cursor
                  initial='rest'
                  whileHover='hover'
                  whileTap={{ scale: 0.98 }}
                  variants={{ rest: {}, hover: {} }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  {t.keepGoing}
                  <motion.span
                    className='inline-flex shrink-0'
                    variants={{
                      rest: { x: 0 },
                      hover: { x: ctaArrowShift },
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <ChevronRightSmIcon className='size-3' />
                  </motion.span>
                </motion.a>
              </div>
            </motion.article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
