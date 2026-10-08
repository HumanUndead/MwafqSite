'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { Panel } from '@/shared/components/product';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import type { QuizLabels } from './quizUi';

/**
 * Jump to any question. Answered = filled, unanswered = dashed outline,
 * current = navy. Collapsible below `lg`; always open in the side column.
 */
export function QuestionNavigator({
  count,
  currentIndex,
  isAnswered,
  onSelect,
  labels,
  className,
}: {
  count: number;
  currentIndex: number;
  isAnswered: (index: number) => boolean;
  onSelect: (index: number) => void;
  labels: QuizLabels;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const headingId = useId();
  const answered = Array.from({ length: count }, (_, i) => isAnswered(i)).filter(
    Boolean
  ).length;

  return (
    <Panel aria-labelledby={headingId} className={cn('p-4 sm:p-5', className)}>
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <h2 id={headingId} className='text-[15px] font-bold text-[#1e2364]'>
            {labels.questionsNav}
          </h2>
          <p className='text-[13px] font-semibold tabular-nums text-[#6b7196]'>
            {interpolate(labels.answeredOf, { answered, total: count })}
          </p>
        </div>
        <Button
          type='button'
          variant='productText'
          size='compact'
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className='lg:hidden'
        >
          {open ? labels.hideQuestions : labels.showQuestions}
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-150 motion-reduce:transition-none',
              open && 'rotate-180'
            )}
            aria-hidden
          />
        </Button>
      </div>

      <div id={listId} className={cn('mt-4', !open && 'max-lg:hidden')}>
        <ol className='grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2'>
          {Array.from({ length: count }, (_, idx) => {
            const active = idx === currentIndex;
            const done = isAnswered(idx);
            return (
              <li key={idx}>
                <Button
                  type='button'
                  variant={null}
                  size={null}
                  onClick={() => {
                    onSelect(idx);
                    setOpen(false);
                  }}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${labels.question} ${idx + 1}, ${
                    done ? labels.answeredStatus : labels.unansweredStatus
                  }`}
                  className={cn(
                    'h-11 w-full rounded-[10px] border text-[14px] font-semibold tabular-nums transition-colors duration-150 motion-reduce:transition-none',
                    'focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2',
                    active
                      ? 'border-[#1e2364] bg-[#1e2364] text-white'
                      : done
                        ? 'border-[#d9ddea] bg-[#eef0f7] text-[#1e2364] hover:border-[#1e2364]/40'
                        : 'border-dashed border-[#a9aecb] bg-white text-[#4a5078] hover:border-[#1e2364]/60'
                  )}
                >
                  {idx + 1}
                </Button>
              </li>
            );
          })}
        </ol>

        <ul className='mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-semibold text-[#6b7196]'>
          <LegendItem swatch='border-[#d9ddea] bg-[#eef0f7]'>
            {labels.answeredStatus}
          </LegendItem>
          <LegendItem swatch='border-dashed border-[#a9aecb] bg-white'>
            {labels.unansweredStatus}
          </LegendItem>
          <LegendItem swatch='border-[#1e2364] bg-[#1e2364]'>
            {labels.currentStatus}
          </LegendItem>
        </ul>
      </div>
    </Panel>
  );
}

function LegendItem({ swatch, children }: { swatch: string; children: string }) {
  return (
    <li className='inline-flex items-center gap-1.5'>
      <span aria-hidden className={cn('size-3.5 rounded-[4px] border', swatch)} />
      {children}
    </li>
  );
}
