'use client';

import { motion, type Easing } from 'framer-motion';
import {
  AcademySearchIcon,
  AcademyTitleUnderline,
} from '@/shared/components/icons/academy';
import { Button } from '@/shared/components/ui/Button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { useState } from 'react';

const ease: Easing = [0.22, 1, 0.36, 1];

const MotionSearchIcon = motion.create(AcademySearchIcon);

type FilterSectionProps = {
  t: {
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    packageNameLabel: string;
    packageNamePlaceholder: string;
    searchBtn: string;
  };
};

export function FilterSection({ t }: FilterSectionProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [packageName, setPackageName] = useState(
    searchParams.get('search') ?? ''
  );

  function handleSearch() {
    const params = queryString.stringify(
      { search: packageName, page: 1 },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(params ? `${pathname}?${params}` : pathname);
  }

  return (
    <section className='relative z-50 px-0 pb-[50px] pt-[180px] max-[980px]:pb-10 max-[980px]:pt-[150px]'>
      <motion.div className='mx-auto max-w-[1320px] px-4 md:px-7'>
        <motion.div
          className='relative mx-auto max-w-[1000px] rounded-[24px] border-2 border-[#e5e7f0] bg-white px-[44px] pb-[49px] pt-[47px] max-[980px]:px-6 max-[980px]:pb-7 max-[980px]:pt-9'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
        >
          <motion.div className='mb-6 text-center max-[980px]:mb-7'>
            <h1 className='relative z-2 mb-[18px] text-center text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364]'>
              {t.titleLead}{' '}
              <em className='relative inline-block font-normal italic text-[#1e2364] opacity-55'>
                {t.titleAccent}
                <AcademyTitleUnderline />
              </em>
            </h1>
            <p className='mx-auto max-w-[560px] text-[15.5px] leading-[1.65] text-[#6b7196] whitespace-nowrap max-[720px]:whitespace-normal'>
              {t.subtitle}
            </p>
          </motion.div>

          <div className='relative z-5 grid grid-cols-[1fr_auto] items-end gap-5 max-[640px]:grid-cols-1 max-[640px]:gap-3.5'>
            <div className='min-w-0'>
              <label
                htmlFor='services-package-name'
                className='mb-2 ml-1.5 block text-[13px] font-bold tracking-[-0.1px] text-[#1e2364] rtl:ml-0 rtl:mr-1.5'
              >
                {t.packageNameLabel}
              </label>
              <input
                id='services-package-name'
                type='text'
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder={t.packageNamePlaceholder}
                className='h-[42px] w-full rounded-lg border border-[#e5e7f0] bg-white px-3.5 py-1.5 text-[13.5px] text-[#1e2364] transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-[rgba(30,35,100,0.45)] focus:border-[#00a8f1] focus:shadow-[0_0_0_3px_rgba(0,168,241,0.20)] focus:outline-none'
              />
            </div>

            <Button
              type='button'
              onClick={handleSearch}
              className='inline-flex h-[42px] min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#1e2364] px-[22px] text-[13.5px] font-semibold text-white no-underline shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-colors duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1e2364] max-[640px]:w-full'
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
              {t.searchBtn}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
