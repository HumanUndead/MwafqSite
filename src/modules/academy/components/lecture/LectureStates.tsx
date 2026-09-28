'use client';

import { ChevronLeft, Lock, X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/lib/variants';
import { AcademyBackdrop, GlassPanel } from '../ui/AcademyGlass';

const pulse = 'animate-pulse motion-reduce:animate-none';

/** Skeleton mirroring the player layout: stage + details + curriculum. */
export function LecturePlayerSkeleton({ label }: { label: string }) {
  return (
    <AcademyBackdrop>
      <div
        className='mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8'
        role='status'
        aria-live='polite'
      >
        <span className='sr-only'>{label}</span>
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]'>
          <div className='min-w-0 space-y-6'>
            <div className='overflow-hidden rounded-[28px] bg-[#141848] p-4 sm:p-6'>
              <div className={cn('mb-4 h-4 w-40 rounded-full bg-white/10', pulse)} />
              <div className={cn('aspect-video w-full rounded-[20px] bg-white/10', pulse)} />
            </div>
            <GlassPanel className='space-y-4 p-6'>
              <div className={cn('h-7 w-2/3 rounded-full bg-[#e5e7f0]', pulse)} />
              <div className='flex gap-2'>
                <div className={cn('h-7 w-24 rounded-full bg-[#e5e7f0]', pulse)} />
                <div className={cn('h-7 w-20 rounded-full bg-[#e5e7f0]', pulse)} />
              </div>
              <div className={cn('h-4 w-full rounded-full bg-[#e5e7f0]', pulse)} />
              <div className={cn('h-4 w-5/6 rounded-full bg-[#e5e7f0]', pulse)} />
            </GlassPanel>
          </div>
          <GlassPanel className='space-y-3 p-5'>
            <div className={cn('h-5 w-1/2 rounded-full bg-[#e5e7f0]', pulse)} />
            <div className={cn('h-2 w-full rounded-full bg-[#e5e7f0]', pulse)} />
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={cn('h-12 w-full rounded-2xl bg-[#e5e7f0]/70', pulse)}
              />
            ))}
          </GlassPanel>
        </div>
      </div>
    </AcademyBackdrop>
  );
}

/** Centered glass card for error / locked states. */
export function LectureStateCard({
  tone,
  title,
  message,
  backHref,
  backLabel,
}: {
  tone: 'error' | 'locked';
  title?: string;
  message: string;
  backHref: string;
  backLabel: string;
}) {
  const icon: ReactNode =
    tone === 'error' ? (
      <X className='size-8 text-red-600' aria-hidden />
    ) : (
      <Lock className='size-8 text-amber-500' aria-hidden />
    );

  return (
    <AcademyBackdrop>
      <div className='mx-auto max-w-xl px-4 py-16 sm:px-6 lg:py-24'>
        <GlassPanel
          className='flex flex-col items-center gap-4 p-8 text-center sm:p-10'
          role={tone === 'error' ? 'alert' : undefined}
        >
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-full ring-1',
              tone === 'error'
                ? 'bg-red-50 ring-red-100'
                : 'bg-amber-50 ring-amber-100'
            )}
          >
            {icon}
          </div>
          {title ? (
            <h1 className='text-xl font-bold text-[#1e2364]'>{title}</h1>
          ) : null}
          <p
            className={cn(
              'text-base',
              tone === 'error' && !title ? 'text-red-600' : 'text-[#6b7196]'
            )}
          >
            {message}
          </p>
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: 'brand', size: 'lg', shape: 'pill' }),
              'mt-2 focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2'
            )}
          >
            <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
            {backLabel}
          </Link>
        </GlassPanel>
      </div>
    </AcademyBackdrop>
  );
}
