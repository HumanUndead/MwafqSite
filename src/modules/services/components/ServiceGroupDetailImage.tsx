'use client';

import { useState } from 'react';
import Image from 'next/image';

import {
  serviceGroupImageFallback,
  serviceGroupImageSrc,
} from '@/shared/lib/serviceGroupMedia';

type ServiceGroupDetailImageProps = {
  icon: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ServiceGroupDetailImage({
  icon,
  alt,
  className,
  sizes = '(max-width: 1024px) 100vw, 330px',
  priority = false,
}: ServiceGroupDetailImageProps) {
  const [src, setSrc] = useState(() => serviceGroupImageSrc(icon));

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setSrc(serviceGroupImageFallback())}
    />
  );
}
