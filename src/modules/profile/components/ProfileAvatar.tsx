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
  src: string;
  alt: string;
  name: string;
  className?: string;
};

export function ProfileAvatar({
  src,
  alt,
  name,
  className,
}: ProfileAvatarProps) {
  const [errored, setErrored] = useState(false);
  const initials = initialsFromName(name) || '?';

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#e5e7f0] bg-[#eef0f7] text-[#1e2364]',
        className
      )}
    >
      {errored ? (
        <span className='font-extrabold tracking-[-0.5px]'>{initials}</span>
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
