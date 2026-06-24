'use client';

import { useEffect, useState } from 'react';

import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { getUtilityIconByKey, StarIcon } from '@/shared/components/icons/home';
import type { HomeAcademyContent } from '../home.types';
import { Eyebrow } from './Eyebrow';

const MOBILE_MAX_WIDTH_PX = 767;
const CARD_STAGGER_S = 0.08;

function useMobileReveal() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile === null ? true : !isMobile;
}

interface Props {
  content: HomeAcademyContent;
}

export function AcademyCourseGrid({ content }: Props) {
  const instant = useMobileReveal();

  return (
    <>
      <ScrollReveal className='mb-8 md:mb-15' instant={instant}>
        <div className='flex flex-wrap items-end justify-start gap-12.5'>
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className='text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]'>
              {content.title}
              {content.accent && (
                <>
                  {' '}
                  <span className='text-[#00a8f1]'>{content.accent}</span>
                </>
              )}
            </h2>
          </div>
        </div>
      </ScrollReveal>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {content.items.map((course, index) => (
          <ScrollReveal
            key={`${course.title}-${course.path ?? index}`}
            instant={instant}
            transitionDelay={index * CARD_STAGGER_S}
            className='h-full'
          >
            <div className="group relative h-full overflow-hidden rounded-[4px_28px_4px_28px] border-2 border-[#e5e7f0] bg-white px-7.5 pb-8 pt-13.5 transition-all duration-400 hover:-translate-y-1 hover:bg-[#fbfcff] before:absolute before:top-0 before:left-0 before:right-0 before:h-2.5 before:origin-left before:scale-x-0 before:bg-[#00a8f1] before:content-[''] before:transition-transform before:duration-500 hover:before:scale-x-100 after:absolute after:bottom-0 after:left-0 after:top-7.5 after:w-2.5 after:origin-top after:scale-y-0 after:bg-[#00a8f1] after:content-[''] after:transition-transform after:duration-500 hover:after:scale-y-100 rtl:rounded-[28px_4px_28px_4px] rtl:before:origin-right rtl:before:left-auto rtl:before:right-7.5 rtl:after:left-auto rtl:after:right-0">
              <div
                aria-hidden='true'
                className='pointer-events-none absolute left-0 top-0 z-2 h-7.5 w-7.5 rtl:left-auto rtl:right-0 rtl:transform-[scaleX(-1)]'
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`,
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <div className='mb-4.5 flex items-center gap-3.5'>
                <div className='flex size-13.5 shrink-0 items-center justify-center rounded-[14px_4px_14px_4px] border-2 border-[#e5e7f0] bg-[#fbfcff] group-hover:border-[#00a8f1]'>
                  {getUtilityIconByKey(course.iconKey)}
                </div>
                <span
                  className={`rounded-full border-2 px-3 py-1.25 text-[11px] font-bold uppercase tracking-[0.5px] ${index === 2 ? 'border-transparent bg-[rgba(217,116,60,0.14)] text-[#a65528]' : 'border-[#00a8f1] bg-white text-[#00a8f1]'}`}
                >
                  {course.meta}
                </span>
              </div>
              <div className='mb-2.5 min-h-11.5 text-[18px] font-bold leading-[1.3] tracking-[-0.3px] text-[#1e2364]'>
                {course.title}
              </div>
              <div className='mb-5 min-h-16 text-[13.5px] leading-[1.6] text-[#6b7196]'>
                {course.detail}
              </div>
              <div className='flex items-center justify-between border-t-2 border-[#e5e7f0] pt-4'>
                <div className='flex items-center gap-1.5 text-[13px] font-bold text-[#1e2364]'>
                  <StarIcon />
                  {course.ratingValue}
                  <span className='font-medium text-[#6b7196]'>
                    ({course.ratingCount})
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </>
  );
}
