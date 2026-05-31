'use client';

import { motion, type Easing } from 'framer-motion';
import type { ReactNode } from 'react';

import { AcademyTitleUnderline } from '@/shared/components/icons/academy';
import { cn } from '@/shared/lib/cn';

const ease: Easing = [0.22, 1, 0.36, 1];

export type PageFilterSectionProps = {
  titleLead: ReactNode;
  titleAccent: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  gridClassName: string;
  showHeaderDivider?: boolean;
};

export function PageFilterSection({
  titleLead,
  titleAccent,
  subtitle,
  children,
  gridClassName,
  showHeaderDivider = false,
}: PageFilterSectionProps) {
  return (
    <section className='relative z-50 px-0 pb-[50px] max-[980px]:pb-10'>
      <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
        <motion.div
          className='relative mx-auto max-w-[1000px] rounded-[24px] border-2 border-[#e5e7f0] bg-white px-[44px] pb-[49px] pt-[47px] max-[980px]:px-6 max-[980px]:pb-7 max-[980px]:pt-9'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
        >
          <motion.div
            className={cn(
              'mb-6 text-center max-[980px]:mb-7',
              showHeaderDivider &&
                'border-b border-[#e5e7f0] pb-5 max-[980px]:pb-6'
            )}
          >
            <h1 className='relative z-2 mb-[18px] text-center text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364]'>
              {titleLead}{' '}
              <em className='relative inline-block font-normal italic text-[#1e2364] opacity-55'>
                {titleAccent}
                <AcademyTitleUnderline />
              </em>
            </h1>
            <p className='mx-auto max-w-[560px] text-[15.5px] leading-[1.65] text-[#6b7196] whitespace-nowrap max-[720px]:whitespace-normal'>
              {subtitle}
            </p>
          </motion.div>

          <div
            className={cn(
              'relative z-5 grid items-end gap-5',
              gridClassName
            )}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
