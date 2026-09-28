'use client';

import { BookOpen, ChevronLeft, Play } from 'lucide-react';
import Link from 'next/link';
import type { Ref } from 'react';
import type { Dictionary } from '@/locales/types';
import { AcademyStage } from '../ui/AcademyGlass';

/**
 * The page's single dark stage: back link, course name and the video frame
 * (or the no-video placeholder). The iframe ref is owned by the player.
 */
export function LectureStage({
  backHref,
  courseName,
  embedUrl,
  iframeRef,
  iframeKey,
  videoTitle,
  labels: t,
}: {
  backHref: string;
  courseName: string;
  /** Vimeo embed URL, or null when the lecture has no video. */
  embedUrl: string | null;
  iframeRef: Ref<HTMLIFrameElement>;
  iframeKey: string;
  videoTitle: string;
  labels: Dictionary['academyLecture'];
}) {
  return (
    <AcademyStage
      className='rounded-[28px] shadow-[0_24px_64px_-24px_rgba(20,24,72,0.6)] sm:rounded-[36px]'
      innerClassName='max-w-none p-3 sm:p-5 lg:p-6'
    >
      <div className='mb-3 flex min-w-0 items-center gap-3 sm:mb-4'>
        <Link
          href={backHref}
          className='inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
        >
          <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
          <span className='hidden sm:inline'>{t.backToCourse}</span>
          <span className='sr-only sm:hidden'>{t.backToCourse}</span>
        </Link>
        <p className='flex min-w-0 items-center gap-2 text-sm font-semibold text-white/75'>
          <BookOpen className='size-4 shrink-0 text-[#00a8f1]' aria-hidden />
          <span className='sr-only'>{t.courseInfo}</span>
          <span className='truncate'>{courseName}</span>
        </p>
      </div>

      <div className='overflow-hidden rounded-[20px] bg-black ring-1 ring-white/10 sm:rounded-[24px]'>
        {embedUrl ? (
          <div className='relative aspect-video'>
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={embedUrl}
              allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share'
              referrerPolicy='strict-origin-when-cross-origin'
              className='absolute inset-0 size-full'
              title={videoTitle}
            />
          </div>
        ) : (
          <div className='flex aspect-video items-center justify-center bg-[#141848]'>
            <div className='space-y-4 px-6 text-center'>
              <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 sm:size-20'>
                <Play className='ms-1 size-8 text-[#00a8f1] sm:size-9' aria-hidden />
              </div>
              <p className='text-sm text-white/75'>{t.noVideo}</p>
            </div>
          </div>
        )}
      </div>
    </AcademyStage>
  );
}
