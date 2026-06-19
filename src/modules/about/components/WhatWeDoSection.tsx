import type { AboutSectionWithItemsContent } from '@/modules/about/types/aboutContent';
import { Eyebrow } from '@/modules/home/components/Eyebrow';

interface Props {
  content: AboutSectionWithItemsContent;
}

export function WhatWeDoSection({ content }: Props) {
  return (
    <section
      id='what'
      className='bg-[#eeeeef] px-4 py-12 sm:px-7 sm:py-16'
    >
      <div className='mx-auto max-w-[1320px]'>
        <div className='mb-12 max-w-[720px]'>
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h2 className='text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]'>
            {content.titleLead}
            <br />
            {content.titleAccent}
          </h2>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {content.items.map((item) => (
            <article
              key={item.title}
              className='relative overflow-hidden rounded-[4px_28px_4px_28px] border-2 border-[#e5e7f0] bg-white px-7 pb-8 pt-11'
            >
              <span
                aria-hidden='true'
                className='absolute left-0 top-0 h-[30px] w-[30px]'
              >
                <svg
                  viewBox='0 0 30 30'
                  className='h-full w-full'
                  aria-hidden='true'
                >
                  <path
                    d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z'
                    fill='#00a8f1'
                  />
                </svg>
              </span>
              <h3 className='mb-2.5 text-[18px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                {item.title}
              </h3>
              <p className='text-[14px] leading-[1.6] text-[#6b7196]'>
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
