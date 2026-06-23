import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/components/icons/home';
import { getServiceIconByKey } from '@/shared/components/icons/home/serviceIcons';
import type { Dictionary } from '@/locales/types';

export type B2BServiceItem = Dictionary['b2b']['services']['items'][number];

const CORNER_SVG = `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`;

interface Props {
  item: B2BServiceItem;
  isRtl: boolean;
  isActive: boolean;
}

export function B2BServiceCapabilityCard({ item, isRtl, isActive }: Props) {
  return (
    <article
      className={cn(
        'group relative flex w-full flex-col overflow-hidden border-2 bg-white text-start transition-all duration-300',
        'rounded-[4px_22px_4px_22px] px-3.5 pb-4 pt-9',
        'sm:px-4 sm:pb-5 sm:pt-10',
        'lg:rounded-[4px_24px_4px_24px] lg:px-5 lg:pb-6 lg:pt-11',
        isRtl && 'rounded-[22px_4px_22px_4px] lg:rounded-[24px_4px_24px_4px]',
        isActive
          ? 'border-[#00a8f1] bg-[#fbfcff] shadow-[0_8px_28px_rgba(0,168,241,0.12)]'
          : 'border-[#e5e7f0]'
      )}
    >
      <div
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute top-0 z-2 h-6 w-6 lg:h-7 lg:w-7',
          isRtl ? 'right-0 scale-x-[-1]' : 'left-0'
        )}
        style={{
          backgroundImage: CORNER_SVG,
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className='mb-3 flex items-center gap-3'>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-[12px_4px_12px_4px] border-2 bg-[#fbfcff] text-[#1e2364] transition-colors duration-300 lg:size-11',
            isActive ? 'border-[#00a8f1] text-[#00a8f1]' : 'border-[#e5e7f0]'
          )}
        >
          {getServiceIconByKey(item.iconKey)}
        </div>
        <h3 className='text-[16px] font-extrabold leading-[1.25] tracking-[-0.3px] text-[#1e2364] lg:text-[17px]'>
          {item.title}
        </h3>
      </div>

      <p className='mb-3 text-[12.5px] font-semibold leading-[1.45] text-[#1e2364] sm:text-[13px] lg:text-[14px]'>
        {item.outcome}
      </p>

      <p className='mb-3.5 text-[11.5px] leading-[1.6] text-[#6b7196] sm:mb-4 sm:text-[12px] lg:text-[13px] lg:leading-[1.65]'>
        {item.body}
      </p>

      <ul className='mb-3.5 flex flex-col gap-1.5 sm:mb-4 sm:gap-2'>
        {item.bullets.map((bullet) => (
          <li
            key={bullet}
            className='flex items-start gap-2 text-[12px] leading-[1.45] text-[#6b7196] lg:text-[13px]'
          >
            <span
              className='mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-[#00a8f1]/30 bg-[#00a8f1]/10 text-[#00a8f1]'
              aria-hidden='true'
            >
              <CheckIcon className='size-2.5' />
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className='mt-auto border-t border-[#e5e7f0]/80 pt-3'>
        <span
          className={cn(
            'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] lg:text-[11px]',
            isActive
              ? 'border-[#00a8f1]/35 bg-[#00a8f1]/10 text-[#00a8f1]'
              : 'border-[#e5e7f0] bg-[#f4f4f6] text-[#6b7196]'
          )}
        >
          {item.trustLabel}
        </span>
      </div>
    </article>
  );
}
