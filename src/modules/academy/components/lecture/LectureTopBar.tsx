import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

/** Back to the course page, with the course name beside it. */
export function LectureTopBar({
  backHref,
  backLabel,
  courseName,
}: {
  backHref: string;
  backLabel: string;
  courseName?: string | null;
}) {
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <Link
        href={backHref}
        className={cn(buttonVariants({ variant: 'productText', size: 'compact' }), '-ms-3.5 shrink-0')}
      >
        <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
        {backLabel}
      </Link>
      {courseName ? (
        <p className='hidden min-w-0 border-s border-[#d9ddea] ps-3 text-[13px] font-semibold text-[#6b7196] sm:block'>
          <span className='line-clamp-1 break-words' title={courseName}>
            {courseName}
          </span>
        </p>
      ) : null}
    </div>
  );
}
