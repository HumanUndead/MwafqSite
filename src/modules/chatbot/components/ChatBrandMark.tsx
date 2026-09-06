'use client';

import Image from 'next/image';

import { cn } from '@/shared/lib/cn';

/** Abu Sahel — the assistant's character illustration. */
const HELPER_SRC = '/mwafq-helper.webp';

interface ChatBrandMarkProps {
  /** Accessible name; pass '' when an adjacent label already names it. */
  alt?: string;
  className?: string;
  /** Inner image inset. */
  logoClassName?: string;
  priority?: boolean;
}

/**
 * Abu Sahel inside a circular avatar — used for the panel header, greeting,
 * message bubbles, and typing indicator.
 *
 * The artwork is navy line art on transparent, so it sits on a white disc
 * (navy-on-navy would be invisible against the brand's navy surfaces), and
 * `object-contain` keeps its near-square aspect ratio (263x296) instead of
 * stretching it into the circle.
 */
export function ChatBrandMark({
  alt = '',
  className,
  logoClassName,
  priority = false,
}: ChatBrandMarkProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white',
        className
      )}
    >
      <Image
        src={HELPER_SRC}
        alt={alt}
        width={263}
        height={296}
        priority={priority}
        aria-hidden={alt === '' ? true : undefined}
        className={cn('h-auto w-[92%] object-contain', logoClassName)}
      />
    </span>
  );
}
