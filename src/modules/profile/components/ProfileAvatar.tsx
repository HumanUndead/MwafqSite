'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

type ProfileAvatarProps = {
  /** Empty when the user has no photo; initials are shown instead. */
  src: string;
  alt: string;
  name: string;
  className?: string;
};

export function ProfileAvatar({ src, alt, name, className }: ProfileAvatarProps) {
  const [errored, setErrored] = useState(false);
  const initials = initialsFromName(name) || '?';

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e6f6fe] font-bold text-[#1e2364]',
        className
      )}
    >
      {!src || errored ? (
        <span aria-hidden>{initials}</span>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={140}
          height={140}
          className='block h-full w-full object-cover'
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
