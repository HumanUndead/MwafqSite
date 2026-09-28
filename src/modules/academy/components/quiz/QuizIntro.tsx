import { ChevronLeft, Clock, ListOrdered, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/Button';
import { safeHtml } from '@/shared/lib/safeHtml';
import { GlassPanel, StatChip } from '../ui/AcademyGlass';
import { QuizStageHeader } from './QuizStageHeader';
import type { QuizLabels } from './quizUi';

/** Start screen: stage with the title, glass card with facts and Start. */
export function QuizIntro({
  labels,
  title,
  courseName,
  image,
  description,
  questionCount,
  minutesLabel,
  passThreshold,
  backHref,
  onStart,
}: {
  labels: QuizLabels;
  title: string;
  courseName?: string | null;
  image?: string | null;
  description?: string | null;
  questionCount: number;
  /** Formatted duration, or null when the quiz is untimed. */
  minutesLabel: string | null;
  passThreshold: number;
  backHref: string;
  onStart: () => void;
}) {
  return (
    <>
      <QuizStageHeader
        courseName={courseName}
        image={image}
        title={title}
        leading={
          <Link
            href={backHref}
            aria-label={labels.backToCourse}
            className='flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] motion-reduce:transition-none'
          >
            <ChevronLeft className='size-5 rtl:rotate-180' aria-hidden />
          </Link>
        }
      />

      <div className='relative mx-auto -mt-10 max-w-3xl px-4 pb-16 sm:-mt-12 sm:px-6'>
        <GlassPanel className='p-6 sm:p-10'>
          {description && (
            <div
              className='mb-6 text-base leading-relaxed text-[#6b7196] [&_a]:text-[#00a8f1] [&_a]:underline'
              dangerouslySetInnerHTML={{ __html: safeHtml(description) }}
            />
          )}

          <div className='flex flex-wrap gap-2'>
            <StatChip
              icon={<ListOrdered className='size-4 text-[#00a8f1]' aria-hidden />}
            >
              {questionCount} {labels.question}
            </StatChip>
            {minutesLabel && (
              <StatChip
                icon={<Clock className='size-4 text-[#00a8f1]' aria-hidden />}
              >
                {minutesLabel}
              </StatChip>
            )}
            <StatChip
              icon={<Trophy className='size-4 text-emerald-600' aria-hidden />}
            >
              <span dir='ltr'>{passThreshold}%</span>
            </StatChip>
          </div>

          <div className='mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-[#e5e7f0] pt-6 sm:flex-row sm:items-center sm:justify-between'>
            <Link
              href={backHref}
              className='rounded-full px-2 py-2 text-center text-sm font-semibold text-[#6b7196] transition-colors hover:text-[#00a8f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] motion-reduce:transition-none'
            >
              {labels.backToCourse}
            </Link>
            {questionCount === 0 ? (
              <p className='text-sm font-semibold text-[#6b7196]'>
                {labels.noQuestions}
              </p>
            ) : (
              <Button
                variant='brand'
                shape='pill'
                size='lg'
                className='bg-[#00a8f1] px-10 hover:bg-[#0090d1] focus:ring-[#00a8f1]'
                onClick={onStart}
                type='button'
              >
                {labels.start}
              </Button>
            )}
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
