import type { Dictionary } from '@/locales/types';

interface Props {
  content: Dictionary['b2b']['why'];
}

const icons = [BulkIcon, ReportsIcon, ShieldIcon, RefreshIcon];

export function B2BWhySection({ content }: Props) {
  return (
    <section id='why' className='bg-[#eeeeef] px-4 py-24 sm:px-7 sm:py-[150px]'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='mx-auto mb-14 max-w-[760px] text-center'>
          <h2 className='text-[clamp(30px,4.2vw,52px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
            {content.titleLead}{' '}
            <em className='font-normal italic text-[#1e2364]/55'>
              {content.titleAccent}
            </em>
          </h2>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {content.items.map((item, index) => {
            const Icon = icons[index] ?? BulkIcon;
            return (
              <article
                key={item.title}
                className='grid grid-cols-[auto_1fr] grid-rows-[44px_auto] items-center gap-x-3.5 gap-y-3.5 overflow-hidden rounded-[28px] border-2 border-[#e5e7f0] bg-white px-7 pb-6 pt-5'
              >
                <span
                  aria-hidden='true'
                  className='row-start-1 inline-flex items-center justify-start text-[#00a8f1]'
                >
                  <Icon />
                </span>
                <h3 className='row-start-1 self-center text-[14.5px] font-extrabold leading-tight tracking-[-0.2px] text-[#1e2364]'>
                  {item.title}
                </h3>
                <p className='col-span-2 row-start-2 text-[13.5px] leading-[1.65] text-[#6b7196]'>
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BulkIcon() {
  return (
    <svg
      width='28'
      height='28'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M9 11V6a3 3 0 0 1 6 0v5' />
      <path d='M5 11h14l-1 9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z' />
      <line x1='12' y1='15' x2='12' y2='18' />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg
      width='28'
      height='28'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
      <polyline points='14 2 14 8 20 8' />
      <line x1='12' y1='18' x2='12' y2='12' />
      <polyline points='9 15 12 18 15 15' />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width='28'
      height='28'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
      <polyline points='9 12 11 14 15 10' />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width='28'
      height='28'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <polyline points='23 4 23 10 17 10' />
      <polyline points='1 20 1 14 7 14' />
      <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
    </svg>
  );
}
