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
  'right-0 top-[6%] origin-right animate-[floatSoft_5s_ease-in-out_infinite] max-[640px]:scale-[0.78] rtl:right-auto rtl:left-0 rtl:origin-left',
  'left-0 top-[44%] origin-left animate-[floatTilt_6s_ease-in-out_0.3s_infinite] max-[640px]:scale-[0.78] rtl:left-auto rtl:right-0 rtl:origin-right',
  'right-2 bottom-[6%] origin-right animate-[floatSoft_5.5s_ease-in-out_0.6s_infinite] max-[640px]:scale-[0.78] rtl:right-auto rtl:left-2 rtl:origin-left',
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
        className='pointer-events-none absolute inset-0 opacity-55 bg-[radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]'
      />

      <div className='relative z-2 mx-auto max-w-330'>
        <div className='grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-15'>
          <div className='lg:-translate-y-10'>
            <span className='mb-2 inline-block text-[clamp(40px,5.6vw,72px)] font-extrabold leading-none tracking-[-2.2px] text-[#1e2364]'>
              {content.eyebrow}
            </span>
            <h1 className='mb-5 text-[clamp(32px,4.5vw,58px)] font-normal italic leading-[1.05] tracking-[-1.8px] text-[#1e2364]/60'>
              <span className='block'>{content.headingLead}</span>
              <span className='block'>{content.headingAccent}</span>
            </h1>

            <p className='mb-9 max-w-135 text-[clamp(15.5px,1.3vw,17.5px)] leading-[1.65] text-[#6b7196]'>
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

          {/* Right column — dashboard mockup + floating cards */}
          <div className='relative mx-auto w-full max-w-140 lg:h-140'>
            {content.floatingCards.slice(0, 3).map((card, index) => (
              <div
                key={card.title || index}
                className={`absolute z-[5] flex items-center gap-3 rounded-[18px] border-2 border-[#1e2364] bg-white px-3 py-3 pr-5 ${floatingMeta[index]}`}
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

            {/* Dashboard mockup — wrapper centers, inner card animates */}
            <div className='relative z-2 mx-auto w-full lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[90%] lg:-translate-x-1/2 lg:-translate-y-1/2'>
              <div className='animate-[floatRotate_6s_ease-in-out_infinite] overflow-hidden rounded-[18px] border-2 border-[#1e2364] bg-white shadow-[0_20px_60px_rgba(30,35,100,0.12)]'>
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
                        <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f4f4f6] text-[9.5px] font-extrabold text-[#1e2364]'>
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
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.3px] ${statusPillStyles[emp.status] ?? statusPillStyles.wait}`}
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
      </div>
    </section>
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
