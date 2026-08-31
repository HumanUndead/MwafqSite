import Image from 'next/image';
import { HomeCompaniesContent } from '../home.types';

interface Props {
  content?: HomeCompaniesContent;
}

export function TickerSection({ content }: Props) {
  const items = (content?.items ?? []).filter((item) => item.imageSrc);
  const doubled = [...items, ...items];

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      dir='ltr'
      className='group relative flex h-24 items-center overflow-hidden border-b-2 border-t-2 border-[#e5e7f0] bg-white sm:h-28 mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]'
    >
      <div className='flex w-max animate-[marquee_40s_linear_infinite] items-center group-hover:[animation-play-state:paused]'>
        {doubled.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className='flex h-16 w-36 shrink-0 items-center justify-center px-2 sm:h-20 sm:w-48 sm:px-4'
          >
            <Image
              src={`${item.imageSrc}_200x200.webp`}
              alt={i < items.length ? 'Partner logo' : ''}
              aria-hidden={i >= items.length || undefined}
              width={80}
              height={80}
              sizes='80px'
              className='max-h-full max-w-full object-contain opacity-80 transition-[opacity,transform] duration-300 hover:scale-[1.06] hover:opacity-100'
            />
          </div>
        ))}
      </div>
    </div>
  );
}
