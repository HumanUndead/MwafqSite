import { cn } from '@/shared/lib/cn';
import type { Dictionary } from '@/locales/types';

interface Props {
  content: Dictionary['b2b']['services'];
}

const serviceIcons = [PreEmpIcon, ResidencyIcon, MunicipalityIcon];

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

        {/* Featured card left (row-span-2) + 2 compact cards stacked right */}
        <div className='grid gap-4 sm:grid-cols-2'>
          {items.map((item, index) => {
            const Icon = serviceIcons[index] ?? serviceIcons[0];
            const isFeatured = index === 0;

            return (
              <article
                key={item.title}
                className={cn(
                  'relative overflow-hidden rounded-[22px]',
                  'bg-gradient-to-br from-[#1e2364] to-[#0d1540]',
                  isFeatured
                    ? 'flex flex-col px-10 pb-12 pt-10 sm:row-span-2'
                    : 'flex items-center gap-5 px-8 py-7',
                )}
              >
                {/* Accent top stripe — featured only */}
                {isFeatured && (
                  <div
                    aria-hidden='true'
                    className='absolute start-0 top-0 h-[3px] w-full bg-gradient-to-r from-[#00a8f1] to-[#00a8f1]/0'
                  />
                )}

                {/* Ambient glow blob */}
                <div
                  aria-hidden='true'
                  className={cn(
                    'pointer-events-none absolute rounded-full bg-[#00a8f1]/10 blur-[70px]',
                    isFeatured
                      ? '-start-16 -top-16 h-[320px] w-[320px]'
                      : '-start-10 -top-10 h-[160px] w-[160px]',
                  )}
                />

                {/* Decorative number */}
                <span
                  aria-hidden='true'
                  className={cn(
                    'pointer-events-none absolute select-none font-light italic leading-none tracking-[-4px]',
                    isFeatured
                      ? 'bottom-0 end-4 text-[240px] text-[#00a8f1]/[0.07]'
                      : 'end-5 top-2 text-[80px] text-[#00a8f1]/10',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                <span
                  aria-hidden='true'
                  className={cn(
                    'relative z-10 shrink-0 inline-flex items-center justify-center rounded-[14px] bg-[#00a8f1]/15 text-[#00a8f1]',
                    isFeatured
                      ? 'mb-7 h-[72px] w-[72px] [&_svg]:h-9 [&_svg]:w-9'
                      : 'mt-0.5 h-[52px] w-[52px] [&_svg]:h-6 [&_svg]:w-6',
                  )}
                >
                  <Icon />
                </span>

                {/* Text */}
                <div className='relative z-10'>
                  <h3
                    className={cn(
                      'font-extrabold leading-tight tracking-[-0.5px] text-white',
                      isFeatured
                        ? 'mb-4 text-[clamp(22px,2.6vw,32px)]'
                        : 'mb-2 text-[18px]',
                    )}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={cn(
                      'leading-[1.7] text-white/65',
                      isFeatured
                        ? 'max-w-[360px] text-[16px]'
                        : 'text-[14px]',
                    )}
                  >
                    {item.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PreEmpIcon() {
  return (
    <svg
      width='38'
      height='38'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
      <circle cx='8.5' cy='7' r='4' />
      <line x1='20' y1='8' x2='20' y2='14' />
      <line x1='23' y1='11' x2='17' y2='11' />
    </svg>
  );
}

function ResidencyIcon() {
  return (
    <svg
      width='38'
      height='38'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect x='3' y='4' width='18' height='16' rx='2' />
      <circle cx='9' cy='11' r='2.5' />
      <line x1='14' y1='10' x2='18' y2='10' />
      <line x1='14' y1='14' x2='18' y2='14' />
    </svg>
  );
}

function MunicipalityIcon() {
  return (
    <svg
      width='38'
      height='38'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M3 21h18' />
      <path d='M5 21V9l7-5 7 5v12' />
      <line x1='9' y1='21' x2='9' y2='13' />
      <line x1='15' y1='21' x2='15' y2='13' />
      <line x1='12' y1='9' x2='12' y2='9' />
    </svg>
  );
}
