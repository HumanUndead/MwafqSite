import type { Locale } from '@/i18n/config';
import type { HomeBusinessContent } from '../home.types';
import { Eyebrow } from './Eyebrow';
import { HomeActionLinks } from './HomeActionLinks';

interface Props {
  locale: Locale;
  content: HomeBusinessContent;
}

function getStatusClassName(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes('complete')) {
    return 'border-transparent bg-[rgba(0,222,201,0.14)] text-[#00867a]';
  }

  if (normalized.includes('progress')) {
    return 'border-transparent bg-[rgba(217,116,60,0.14)] text-[#a65528]';
  }

  return 'border-transparent bg-[rgba(111,143,207,0.16)] text-[#4a6cb8]';
}

export function B2BSection({ locale, content }: Props) {
  return (
    <section
      id='b2b'
      className='relative overflow-hidden border-t-2 border-[#e5e7f0] px-4 py-8 md:py-14 text-white md:px-7'
      style={{
        background:
          'radial-gradient(circle at 80% 25%, rgba(0,168,241,0.42), transparent 45%), radial-gradient(circle at 18% 78%, rgba(116,47,136,0.45), transparent 45%), radial-gradient(circle at 50% 60%, rgba(35,53,103,0.25), transparent 50%), #1e2364',
      }}
    >
      <div
        className='pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1.2px,transparent_1.2px)] [background-size:24px_24px]'
        aria-hidden='true'
      />
      <div className='relative z-10 mx-auto max-w-[1320px]'>
        <div className='grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20'>
          <div>
            <Eyebrow dark>{content.eyebrow}</Eyebrow>
            <h2 className='mb-7 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-white'>
              {content.title}
              {content.accent ? (
                <>
                  <br />
                  <span className='font-normal italic text-white/55'>
                    {content.accent}
                  </span>
                </>
              ) : null}
            </h2>
            <p className='mb-7 text-[16px] leading-[1.65] text-white/82'>
              {content.body}
            </p>
            <ul className='mb-8 flex flex-col gap-3.5'>
              {content.points.map((point) => (
                <li
                  key={point}
                  className='flex items-center gap-3.5 text-[15.5px] text-white/92'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-4 w-4 flex-shrink-0 text-[#00dec9]'
                    aria-hidden='true'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
            <HomeActionLinks
              locale={locale}
              primary={content.primaryAction}
              secondary={content.secondaryAction}
              primaryVariant='brand'
              secondaryVariant='brandOutline'
              primaryClassName='inline-flex items-center gap-2 rounded-full bg-[#00a8f1] px-[30px] py-4 text-[14.5px] font-semibold text-white transition hover:bg-[#0090d1]'
              secondaryClassName='inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-transparent px-[30px] py-4 text-[14.5px] font-semibold text-white transition hover:border-white/60'
            />
          </div>

          <div className='rounded-[32px_4px_32px_4px] border-2 border-[#e5e7f0] bg-white p-[30px] text-[#1e2364]'>
            <div className='mb-[22px] w-fit rounded-full bg-[#f2f2f2] p-[5px]'>
              {content.tabs.map((tab, index) => (
                <button
                  key={`${tab}-${index}`}
                  type='button'
                  className={`rounded-full px-4 py-2 text-[12px] font-semibold ${index === 0 ? 'bg-white text-[#1e2364]' : 'bg-transparent text-[#6b7196]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className='mb-[22px] grid grid-cols-3 gap-2 sm:gap-3.5'>
              {content.metrics.map((metric, index) => (
                <div
                  key={`${metric.label}-${index}`}
                  className='rounded-[16px_4px_16px_4px] border-2 border-[#e5e7f0] bg-white p-[18px]'
                >
                  <div
                    className={`text-[26px] font-extrabold leading-none tracking-[-1px] ${index === 0 ? 'text-[#1e2364]' : index === 1 ? 'text-[#00dec9]' : 'text-[#d9743c]'}`}
                  >
                    {metric.value}
                  </div>
                  <div className='mt-1.5 text-[12px] text-[#6b7196]'>
                    {metric.label}
                  </div>
                  <div className='mt-2.5 flex h-[30px] items-end gap-[3px]'>
                    {[30, 55, 40, 80, 60, 90, 70].map((height, barIndex) => (
                      <div
                        key={barIndex}
                        className='flex-1 rounded-t-[3px]'
                        style={{
                          height: `${height}%`,
                          background:
                            index === 1
                              ? '#00dec9'
                              : index === 2
                                ? '#EBA277'
                                : '#00a8f1',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {content.employees.map((employee) => (
              <div
                key={employee.name}
                className='mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#e5e7f0] bg-white px-3.5 py-[11px]'
              >
                <div
                  className='h-[38px] w-[38px] flex-shrink-0 rounded-full bg-[#f2f3f7]'
                  aria-hidden='true'
                />
                <div className='min-w-0 flex-1'>
                  <strong className='block text-[13px] font-bold tracking-[-0.2px] text-[#1e2364]'>
                    {employee.name}
                  </strong>
                  <span className='text-[11px] text-[#6b7196]'>
                    {employee.exam}
                  </span>
                </div>
                <span
                  className={`rounded-full border-2 px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.4px] ${getStatusClassName(employee.status)}`}
                >
                  {employee.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
