'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { AcademySearchIcon } from '@/shared/components/icons/academy';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

const MotionSearchIcon = motion.create(AcademySearchIcon);

const baseClassName =
  'inline-flex h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#1e2364] px-[22px] text-[13.5px] font-semibold text-white no-underline shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-colors duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#233567]';

export type PageFilterSearchButtonProps = {
  label: ReactNode;
  className?: string;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

export function PageFilterSearchButton({
  label,
  className,
  href,
  onClick,
}: PageFilterSearchButtonProps) {
  const icon = (
    <MotionSearchIcon
      width={16}
      height={16}
      whileHover={{
        scale: [1, 1.22, 0.95, 1.06, 1],
        rotate: [0, -10, 8, -3, 0],
      }}
      transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
    />
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn('btn btn-primary', baseClassName, className)}
      >
        {icon}
        {label}
      </a>
    );
  }

  return (
    <Button
      type='button'
      onClick={onClick}
      className={cn(baseClassName, className)}
    >
      {icon}
      {label}
    </Button>
  );
}
