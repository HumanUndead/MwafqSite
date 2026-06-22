import { cn } from '@/shared/lib/cn';
import type { Dictionary } from '@/locales/types';

interface Props {
  content: Dictionary['b2b']['services'];
}

export function B2BServicesSection({ content }: Props) {
  const items = content.items.slice(0, 3);

  return (
    <section
      id='services'
      className='bg-[#eeeeef] px-4 pb-12 sm:px-7 sm:pb-20'
    >
      <div className='mx-auto max-w-[1320px]'>
        <div className='mx-auto mb-14 max-w-[760px] text-center'>
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

        <div className='flex flex-col gap-4'>
          {items.map((item, index) => (
            <article
              key={item.title}
              className={cn(
                'relative w-full overflow-hidden rounded-[22px]',
                'bg-gradient-to-br from-[#1e2364] to-[#0d1540]',
                'px-8 py-8 sm:px-10 sm:py-10'
              )}
            >
              <div
                aria-hidden='true'
                className='absolute start-0 top-0 h-[3px] w-full bg-gradient-to-r from-[#00a8f1] to-[#00a8f1]/0'
              />

              <div
                aria-hidden='true'
                className='pointer-events-none absolute -start-16 -top-16 h-[320px] w-[320px] rounded-full bg-[#00a8f1]/10 blur-[70px]'
              />

              <span
                aria-hidden='true'
                className='pointer-events-none absolute bottom-0 end-4 select-none text-[clamp(120px,18vw,240px)] font-light italic leading-none tracking-[-4px] text-[#00a8f1]/[0.07]'
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className='relative z-10'>
                <h3 className='mb-3 text-[clamp(20px,2.6vw,32px)] font-extrabold leading-tight tracking-[-0.5px] text-white'>
                  {item.title}
                </h3>
                <p className='max-w-[720px] text-[15px] leading-[1.7] text-white/65 sm:text-[16px]'>
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
