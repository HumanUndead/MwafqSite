import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import type { Dictionary } from '@/locales/types';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/lib/variants';

interface Props {
  locale: Locale;
  content: Dictionary['b2b']['hero'];
  isRtl: boolean;
}

const floatingMeta = [
  'end-0 top-[4%] origin-right animate-[floatSoft_5s_ease-in-out_infinite] max-lg:max-w-[88%] max-lg:scale-[0.72] max-lg:origin-top-right lg:top-[6%] rtl:end-auto rtl:start-0 rtl:origin-left lg:rtl:origin-left',
  'start-0 top-[40%] origin-left animate-[floatTilt_6s_ease-in-out_0.3s_infinite] max-lg:max-w-[88%] max-lg:scale-[0.72] max-lg:origin-top-left lg:top-[44%] rtl:start-auto rtl:end-0 rtl:origin-right lg:rtl:origin-right',
  'end-0 bottom-[4%] origin-bottom-right animate-[floatSoft_5.5s_ease-in-out_0.6s_infinite] max-lg:max-w-[88%] max-lg:scale-[0.72] max-lg:origin-bottom-right lg:end-2 lg:bottom-[6%] rtl:end-auto rtl:start-0 rtl:origin-bottom-left lg:rtl:start-auto lg:rtl:end-2 lg:rtl:origin-left',
];

const statusPillStyles: Record<string, string> = {
  done: 'bg-[#00dec9]/15 text-[#00897b]',
  active: 'bg-[#ff9800]/20 text-[#e65100]',
  wait: 'bg-[#78909c]/15 text-[#546e7a]',
};

export function B2BHeroSection({ locale, content, isRtl }: Props) {
  const employees = content.phone.employees.slice(0, 3);
  const statusLabels: Record<string, string> = {
    done: content.phone.statusCompleted,
    active: content.phone.statusInProgress,
    wait: content.phone.statusScheduled,
  };

  return (
    <section
      id='home'
      className='relative overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-6 sm:px-7 sm:pb-10'
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-55 bg-[radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] bg-size-[24px_24px] mask-[radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]'
      />

      <div className='relative z-2 mx-auto max-w-330'>
        <div className='grid min-w-0 grid-cols-1 items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-15'>
          <div className='lg:-translate-y-10'>
            <span className='mb-2 inline-block text-[clamp(40px,5.6vw,72px)] font-extrabold leading-none tracking-[-2.2px] text-[#1e2364]'>
              {content.eyebrow}
            </span>
            <h1 className='mb-5 text-[clamp(32px,4.5vw,58px)] font-normal italic leading-[1.05] tracking-[-1.8px] text-[#1e2364]/60'>
              <span className='block'>{content.headingLead}</span>
              <span className='block'>{content.headingAccent}</span>
            </h1>

            <p className='mb-0 max-w-135 text-[clamp(15.5px,1.3vw,17.5px)] leading-[1.65] text-[#6b7196] lg:mb-9'>
              {content.lead}
            </p>

            <HeroCtas
              locale={locale}
              content={content}
              className='mt-9 hidden flex-wrap gap-3.5 lg:flex'
            />
          </div>

          {/* Right column — dashboard mockup + floating cards */}
          <div className='flex w-full min-w-0 flex-col'>
            <div className='relative mx-auto w-full min-w-0 max-w-[17.5rem] overflow-hidden pb-2 sm:max-w-xs lg:h-140 lg:max-w-140 lg:overflow-visible lg:pb-0'>
              {content.floatingCards.slice(0, 3).map((card, index) => (
                <div
                  key={card.title || index}
                  className={cn(
                    'absolute z-5 flex items-center gap-2 rounded-[14px] border-2 border-[#1e2364] bg-white px-2.5 py-2 pe-4 lg:gap-3 lg:rounded-[18px] lg:px-3 lg:py-3 lg:pe-5',
                    floatingMeta[index]
                  )}
                >
                  <span
                    aria-hidden='true'
                    className='flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fbfcff] text-[#1e2364] [&_svg]:size-4.5 lg:size-11.5 lg:rounded-[12px] lg:[&_svg]:size-5.5'
                  >
                    <FloatingIcon index={index} />
                  </span>
                  <div
                    className={cn(
                      'min-w-0',
                      isRtl ? '-me-2 text-end' : '-ms-2 text-start'
                    )}
                  >
                    <strong className='block truncate text-[12px] font-extrabold leading-tight tracking-[-0.3px] text-[#1e2364] lg:text-[15px]'>
                      {card.title}
                    </strong>
                    <span className='mt-0.5 block truncate text-[10px] text-[#6b7196] lg:text-[11px]'>
                      {card.detail}
                    </span>
                  </div>
                </div>
              ))}

              {/* Dashboard mockup — wrapper centers, inner card animates */}
              <div className='relative z-2 mx-auto w-[88%] max-w-full lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[90%] lg:-translate-x-1/2 lg:-translate-y-1/2'>
                <div className='origin-center max-lg:scale-[0.94] lg:animate-[floatRotate_6s_ease-in-out_infinite] overflow-hidden rounded-[18px] border-2 border-[#1e2364] bg-white shadow-[0_20px_60px_rgba(30,35,100,0.12)]'>
                {/* Browser chrome */}
                <div className='flex items-center gap-2 border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-3 py-2'>
                  <div className='flex gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-[#c0c3d4]' />
                    <span className='h-2 w-2 rounded-full bg-[#c0c3d4]' />
                    <span className='h-2 w-2 rounded-full bg-[#c0c3d4]' />
                  </div>
                </div>

                {/* Dashboard body */}
                <div className='flex flex-col gap-3 p-3'>
                  {/* Tab bar */}
                  <div className='flex gap-0.5 rounded-full bg-[#f4f4f6] p-1'>
                    <span className='flex-1 rounded-full bg-white py-1 text-center text-[10px] font-extrabold text-[#1e2364] shadow-sm'>
                      {content.phone.tabOverview}
                    </span>
                    <span className='flex-1 py-1 text-center text-[10px] font-medium text-[#6b7196]'>
                      {content.phone.tabEmployees}
                    </span>
                    <span className='flex-1 py-1 text-center text-[10px] font-medium text-[#6b7196]'>
                      {content.phone.tabReports}
                    </span>
                  </div>

                  {/* Stat cards */}
                  <div className='grid grid-cols-3 gap-2'>
                    <StatCard
                      value='248'
                      label={content.phone.statEmployeesLabel}
                      numColor='#1565c0'
                      barColor='#1e88e5'
                      bars={[8, 12, 6, 14, 10, 16, 18]}
                    />
                    <StatCard
                      value='96%'
                      label={content.phone.statClearedLabel}
                      numColor='#00897b'
                      barColor='#00dec9'
                      bars={[6, 10, 8, 16, 12, 14, 18]}
                    />
                    <StatCard
                      value='12'
                      label={content.phone.statPendingLabel}
                      numColor='#e65100'
                      barColor='#ff9800'
                      bars={[10, 14, 8, 12, 6, 16, 10]}
                    />
                  </div>

                  {/* Employee rows */}
                  <ul className='flex flex-col gap-2'>
                    {employees.map((emp, idx) => (
                      <li
                        key={`${emp.initials}-${idx}`}
                        className='flex items-center gap-2.5 rounded-[14px] border border-[#e5e7f0] px-3 py-2.5'
                      >
                        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f4f6] text-[9.5px] font-extrabold text-[#1e2364]'>
                          {emp.initials}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <strong className='block truncate text-[11px] font-extrabold leading-tight text-[#1e2364]'>
                            {emp.name}
                          </strong>
                          <span className='block truncate text-[9.5px] text-[#6b7196]'>
                            {emp.type} · {emp.city}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.3px] ${statusPillStyles[emp.status] ?? statusPillStyles.wait}`}
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

            <HeroCtas
              locale={locale}
              content={content}
              compact
              className='relative z-10 mt-4 flex w-full min-w-0 flex-nowrap items-center justify-center gap-1.5 sm:mt-5 sm:gap-2 lg:hidden'
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCtas({
  locale,
  content,
  compact = false,
  className,
}: {
  locale: Locale;
  content: Dictionary['b2b']['hero'];
  compact?: boolean;
  className?: string;
}) {
  const iconSize = compact ? 12 : 16;

  return (
    <div className={className}>
      <a
        href={getLocalizedRoute(locale, ROUTES.REGISTER)}
        className={cn(
          buttonVariants({
            variant: 'brand',
            size: compact ? 'sm' : 'hero',
            shape: 'pill',
          }),
          compact &&
            'h-8 min-w-0 flex-1 gap-1 px-2.5 text-[10px] font-semibold sm:h-9 sm:px-3 sm:text-[11px]'
        )}
      >
        <span className='truncate'>{content.primaryCta}</span>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2.4'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
          className='shrink-0 rtl:-scale-x-100'
        >
          <line x1='5' y1='12' x2='19' y2='12' />
          <polyline points='12 5 19 12 12 19' />
        </svg>
      </a>
      <a
        href={getLocalizedRoute(locale, ROUTES.CONTACT)}
        className={cn(
          buttonVariants({
            variant: 'brandOutline',
            size: compact ? 'sm' : 'hero',
            shape: 'pill',
          }),
          compact &&
            'h-8 min-w-0 flex-1 gap-1 border px-2.5 text-[10px] font-semibold sm:h-9 sm:px-3 sm:text-[11px]'
        )}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
          className='shrink-0'
        >
          <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
        </svg>
        <span className='truncate'>{content.secondaryCta}</span>
      </a>
    </div>
  );
}

function StatCard({
  value,
  label,
  numColor,
  barColor,
  bars,
}: {
  value: string;
  label: string;
  numColor: string;
  barColor: string;
  bars: number[];
}) {
  const max = Math.max(...bars);
  return (
    <div className='rounded-[12px] border border-[#e5e7f0] p-2.5'>
      <p
        className='text-[18px] font-extrabold leading-none'
        style={{ color: numColor }}
      >
        {value}
      </p>
      <p className='mt-0.5 text-[9px] text-[#6b7196]'>{label}</p>
      <svg viewBox='0 0 64 20' className='mt-2 w-full' aria-hidden='true'>
        {bars.map((val, i) => {
          const h = Math.round((val / max) * 20);
          return (
            <rect
              key={i}
              x={i * 9 + 0.5}
              y={20 - h}
              width='7'
              height={h}
              rx='1.5'
              fill={barColor}
            />
          );
        })}
      </svg>
    </div>
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
