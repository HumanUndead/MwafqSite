import type { Dictionary } from '@/locales/types';
import { B2BServicesCards } from './B2BServicesCards';

interface Props {
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
}

export function B2BServicesSection({ content, isRtl }: Props) {
  return (
    <section id='services' className='bg-[#eeeeef] px-4 pb-12 sm:px-7 sm:pb-20'>
      <div className='mx-auto max-w-330'>
        <div className='mx-auto mb-8 max-w-[760px] text-center lg:mb-12'>
          <h2 className='mb-4 text-[clamp(30px,4.2vw,52px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
            {content.titleLead}{' '}
            {content.titleAccent ? (
              <em className='font-normal italic text-[#1e2364]/55'>
                {content.titleAccent}
              </em>
            ) : null}
          </h2>
          <p className='mx-auto max-w-[600px] text-[16px] leading-[1.65] text-[#6b7196]'>
            {content.body}
          </p>
        </div>

        <ul
          className='mb-8 flex flex-wrap justify-center gap-2 lg:mb-10 lg:gap-2.5'
          aria-label='Service highlights'
        >
          {content.trustChips.map((chip) => (
            <li
              key={chip}
              className='rounded-full border border-[#e5e7f0] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1e2364] sm:px-3.5 sm:text-[12px]'
            >
              {chip}
            </li>
          ))}
        </ul>

        <B2BServicesCards content={content} isRtl={isRtl} />
      </div>
    </section>
  );
}
