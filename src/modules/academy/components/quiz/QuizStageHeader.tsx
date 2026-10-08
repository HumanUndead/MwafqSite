import type { ReactNode } from 'react';
import { AcademyStage } from '../ui/AcademyGlass';

/**
 * Quiz page band: a back/exit control and the timer on one row, then the
 * course name and quiz title. `children` renders below (progress).
 */
export function QuizStageHeader({
  courseName,
  title,
  leading,
  trailing,
  children,
}: {
  courseName?: string | null;
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <AcademyStage innerClassName='max-w-5xl py-4 sm:py-5 lg:py-6'>
      <div className='flex min-h-9 items-center justify-between gap-3'>
        {leading}
        {trailing}
      </div>
      <div className='mt-3 min-w-0'>
        {courseName ? (
          <p className='break-words text-[13px] font-semibold text-[#6b7196]'>
            {courseName}
          </p>
        ) : null}
        <h1 className='mt-0.5 break-words text-[20px] font-bold leading-tight text-[#1e2364] sm:text-[24px]'>
          {title}
        </h1>
      </div>
      {children}
    </AcademyStage>
  );
}
