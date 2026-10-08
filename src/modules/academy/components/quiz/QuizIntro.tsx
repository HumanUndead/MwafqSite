import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { InfoItem, InfoList, Notice, Panel } from '@/shared/components/product';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { safeHtml } from '@/shared/lib/safeHtml';
import { QuizStageHeader } from './QuizStageHeader';
import type { QuizLabels } from './quizUi';

/** Start screen: what the quiz asks of the learner, then one Start action. */
export function QuizIntro({
  labels,
  title,
  courseName,
  description,
  questionCount,
  minutesLabel,
  passThreshold,
  attemptsCount,
  historyHref,
  backHref,
  onStart,
}: {
  labels: QuizLabels;
  title: string;
  courseName?: string | null;
  description?: string | null;
  questionCount: number;
  /** Formatted duration, or null when the quiz is untimed. */
  minutesLabel: string | null;
  passThreshold: number;
  /** Past attempts, or null while unknown. */
  attemptsCount: number | null;
  historyHref: string;
  backHref: string;
  onStart: () => void;
}) {
  return (
    <>
      <QuizStageHeader
        courseName={courseName}
        title={title}
        leading={<BackLink href={backHref} label={labels.backToCourse} />}
      />

      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8'>
        <Panel className='max-w-3xl'>
          {description ? (
            <div
              className='mb-6 break-words text-[15px] leading-7 text-[#4a5078] [&_a]:text-[#0077ad] [&_a]:underline'
              dangerouslySetInnerHTML={{ __html: safeHtml(description) }}
            />
          ) : null}

          <InfoList>
            <InfoItem label={labels.questionsLabel}>
              <span className='tabular-nums'>{questionCount}</span>
            </InfoItem>
            <InfoItem label={labels.timeLimitLabel}>
              {minutesLabel ?? labels.noTimeLimit}
            </InfoItem>
            <InfoItem label={labels.passMarkLabel}>
              <bdi dir='ltr' className='tabular-nums'>
                {passThreshold}%
              </bdi>
            </InfoItem>
            <InfoItem label={labels.attemptsLabel}>
              <span className='flex flex-wrap items-baseline gap-x-3'>
                <span className='tabular-nums'>{attemptsCount ?? '—'}</span>
                {attemptsCount ? (
                  <Link
                    href={historyHref}
                    className='rounded-sm text-[14px] font-semibold text-[#0077ad] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
                  >
                    {labels.viewAttempts}
                  </Link>
                ) : null}
              </span>
            </InfoItem>
          </InfoList>

          {questionCount === 0 ? (
            <Notice tone='warning' className='mt-6'>
              {labels.noQuestions}
            </Notice>
          ) : (
            <div className='mt-6 space-y-2 border-t border-[#eef0f7] pt-5 text-[14px] leading-6 text-[#4a5078]'>
              <p>{labels.introHint}</p>
              {minutesLabel ? <p>{labels.introTimedHint}</p> : null}
            </div>
          )}

          <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end'>
            <Link
              href={backHref}
              className={cn(
                buttonVariants({ variant: 'productSecondary', size: 'control' })
              )}
            >
              {labels.backToCourse}
            </Link>
            {questionCount > 0 ? (
              <Button
                type='button'
                variant='product'
                size='control'
                className='sm:min-w-40'
                onClick={onStart}
              >
                {labels.start}
              </Button>
            ) : null}
          </div>
        </Panel>
      </div>
    </>
  );
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: 'productText', size: 'compact' }),
        '-ms-3.5'
      )}
    >
      <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
      {label}
    </Link>
  );
}
