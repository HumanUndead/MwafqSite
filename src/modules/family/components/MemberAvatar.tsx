'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageSize, imageUrl } from '@/shared/lib/media';
import { cn } from '@/shared/lib/cn';

interface MemberAvatarProps {
  name: string;
  image?: string | null;
  className?: string;
}

/** Round avatar with the first letter as fallback. */
export function MemberAvatar({ name, image, className }: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const src = image && !failed ? imageUrl(image, ImageSize.thumb) : null;

  return (
    <span
      className={cn(
        'relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e6f6fe] text-[15px] font-bold text-[#1e2364]',
        className
      )}
      aria-hidden
    >
      {src ? (
        <Image
          src={src}
          alt=''
          fill
          sizes='44px'
          className='object-cover'
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}
