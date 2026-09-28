import { GraduationCap } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

/** Brand-harmonious covers for courses without an image. */
const COVER_GRADIENTS = [
  'from-[#1e2364] via-[#2a3a9c] to-[#00a8f1]',
  'from-[#141848] via-[#3b3f9e] to-[#7c83e8]',
  'from-[#0b5f86] via-[#0090d1] to-[#5bc8ff]',
  'from-[#1e2364] via-[#4b2f8f] to-[#a15ad8]',
  'from-[#0f3b5c] via-[#12708f] to-[#2fc4b2]',
] as const;

function coverIndex(seed: number): number {
  return Math.abs(Math.trunc(seed)) % COVER_GRADIENTS.length;
}

/** First visible letter of the title (Arabic or Latin). */
function initialOf(title: string | null | undefined): string {
  // Some courses come back from MyCourses without a name.
  const match = (title ?? '').trim().match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : '';
}

/**
 * 16:9 course cover: the course image, or a generated cover (gradient picked
 * from the course id, its initial and a cap mark) so a list of image-less
 * courses doesn't read as identical tiles. Badges go in `children`.
 */
export function EnrolledCourseMedia({
  image,
  seed,
  title,
  className,
  size = 'md',
  children,
}: {
  image?: string | null;
  /** Stable per course (course id); picks the generated gradient. */
  seed: number;
  title: string | null | undefined;
  className?: string;
  size?: 'md' | 'lg';
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative isolate flex aspect-video items-center justify-center overflow-hidden bg-[#141848]',
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt=''
          fill
          sizes='(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 100vw'
          className='object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100'
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100',
            COVER_GRADIENTS[coverIndex(seed)]
          )}
        >
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]' />
          <GraduationCap
            className={cn(
              'absolute -bottom-6 -end-4 rotate-[-12deg] text-white/10',
              size === 'lg' ? 'size-44' : 'size-32'
            )}
          />
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center font-bold text-white/90 drop-shadow-sm',
              size === 'lg' ? 'text-7xl' : 'text-5xl'
            )}
          >
            {initialOf(title)}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
