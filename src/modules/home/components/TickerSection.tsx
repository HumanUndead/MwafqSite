/* eslint-disable @next/next/no-img-element */

const logos = [
  'logo01',
  'logo03',
  'logo04',
  'logo05',
  'logo06',
  'logo07',
  'logo08',
  'logo09',
  'logo10',
  'logo11',
];

export function TickerSection() {
  return (
    <div className='relative flex h-[100px] items-center overflow-x-clip overflow-y-visible border-b-2 border-t-2 border-[#e5e7f0] bg-white'>
      <div className='flex w-max animate-[marquee_40s_linear_infinite] items-center hover:[animation-play-state:paused]'>
        {[...logos, ...logos].map((logo, i) => (
          <img
            key={i}
            src={`/demo-assets/logos/${logo}.svg`}
            alt={i < logos.length ? 'Partner logo' : ''}
            aria-hidden={i >= logos.length || undefined}
            className='mr-20 block h-[130px] w-auto flex-shrink-0 object-contain opacity-80 grayscale brightness-0 [filter:grayscale(1)_brightness(0)_invert(0.55)] transition-[opacity,transform,filter] duration-300 hover:opacity-100 hover:scale-[1.04] hover:[filter:grayscale(1)_brightness(0)_invert(0.35)]'
          />
        ))}
      </div>
    </div>
  );
}
