import Image from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

/**
 * 16:9 course cover: the course image, or the academy mark on the stage
 * navy when the course has none. Badges sit in the top corner.
 */
export function EnrolledCourseMedia({
  image,
  className,
  logoClassName,
  children,
}: {
  image?: string | null;
  className?: string;
  logoClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-video items-center justify-center overflow-hidden bg-[#141848]',
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
      <Image
        src='/demo-assets/logo.svg'
        alt=''
        width={72}
        height={72}
        className={cn(
          'h-14 w-14 object-contain opacity-30 brightness-0 invert transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          logoClassName
        )}
      />
      )}
      {children}
    </div>
  );
}
