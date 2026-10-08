import { GraduationCap } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/shared/lib/cn';

/** 16:9 course cover; a plain tinted block with a cap mark when there is no image. */
export function CourseCover({
  image,
  sizes,
  className,
}: {
  image: string | null;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-video items-center justify-center overflow-hidden bg-[#eef0f7]',
        className
      )}
    >
      {image ? (
        <Image src={image} alt='' fill sizes={sizes} className='object-cover' />
      ) : (
        <GraduationCap className='size-8 text-[#9aa0bd]' aria-hidden />
      )}
    </div>
  );
}
