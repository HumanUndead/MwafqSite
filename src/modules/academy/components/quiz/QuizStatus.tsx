import { X } from 'lucide-react';
import Link from 'next/link';
import { AcademyBackdrop, GlassPanel } from '../ui/AcademyGlass';

export function QuizLoading({ label }: { label: string }) {
  return (
    <AcademyBackdrop className='flex items-center justify-center px-4'>
      <div role='status' className='space-y-4 text-center'>
        <div className='mx-auto size-12 animate-spin rounded-full border-4 border-[#00a8f1]/20 border-t-[#00a8f1]' />
        <p className='text-base font-semibold text-[#6b7196]'>{label}</p>
      </div>
    </AcademyBackdrop>
  );
}

export function QuizMessage({
  message,
  actionHref,
  actionLabel,
}: {
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <AcademyBackdrop className='flex items-center justify-center px-4 py-16'>
      <GlassPanel className='w-full max-w-md space-y-6 p-8 text-center'>
        <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100'>
          <X className='size-8 text-red-600' aria-hidden />
        </div>
        <p className='text-base text-[#1e2364]'>{message}</p>
        <Link
          href={actionHref}
          className='inline-flex items-center justify-center rounded-full bg-[#00a8f1] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0090d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 motion-reduce:transition-none'
        >
          {actionLabel}
        </Link>
      </GlassPanel>
    </AcademyBackdrop>
  );
}
