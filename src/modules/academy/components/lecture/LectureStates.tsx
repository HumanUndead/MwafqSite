'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { EmptyState, ErrorState, Panel, Skeleton } from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { AcademyBackdrop } from '../ui/AcademyGlass';
import { LectureTopBar } from './LectureTopBar';

/** Page frame shared by the player and its states. */
export function LectureShell({ children }: { children: ReactNode }) {
  return (
    <AcademyBackdrop>
      <div className='mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6'>
        {children}
      </div>
    </AcademyBackdrop>
  );
}

/** Two-column grid: main column, and the curriculum beside it on desktop. */
export const lectureGridClass =
  'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_auto_auto_1fr] xl:grid-cols-[minmax(0,1fr)_400px]';
export const lectureMainClass = 'min-w-0 lg:col-start-1';
export const lectureAsideClass =
  'min-w-0 lg:sticky lg:top-[110px] lg:col-start-2 lg:row-span-4 lg:row-start-1';

/** Skeleton mirroring the player: video, summary, curriculum. */
export function LecturePlayerSkeleton({ label }: { label: string }) {
  return (
    <LectureShell>
      <div role='status' aria-live='polite' className='contents'>
        <span className='sr-only'>{label}</span>
        <Skeleton className='h-9 w-36 rounded-xl' />
        <div className={lectureGridClass}>
          <Skeleton className={`${lectureMainClass} aspect-video w-full rounded-xl`} />
          <Panel className={`${lectureMainClass} flex flex-col gap-3`}>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-7 w-2/3' />
            <Skeleton className='h-4 w-24' />
            <div className='mt-2 flex justify-between border-t border-[#eef0f7] pt-5'>
              <Skeleton className='h-11 w-28 rounded-xl' />
              <Skeleton className='h-11 w-28 rounded-xl' />
            </div>
          </Panel>
          <Panel className={`${lectureAsideClass} flex flex-col gap-3`}>
            <Skeleton className='h-5 w-1/2' />
            <Skeleton className='h-2 w-full rounded-full' />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className='h-12 w-full rounded-xl' />
            ))}
          </Panel>
        </div>
      </div>
    </LectureShell>
  );
}

/** Lecture failed to load (with retry), or is locked (with the reason). */
export function LectureStateCard({
  tone,
  title,
  message,
  backHref,
  backLabel,
  retryLabel,
  onRetry,
}: {
  tone: 'error' | 'locked';
  title: string;
  message?: string;
  backHref: string;
  backLabel: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <LectureShell>
      <LectureTopBar backHref={backHref} backLabel={backLabel} />
      <Panel flush className='mx-auto w-full max-w-2xl'>
        {tone === 'error' ? (
          <ErrorState
            title={title}
            description={message}
            retryLabel={retryLabel}
            onRetry={onRetry}
          />
        ) : (
          <EmptyState
            icon={<Lock aria-hidden />}
            title={title}
            description={message}
            action={
              <Link
                href={backHref}
                className={buttonVariants({ variant: 'product', size: 'control' })}
              >
                {backLabel}
              </Link>
            }
          />
        )}
      </Panel>
    </LectureShell>
  );
}
