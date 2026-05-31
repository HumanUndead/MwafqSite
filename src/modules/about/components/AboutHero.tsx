/* eslint-disable @next/next/no-img-element */

import type { Dictionary } from '@/locales/types';

interface Props {
  content: Dictionary['about']['hero'];
}

export function AboutHero({ content }: Props) {
  return (
    <section
      id='about'
      className='relative overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-10 sm:px-7'
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-55 bg-[radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] bg-size-[24px_24px] mask-[radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]'
      />

      <div className='relative z-2 mx-auto max-w-[1320px]'>
        <div className='grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-[60px]'>
          <div className='flex w-full flex-col items-start gap-9'>
            <h1 className='text-[clamp(32px,4.9vw,67px)] font-extrabold leading-[1.02] tracking-[-2px] text-[#1e2364]'>
              <span className='block'>{content.headingTop}</span>
              <span className='-mt-3.5 block pb-4'>
                <span className='text-[clamp(23px,3.5vw,48px)] font-normal italic leading-[1.1] tracking-[-1.2px] text-[#1e2364]/55'>
                  {content.headingMidLead}{' '}
                  <span className='relative inline-block'>
                    {content.headingMidAccent}
                    <svg
                      aria-hidden='true'
                      viewBox='0 0 200 14'
                      preserveAspectRatio='none'
                      className='pointer-events-none absolute inset-x-0 top-full mt-1 h-4 w-full overflow-visible'
                    >
                      <path
                        d='M2 12 Q 50 -2 100 8 T 198 4'
                        fill='none'
                        stroke='#00dec9'
                        strokeWidth='4'
                        strokeLinecap='round'
                      />
                    </svg>
                  </span>
                </span>
              </span>
            </h1>

            <div className='relative max-w-[640px] border-s-2 border-[#00a8f1] ps-[26px]'>
              <span className='mb-3.5 inline-block text-[12px] font-bold uppercase leading-none tracking-[2px] text-[#00a8f1]'>
                {content.leadLabel}
              </span>
              <p className='text-[17.5px] leading-[1.75] text-[#6b7196]'>
                {content.lead}
              </p>
            </div>
          </div>

          <div className='relative mx-auto flex w-full items-center justify-center'>
            <img
              src='/demo-assets/character-2.svg'
              alt={content.imageAlt}
              className='block h-auto w-full max-w-[360px] animate-[mascotFloat_7s_ease-in-out_infinite] sm:max-w-[440px] lg:max-w-[552px]'
              loading='eager'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
