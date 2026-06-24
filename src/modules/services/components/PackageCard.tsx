'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { cn } from '@/lib/utils';
import { BuyNowButton } from './BuyNowButton';
import { packageCardVariants, packageMediaVariants } from '../constants';
import type { ServiceGroupListItem } from '@/modules/auth/serviceGroup.types';
import { type Locale, localeToLangId } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { getServiceGroupBuyPath } from '@/modules/services/booking.shared';
import {
  lowestServiceGroupPrice,
  serviceGroupImageFallback,
  serviceGroupImageSrc,
} from '@/shared/lib/serviceGroupMedia';

const MotionCard = motion.create(Card);

function SarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 1124.14 1256.39'
      aria-hidden
      className={cn('fill-current', className)}
    >
      <path d='M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z' />
      <path d='M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z' />
    </svg>
  );
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? String(price) : price.toFixed(2);
}

type PackageCardProps = {
  pkg: ServiceGroupListItem;
  locale: Locale;
  t: {
    popularTag: string;
    newTag: string;
    buyNow: string;
    min: string;
    tests: string;
    sarAriaLabel: string;
  };
  delay?: number;
  /** Compact card for the related-tests grid (title, image, price, CTA only). */
  variant?: 'default' | 'related';
  /** Set false when a parent already wraps the card in ScrollReveal. */
  withScrollReveal?: boolean;
  isAuthenticated?: boolean;
  hidePrice?: boolean;
  /** No hover lift / image zoom — for flat grids on detail pages. */
  flat?: boolean;
};

export function PackageCard({
  pkg,
  locale,
  t,
  delay = 0,
  variant = 'default',
  withScrollReveal,
  isAuthenticated = false,
  hidePrice = false,
  flat = false,
}: PackageCardProps) {
  const isRelated = variant === 'related';
  const shouldReveal = withScrollReveal ?? !isRelated;

  const prefersReducedMotion = useReducedMotion();
  const localeId = localeToLangId[locale];
  const isAr = localeId === 2;
  const translation =
    pkg.translations.find((tr) => tr.langId === localeId) ??
    pkg.translations[0];
  const title = translation?.name?.trim() ?? '';
  const desc = translation?.description;
  const tagLabel = isRelated ? null : t.popularTag;
  const buyHref = isAuthenticated
    ? getServiceGroupBuyPath(locale, pkg.id)
    : `${getLocalizedRoute(locale, ROUTES.LOGIN)}?redirect=${encodeURIComponent(getServiceGroupBuyPath(locale, pkg.id))}`;
  const packageDetailHref = `${getLocalizedRoute(locale, ROUTES.SERVICES)}/${pkg.id}`;
  const price = lowestServiceGroupPrice(pkg.serviceGroupClassificationPricings);
  const [imageSrc, setImageSrc] = useState(() =>
    serviceGroupImageSrc(pkg.icon, pkg.id)
  );

  const cardMotion =
    flat || prefersReducedMotion
      ? {}
      : {
          variants: packageCardVariants,
          initial: 'rest' as const,
          whileHover: 'hover' as const,
        };

  const mediaMotion =
    flat || prefersReducedMotion ? {} : { variants: packageMediaVariants };

  const image = (
    <Image
      src={imageSrc}
      alt={title}
      fill
      sizes={
        isRelated
          ? '(max-width: 480px) 100vw, 20vw'
          : '(max-width: 640px) 100vw, 240px'
      }
      className='object-cover'
      loading='lazy'
      onError={() => setImageSrc(serviceGroupImageFallback(pkg.id))}
    />
  );

  const card = isRelated ? (
    <MotionCard
      {...cardMotion}
      className={cn(
        'h-full w-full min-w-0 gap-0 overflow-hidden rounded-[14px] border-2 bg-white py-0 text-[#1e2364] shadow-none ring-0'
      )}
    >
      <Link
        href={packageDetailHref}
        className='relative block aspect-square overflow-hidden bg-[#f2f2f2]'
      >
        <motion.div className='absolute inset-0' {...mediaMotion}>
          {image}
        </motion.div>
      </Link>

      <div className='border-t border-[#e5e7f0] px-4 py-3.5'>
        <Link href={packageDetailHref}>
          <CardTitle className='text-[15px] font-extrabold leading-tight text-[#1e2364]'>
            {title}
          </CardTitle>
        </Link>
      </div>

      {!hidePrice ? (
        <CardFooter className='mt-auto justify-between gap-2 border-t border-[#e5e7f0] bg-transparent px-4 py-3.5'>
          {price ? (
            <span className='inline-flex items-baseline gap-1 text-[20px] font-extrabold text-[#1e2364]'>
              {formatPrice(price)}
              <SarIcon className='inline-block h-3.5 w-3' />
            </span>
          ) : (
            <span />
          )}
        </CardFooter>
      ) : null}
    </MotionCard>
  ) : (
    <MotionCard
      {...cardMotion}
      className={cn(
        'h-full w-full min-w-0 gap-0 overflow-hidden rounded-[20px] border-2 bg-white py-0 text-[#1e2364] shadow-none ring-0'
      )}
    >
      <Link
        href={packageDetailHref}
        className='relative block aspect-4/3 w-full shrink-0 overflow-hidden bg-[#1e2364]'
      >
        <motion.div className='absolute inset-0 z-0' {...mediaMotion}>
          {image}
        </motion.div>
      </Link>

      <CardContent className='flex flex-1 flex-col gap-2 px-5 pt-4 pb-3'>
        <Link href={packageDetailHref} className='block'>
          <CardTitle className='min-h-15 text-[17px] font-extrabold leading-tight tracking-[-0.3px] text-[#1e2364]'>
            {title}
          </CardTitle>
        </Link>
        <CardDescription
          className='text-[12px] leading-normal text-[#6b7196]'
          dangerouslySetInnerHTML={{ __html: desc ?? '' }}
        />
      </CardContent>

      {!hidePrice ? (
        <CardFooter className='mt-auto justify-between gap-2.5 border-t-2 border-[#eef0f7] bg-transparent px-5 pt-3 pb-4'>
          {price ? (
            <span className='inline-flex items-baseline gap-1 font-extrabold'>
              <span className='text-[24px] leading-none tracking-[-0.5px] text-[#1e2364]'>
                {formatPrice(price)}
              </span>
              <span
                className='inline-flex h-5 w-4.5 translate-y-0.5 text-[#1e2364]'
                aria-label={t.sarAriaLabel}
              >
                <SarIcon className='h-full w-full' />
              </span>
            </span>
          ) : (
            <span />
          )}
        </CardFooter>
      ) : null}
    </MotionCard>
  );

  if (!shouldReveal) {
    return card;
  }

  return (
    <ScrollReveal
      className={cn(isRelated ? 'h-full w-full' : 'w-full')}
      transitionDelay={delay}
    >
      {card}
    </ScrollReveal>
  );
}
