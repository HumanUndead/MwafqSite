'use client';

import { motion, type Easing } from 'framer-motion';
import { useState } from 'react';
import { AcademyCategorySelect } from '@/modules/auth/components/AcademyCategorySelect';
import type { CourseCategoryListItem } from './courseCategory.types';
import {
  AcademySearchIcon,
  AcademyTitleUnderline,
} from '@/shared/components/icons/academy';

const ease: Easing = [0.22, 1, 0.36, 1];

const MotionSearchIcon = motion.create(AcademySearchIcon);

type AcademyFilterProps = {
  categories: readonly CourseCategoryListItem[];
  langId: number;
};

export function AcademyFilter({ categories, langId }: AcademyFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className='relative z-50 px-0 pb-[50px] pt-[180px] max-[980px]:pb-10 max-[980px]:pt-[150px]'>
      <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
        <motion.div
          className='relative mx-auto max-w-[1000px] rounded-[24px] border-2 border-[#e5e7f0] bg-white px-[44px] pb-[49px] pt-[47px] max-[980px]:px-6 max-[980px]:pb-7 max-[980px]:pt-9'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
        >
          <motion.div className='mb-6 border-b border-[#e5e7f0] pb-5 text-center max-[980px]:mb-7 max-[980px]:pb-6'>
            <h1 className='relative z-2 mb-[18px] text-center text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364]'>
              Welcome to{' '}
              <em className='relative inline-block italic font-normal text-[#1e2364] opacity-55'>
                Mwafq Academy
                <AcademyTitleUnderline />
              </em>
            </h1>
            <p className='mx-auto max-w-[560px] text-[15.5px] leading-[1.65] text-[#6b7196] whitespace-nowrap max-[720px]:whitespace-normal'>
              Keep advancing your professional and medical skills
            </p>
          </motion.div>

          <div className='relative z-5 grid grid-cols-[1.2fr_1.2fr_auto] items-end gap-5 max-[1024px]:grid-cols-[1fr_1fr] max-[640px]:grid-cols-1 max-[640px]:gap-3.5'>
            <AcademyCategorySelect
              categories={categories}
              langId={langId}
              id='bk-section-trigger'
            />

            <div>
              <label
                htmlFor='bk-search'
                className='mb-2 ml-1.5 block text-[13px] font-bold tracking-[-0.1px] text-[#1e2364]'
              >
                Search
              </label>
              <input
                id='bk-search'
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search...'
                aria-label='Search'
                className='h-[42px] w-full rounded-lg border border-[#e5e7f0] bg-white px-3.5 py-1.5 text-[13.5px] text-[#1e2364] font-inherit transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-[rgba(30,35,100,0.45)] focus:border-[#00a8f1] focus:shadow-[0_0_0_3px_rgba(0,168,241,0.20)] focus:outline-none'
              />
            </div>

            <a
              href='#featuredCourses'
              className='btn btn-primary inline-flex h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-[999px] bg-[#1e2364] px-[22px] text-[13.5px] font-semibold text-white no-underline shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-colors duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#233567] max-[1024px]:col-span-2 max-[1024px]:w-full'
            >
              <MotionSearchIcon
                width={16}
                height={16}
                whileHover={{
                  scale: [1, 1.22, 0.95, 1.06, 1],
                  rotate: [0, -10, 8, -3, 0],
                }}
                transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              />
              Search
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
