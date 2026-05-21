'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import { isRtl, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { EASE } from '../constants';

const buyNowTransition = { duration: 0.3, ease: EASE };

const buttonVariants = {
  rest: { backgroundColor: '#00a8f1' },
  hover: {
    backgroundColor: '#0090d1',
    transition: buyNowTransition,
  },
} as const;

const arrowVariants = {
  rest: { x: 0 },
  hover: (rtl: boolean) => ({
    x: rtl ? -4 : 4,
    transition: buyNowTransition,
  }),
} as const;

const sizeClasses = {
  detail: 'h-[38px] gap-2 px-[18px] text-[13px] tracking-[0.3px]',
  card: 'h-[34px] gap-1.5 px-3.5 text-[12.5px]',
} as const;

type BuyNowButtonProps = {
  label: string;
  locale: Locale;
  size?: keyof typeof sizeClasses;
  className?: string;
  href?: string;
  /** Use inside a parent link (e.g. package card). */
  as?: 'button' | 'span';
};

const MotionLink = motion.create(Link);

export function BuyNowButton({
  label,
  locale,
  size = 'detail',
  className,
  href,
  as = 'button',
}: BuyNowButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const rtl = isRtl(locale);

  const sharedClassName = cn(
    'relative z-[2] inline-flex shrink-0 items-center justify-center rounded-[30px] font-extrabold text-white',
    sizeClasses[size],
    className
  );

  const motionProps = prefersReducedMotion
    ? { style: { backgroundColor: '#00a8f1' } }
    : {
        initial: 'rest' as const,
        whileHover: 'hover' as const,
        variants: buttonVariants,
      };

  const labelContent = (
    <>
      <span>{label}</span>
      <motion.span
        aria-hidden
        className='text-base font-bold leading-none'
        custom={rtl}
        variants={prefersReducedMotion ? undefined : arrowVariants}
      >
        {rtl ? '←' : '→'}
      </motion.span>
    </>
  );

  if (href) {
    return (
      <MotionLink href={href} {...motionProps} className={sharedClassName}>
        {labelContent}
      </MotionLink>
    );
  }

  if (as === 'span') {
    return (
      <motion.span {...motionProps} className={sharedClassName}>
        {labelContent}
      </motion.span>
    );
  }

  return (
    <motion.button type='button' {...motionProps} className={sharedClassName}>
      {labelContent}
    </motion.button>
  );
}
