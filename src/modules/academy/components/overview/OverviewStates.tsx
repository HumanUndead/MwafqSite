import { BookOpen, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@/locales/types';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { AcademyBackdrop, AcademyStage, GlassPanel } from '../ui/AcademyGlass';

type PlayerT = Dictionary['academyPlayer'];

const lightBlock = 'rounded-xl bg-[#e5e7f0] motion-safe:animate-pulse';
const darkBlock = 'rounded-xl bg-white/10 motion-safe:animate-pulse';

/** Skeleton mirroring the overview layout: stage + curriculum + sidebar. */
export function OverviewSkeleton({ t }: { t: PlayerT }) {
  return (
    <AcademyBackdrop>
      <div role='status' aria-live='polite' aria-busy='true'>
        <span className='sr-only'>{t.loading}</span>
        <div>
          <AcademyStage
            className='mx-2 rounded-[28px] sm:mx-3 sm:rounded-[36px]'
            innerClassName='py-8 lg:py-12'
          >
            <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12'>
              <div className='space-y-5'>
                <div className={cn(darkBlock, 'h-4 w-40')} />
                <div className={cn(darkBlock, 'h-10 w-4/5')} />
                <div className='space-y-2'>
                  <div className={cn(darkBlock, 'h-4 w-full max-w-2xl')} />
                  <div className={cn(darkBlock, 'h-4 w-3/4 max-w-xl')} />
                </div>
                <div className='flex flex-wrap gap-2'>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={cn(darkBlock, 'h-7 w-24 rounded-full')} />
                  ))}
                </div>
              </div>
              <GlassPanel tone='dark' className='space-y-5 p-6'>
                <div className='flex items-center gap-4'>
                  <div className={cn(darkBlock, 'size-[88px] rounded-full')} />
                  <div className='flex-1 space-y-2'>
                    <div className={cn(darkBlock, 'h-4 w-24')} />
                    <div className={cn(darkBlock, 'h-3 w-32')} />
                  </div>
                </div>
                <div className={cn(darkBlock, 'h-2 w-full rounded-full')} />
                <div className={cn(darkBlock, 'h-12 w-full rounded-full')} />
              </GlassPanel>
            </div>
          </AcademyStage>
        </div>

        <div className='mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8'>
          <div className='space-y-4'>
            <div className={cn(lightBlock, 'h-7 w-48')} />
            <GlassPanel className='divide-y divide-[#e5e7f0] overflow-hidden'>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className='flex items-center gap-4 px-5 py-4'>
                  <div className={cn(lightBlock, 'size-10')} />
                  <div className='flex-1 space-y-2'>
                    <div className={cn(lightBlock, 'h-4 w-2/3')} />
                    <div className={cn(lightBlock, 'h-3 w-1/3')} />
                  </div>
                </div>
              ))}
            </GlassPanel>
          </div>
          <div className='space-y-5'>
            <GlassPanel className='space-y-3 p-5'>
              <div className={cn(lightBlock, 'h-3 w-20')} />
              <div className={cn(lightBlock, 'h-5 w-3/4')} />
              <div className={cn(lightBlock, 'h-10 w-full rounded-full')} />
            </GlassPanel>
            <GlassPanel className='space-y-3 p-5'>
              <div className={cn(lightBlock, 'h-5 w-1/2')} />
              <div className={cn(lightBlock, 'h-3 w-full')} />
              <div className={cn(lightBlock, 'h-3 w-5/6')} />
            </GlassPanel>
          </div>
        </div>
      </div>
    </AcademyBackdrop>
  );
}

export function OverviewNotFound({ t, backHref }: { t: PlayerT; backHref: string }) {
  return (
    <AcademyBackdrop>
      <div className='mx-auto flex max-w-7xl justify-center px-4 py-16 sm:px-6 lg:px-8'>
        <GlassPanel className='w-full max-w-lg p-8 text-center sm:p-10'>
          <div className='mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100'>
            <BookOpen aria-hidden className='size-8' />
          </div>
          <h1 className='mt-5 text-[28px] font-bold text-[#1e2364]'>{t.notFoundTitle}</h1>
          <p className='mt-2 text-[16px] text-[#6b7196]'>{t.notFoundMessage}</p>
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: 'brand', size: 'lg', shape: 'pill' }),
              'mt-7 focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2'
            )}
          >
            <ChevronLeft aria-hidden className='size-4 rtl:rotate-180' />
            {t.backToMyCourses}
          </Link>
        </GlassPanel>
      </div>
    </AcademyBackdrop>
  );
}
