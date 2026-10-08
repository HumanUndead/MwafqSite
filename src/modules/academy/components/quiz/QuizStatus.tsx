import { Lock } from 'lucide-react';
import Link from 'next/link';
import {
  EmptyState,
  ErrorState,
  Panel,
  Skeleton,
} from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { AcademyBackdrop, AcademyStage } from '../ui/AcademyGlass';

/** Layout-matched placeholder: header band, then the question panel. */
export function QuizLoading({ label }: { label: string }) {
  return (
    <AcademyBackdrop>
      <div role='status'>
        <span className='sr-only'>{label}</span>
        <AcademyStage innerClassName='max-w-5xl py-4 sm:py-5 lg:py-6'>
          <Skeleton className='h-9 w-32' />
          <Skeleton className='mt-4 h-4 w-40' />
          <Skeleton className='mt-2 h-7 w-2/3' />
        </AcademyStage>
        <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8'>
          <Panel className='max-w-3xl space-y-4'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-7 w-4/5' />
            <div className='space-y-2.5 pt-2'>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-14 w-full rounded-xl' />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AcademyBackdrop>
  );
}

/** Full-page state when the quiz can't be taken (locked or failed to load). */
export function QuizMessage({
  kind,
  title,
  description,
  actionHref,
  actionLabel,
  retryLabel,
  onRetry,
}: {
  kind: 'locked' | 'error';
  title: string;
  description?: string;
  actionHref: string;
  actionLabel: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  const backLink = (
    <Link
      href={actionHref}
      className={buttonVariants({
        variant: kind === 'locked' ? 'product' : 'productText',
        size: kind === 'locked' ? 'control' : 'compact',
      })}
    >
      {actionLabel}
    </Link>
  );

  return (
    <AcademyBackdrop>
      <div className='mx-auto max-w-xl px-4 py-10 sm:py-16'>
        <Panel>
          {kind === 'locked' ? (
            <EmptyState
              icon={<Lock aria-hidden />}
              title={title}
              description={description}
              action={backLink}
            />
          ) : (
            <>
              <ErrorState
                title={title}
                description={description}
                retryLabel={retryLabel}
                onRetry={onRetry}
                className='pb-4'
              />
              <div className='flex justify-center pb-6'>{backLink}</div>
            </>
          )}
        </Panel>
      </div>
    </AcademyBackdrop>
  );
}
