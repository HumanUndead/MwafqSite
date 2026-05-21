import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import type { Dictionary } from '@/locales/types';
import { ROUTES } from '@/shared/constants/routes';
import { buttonVariants } from '@/shared/lib/variants';

interface Props {
  locale: Locale;
  content: Dictionary['b2b']['hero'];
  isRtl: boolean;
}

const floatingMeta = [
  'right-0 top-[6%] animate-[floatSoft_5s_ease-in-out_infinite] rtl:right-auto rtl:left-0',
  'left-0 top-[44%] animate-[floatTilt_6s_ease-in-out_0.3s_infinite] rtl:left-auto rtl:right-0',
  'right-2 bottom-[6%] animate-[floatSoft_5.5s_ease-in-out_0.6s_infinite] rtl:right-auto rtl:left-2',
];

const statusPillStyles: Record<string, string> = {
  done: 'bg-[#00dec9]/15 text-[#00867a]',
  active: 'bg-[#00a8f1]/15 text-[#00a8f1]',
  wait: 'bg-[#6f8fcf]/20 text-[#4a6cb8]',
};

export function B2BHeroSection({ locale, content, isRtl }: Props) {
  const employees = content.phone.employees;
  const statusLabels: Record<string, string> = {
    done: content.phone.statusDone,
    active: content.phone.statusActive,
    wait: content.phone.statusWait,
  };

  return (
    <section
      id='home'
      className='relative overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-20 pt-44 sm:px-7 sm:pt-52 lg:pt-[210px]'
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]'
      />

      <div className='relative z-[2] mx-auto max-w-[1320px]'>
        <div className='grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-[60px]'>
          <div className='lg:-translate-y-10'>
            <span className='mb-2 inline-block text-[clamp(40px,5.6vw,72px)] font-extrabold leading-none tracking-[-2.2px] text-[#1e2364]'>
              {content.eyebrow}
            </span>
            <h1 className='mb-5 text-[clamp(32px,4.5vw,58px)] font-normal italic leading-[1.05] tracking-[-1.8px] text-[#1e2364]/60'>
              <span className='block'>{content.headingLead}</span>
              <span className='block'>{content.headingAccent}</span>
            </h1>

            <p className='mb-9 max-w-[540px] text-[clamp(15.5px,1.3vw,17.5px)] leading-[1.65] text-[#6b7196]'>
              {content.lead}
            </p>

            <div className='flex flex-wrap gap-3.5'>
              <a
                href={getLocalizedRoute(locale, ROUTES.REGISTER)}
                className={buttonVariants({
                  variant: 'brand',
                  size: 'hero',
                  shape: 'pill',
                })}
              >
                {content.primaryCta}
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                  className='rtl:-scale-x-100'
                >
                  <line x1='5' y1='12' x2='19' y2='12' />
                  <polyline points='12 5 19 12 12 19' />
                </svg>
              </a>
              <a
                href={getLocalizedRoute(locale, ROUTES.CONTACT)}
                className={buttonVariants({
                  variant: 'brandOutline',
                  size: 'hero',
                  shape: 'pill',
                })}
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                >
                  <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
                </svg>
                {content.secondaryCta}
              </a>
            </div>
          </div>

          <div className='relative mx-auto h-[560px] w-full max-w-[560px]'>
            {content.floatingCards.slice(0, 3).map((card, index) => (
              <div
                key={card.title || index}
                className={`absolute z-[5] hidden items-center gap-3 rounded-[18px] border-2 border-[#1e2364] bg-white px-3 py-3 pr-5 sm:flex ${floatingMeta[index]}`}
              >
                <span
                  aria-hidden='true'
                  className='flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#fbfcff] text-[#1e2364]'
                >
                  <FloatingIcon index={index} />
                </span>
                <div
                  className={isRtl ? '-mr-2.5 text-right' : '-ml-2.5 text-left'}
                >
                  <strong className='block text-[15px] font-extrabold leading-tight tracking-[-0.3px] text-[#1e2364]'>
                    {card.title}
                  </strong>
                  <span className='mt-0.5 block text-[11px] text-[#6b7196]'>
                    {card.detail}
                  </span>
                </div>
              </div>
            ))}

            <div className='absolute left-1/2 top-1/2 z-[2] h-[540px] w-[260px] animate-[phoneFloat_6s_ease-in-out_infinite] overflow-visible rounded-[42px] border-2 border-[#1e2364] bg-white shadow-[0_20px_60px_rgba(30,35,100,0.12)]'>
              <div className='absolute left-1/2 top-[18px] z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-[14px] bg-[#1e2364]' />

              <div className='absolute inset-[14px] flex flex-col gap-2.5 overflow-hidden rounded-[36px] border-2 border-[#e5e7f0] bg-white px-3 pb-5 pt-9'>
                <div className='mt-3.5 flex items-center justify-between'>
                  <div>
                    <p className='text-[11.5px] font-medium leading-none text-[#6b7196]'>
                      {content.phone.greeting}
                    </p>
                    <p className='mt-1.5 text-[15px] font-extrabold leading-none tracking-[-0.3px] text-[#1e2364]'>
                      {content.phone.name}
                    </p>
                  </div>
                  <div className='relative flex h-9 w-9 items-center justify-center rounded-[11px] border-2 border-[#1e2364] bg-white text-[#1e2364]'>
                    <svg
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-3.5 w-3.5'
                      aria-hidden='true'
                    >
                      <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                      <path d='M13.73 21a2 2 0 0 1-3.46 0' />
                    </svg>
                    <span className='absolute right-[-3px] top-[-3px] h-2 w-2 rounded-full border-2 border-white bg-[#00dec9]' />
                  </div>
                </div>

                <div className='flex items-center gap-3 rounded-[18px] bg-[#1e2364] px-3.5 py-3 text-white'>
                  <span className='flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[11px] bg-white/15'>
                    <svg
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.4'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-4 w-4'
                      aria-hidden='true'
                    >
                      <line x1='12' y1='5' x2='12' y2='19' />
                      <line x1='5' y1='12' x2='19' y2='12' />
                    </svg>
                  </span>
                  <div>
                    <strong className='block text-[12.5px] font-extrabold leading-tight'>
                      {content.phone.bulkTitle}
                    </strong>
                    <span className='text-[10.5px] opacity-80'>
                      {content.phone.bulkSubtitle}
                    </span>
                  </div>
                </div>

                <div className='px-0.5 text-[11.5px] font-extrabold tracking-[-0.1px] text-[#1e2364]'>
                  {content.phone.sectionTitle}
                </div>

                <ul className='flex flex-col gap-2'>
                  {employees.map((emp, idx) => (
                    <li
                      key={`${emp.initials}-${idx}`}
                      className='grid grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-[18px] border-2 border-[#1e2364] bg-white px-2.5 py-2'
                    >
                      <span className='inline-flex h-[30px] w-[30px] items-center justify-center rounded-[11px] bg-[#00dec9]/20 text-[10.5px] font-extrabold text-[#1e2364]'>
                        {emp.initials}
                      </span>
                      <div>
                        <strong className='block text-[11.5px] font-extrabold leading-tight tracking-[-0.1px] text-[#1e2364]'>
                          {emp.name}
                        </strong>
                        <span className='text-[10px] font-medium text-[#6b7196]'>
                          {emp.type}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.2px] ${statusPillStyles[emp.status] ?? statusPillStyles.wait}`}
                      >
                        {statusLabels[emp.status] ?? emp.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <rect x='3' y='4' width='18' height='18' rx='2' />
        <line x1='16' y1='2' x2='16' y2='6' />
        <line x1='8' y1='2' x2='8' y2='6' />
        <line x1='3' y1='10' x2='21' y2='10' />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
        <circle cx='9' cy='7' r='4' />
        <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
        <path d='M16 3.13a4 4 0 0 1 0 7.75' />
      </svg>
    );
  }
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
      <polyline points='14 2 14 8 20 8' />
      <line x1='9' y1='15' x2='15' y2='15' />
    </svg>
  );
}
