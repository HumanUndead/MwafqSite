'use client';

import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/components/icons/home';
import { getServiceIconByKey } from '@/shared/components/icons/home/serviceIcons';
import type { Dictionary } from '@/locales/types';
import { fixedHeaderPaddingClass } from '@/shared/lib/scrollToSection';
import type { B2BServiceItem } from './B2BServiceCapabilityCard';

const ACCENTS = ['#00a8f1', '#00a8f1', '#00a8f1'] as const;
const ACCENT_RGBA = ['0,168,241', '0,168,241', '0,168,241'] as const;

interface Props {
  cards: B2BServiceItem[];
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
}

export function B2BServicesMobileView({ cards, content, isRtl }: Props) {
  return (
    <div
      className={cn(
        'lg:hidden bg-[#f4f4f6] px-4 pb-10 sm:px-6',
        fixedHeaderPaddingClass
      )}
    >
      <MobileServicesContent cards={cards} content={content} isRtl={isRtl} />
    </div>
  );
}

/* ─── Shared mobile layout ────────────────────────────────────────── */

interface MobileServicesContentProps {
  cards: B2BServiceItem[];
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
}

function MobileServicesContent({
  cards,
  content,
  isRtl,
}: MobileServicesContentProps) {
  return (
    <div className='relative flex flex-col gap-6'>
      <div className='mb-2 flex items-center gap-2.5'>
        <span className='size-2 rounded-full bg-[#00a8f1]' aria-hidden='true' />
        <span
          className='inline-block h-px w-8 bg-[#00a8f1]/60'
          aria-hidden='true'
        />
        <span className='text-[18px] font-bold uppercase tracking-[0.15em] text-[#1e2364]/65'>
          {content.titleLead} {content.titleAccent}
        </span>
      </div>

      {cards.map((item, index) => (
        <div key={item.title} className='scroll-mt-24'>
          <ServiceChapterPanel item={item} index={index} isRtl={isRtl} />
        </div>
      ))}
    </div>
  );
}

interface ServiceChapterPanelProps {
  item: B2BServiceItem;
  index: number;
  isRtl: boolean;
}

function ServiceChapterPanel({ item, index, isRtl }: ServiceChapterPanelProps) {
  const accent = ACCENTS[index] ?? ACCENTS[0];
  const accentRgba = ACCENT_RGBA[index] ?? ACCENT_RGBA[0];

  return (
    <div
      className={cn(
        'rounded-[20px] border-2 border-[#e5e7f0] bg-white px-4 py-5',
        isRtl && 'text-end'
      )}
    >
      <div className='mb-3 flex items-center gap-3'>
        <div
          className='flex size-11 shrink-0 items-center justify-center rounded-[14px] text-white'
          style={{ background: accent }}
        >
          {getServiceIconByKey(item.iconKey)}
        </div>
        <div>
          <h3
            className={cn(
              'text-[24px] font-extrabold leading-[1.15] tracking-[-0.6px] text-[#1e2364]',
              isRtl && 'text-start'
            )}
          >
            {item.title}
          </h3>
        </div>
      </div>

      <p
        className={cn(
          'mb-3 text-[13px] font-semibold leading-[1.4]',
          isRtl && 'text-start'
        )}
        style={{ color: accent }}
      >
        {item.outcome}
      </p>

      <div
        className='mb-3 h-px w-full opacity-30'
        style={{
          background: `linear-gradient(to right, ${accent}, transparent)`,
        }}
        aria-hidden='true'
      />

      <ul className='flex flex-col gap-2'>
        {item.bullets.map((bullet) => (
          <li key={bullet} className='flex items-start gap-2.5'>
            <span
              className='mt-0.5 flex size-[16px] shrink-0 items-center justify-center rounded-full'
              style={{
                background: `rgba(${accentRgba},0.15)`,
                color: accent,
              }}
              aria-hidden='true'
            >
              <CheckIcon className='size-2' />
            </span>
            <span className='text-[12px] leading-[1.55] text-[#6b7196]'>
              {bullet}
            </span>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          'mt-4 border-t border-[#e5e7f0] pt-3',
          isRtl && 'text-end'
        )}
      ></div>
    </div>
  );
}
