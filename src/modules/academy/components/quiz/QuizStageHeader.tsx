import type { ReactNode } from 'react';
import { safeHtml } from '@/shared/lib/safeHtml';
import { AcademyStage } from '../ui/AcademyGlass';

/**
 * Compact navy stage for the quiz: course name, quiz title, an optional
 * one-line description, a leading back/exit control and a trailing slot
 * (the timer). `children` renders below (counter + navigator).
 */
export function QuizStageHeader({
  courseName,
  image,
  title,
  description,
  leading,
  trailing,
  children,
}: {
  courseName?: string | null;
  image?: string | null;
  title: string;
  description?: string | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <AcademyStage
      image={image}
      className='mx-2 rounded-[28px] sm:mx-3 sm:rounded-[36px]'
      innerClassName='max-w-3xl pt-6 pb-16 sm:pt-8 sm:pb-20 lg:pt-10 lg:pb-20'
    >
      <div className='flex items-start gap-3 sm:gap-4'>
        {leading}
        <div className='min-w-0 flex-1'>
          {courseName ? (
            <p className='truncate text-sm font-semibold text-white/70'>
              {courseName}
            </p>
          ) : null}
          <h1 className='mt-0.5 line-clamp-2 text-xl font-bold leading-tight text-white sm:text-[28px]'>
            {title}
          </h1>
          {description ? (
            <div
              className='mt-1.5 line-clamp-1 text-sm text-white/70 [&_*]:inline'
              dangerouslySetInnerHTML={{ __html: safeHtml(description) }}
            />
          ) : null}
        </div>
        {trailing}
      </div>
      {children}
    </AcademyStage>
  );
}
