'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MEDIA_FALLBACK_IMAGE, serviceIconUrl } from '@/shared/lib/media';
import { cn } from '@/shared/lib/cn';

interface CatalogImageProps {
  icon: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
}

/** Service / group icon with logo fallback on missing or broken files. */
export function CatalogImage({ icon, alt, className, sizes }: CatalogImageProps) {
  const [src, setSrc] = useState(() => serviceIconUrl(icon));
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? '(max-width: 640px) 50vw, 240px'}
      className={cn('object-contain', className)}
      loading='lazy'
      onError={() => setSrc(MEDIA_FALLBACK_IMAGE)}
    />
  );
}
