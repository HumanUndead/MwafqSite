/* eslint-disable @next/next/no-img-element */

import { HomeCompaniesContent } from '../home.types';

interface Props {
  content?: HomeCompaniesContent;
}

export function TickerSection({ content }: Props) {
  const items = content?.items ?? [];
  const doubled = [...items, ...items];

  return (
    <div className='group relative flex h-17.5 items-center overflow-x-clip overflow-y-visible border-b-2 border-t-2 border-[#e5e7f0] bg-white sm:h-25'>
      <div className='flex w-max animate-[marquee_40s_linear_infinite] items-center group-hover:paused'>
        {doubled.map(
          (item, i) =>
            item.imageSrc && (
              <img
                key={`${item.id}-${i}`}
                src={item.imageSrc + '_200x200.webp'}
                alt={i < items.length ? 'Partner logo' : ''}
                aria-hidden={i >= items.length || undefined}
                className='mr-10 block h-22.5 w-auto shrink-0 object-contain opacity-80 filter-[grayscale(1)_brightness(0)_invert(0.55)] transition-[opacity,transform,filter] duration-300 hover:scale-[1.04] hover:opacity-100 hover:filter-[grayscale(1)_brightness(0)_invert(0.35)] sm:mr-20 sm:h-32.5'
              />
            )
        )}
      </div>
    </div>
  );
}
