import type { Locale } from '@/i18n/config';
import { getTranslations } from '@/i18n/server';
import type { Dictionary } from '@/locales/types';
import type { HomeBusinessContent } from '../home.types';
import { Eyebrow } from './Eyebrow';
import { HomeActionLinks } from './HomeActionLinks';
import { cn } from '@/shared/lib/cn';
import { marketingSectionShellClass } from '@/shared/components/marketing/marketingLayout';

interface Props {
  locale: Locale;
  content: HomeBusinessContent;
}

type LearnerStatus = Dictionary['businessShowcase']['learners'][number]['status'];

function getStatusClassName(status: LearnerStatus) {
  if (status === 'completed') {
    return 'border-transparent bg-[rgba(0,222,201,0.14)] text-[#00867a]';
  }

  if (status === 'inProgress') {
    return 'border-transparent bg-[rgba(217,116,60,0.14)] text-[#a65528]';
  }

  return 'border-transparent bg-[rgba(111,143,207,0.16)] text-[#4a6cb8]';
}

function statusLabel(
  t: Dictionary['businessShowcase'],
  status: LearnerStatus
) {
  if (status === 'completed') return t.statusCompleted;
  if (status === 'inProgress') return t.statusInProgress;
  return t.statusScheduled;
}

export async function B2BSection({ locale, content }: Props) {
  const t = await getTranslations('businessShowcase');
  const featuredCoursePercent = t.featuredCoursePercent.replace(
    '{{percent}}',
    '68'
  );

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
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1.2px,transparent_1.2px)] bg-size-[24px_24px]'
        aria-hidden='true'
      />
      <div className={cn('relative z-10', marketingSectionShellClass)}>
        <div className='grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20'>
          <div className='min-w-0'>
            <Eyebrow dark>{content.eyebrow}</Eyebrow>
            <h2 className='mb-7 text-[clamp(24px,3.2vw,40px)] font-extrabold leading-[1.08] tracking-[-0.1px] text-white sm:tracking-[-1.2px]'>
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
                  className='flex items-start gap-3.5 text-[15.5px] text-white/92'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mt-1 h-4 w-4 shrink-0 text-[#00dec9]'
                    aria-hidden='true'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                  <span className='min-w-0 flex-1'>{point}</span>
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

          <div className='min-w-0 rounded-[24px_4px_24px_4px] border-2 border-[#e5e7f0] bg-white p-5 text-[#1e2364] sm:rounded-[32px_4px_32px_4px] sm:p-7.5'>
            {/* Tab bar */}
            <div className='mb-5.5 flex w-fit max-w-full rounded-full bg-[#f2f2f2] p-1.25'>
              {content.tabs.map((tab, index) => (
                <button
                  key={`${tab}-${index}`}
                  type='button'
                  className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-semibold sm:px-4 ${index === 0 ? 'bg-white text-[#1e2364]' : 'bg-transparent text-[#6b7196]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Featured course with progress bar */}
            <div className='mb-5.5 flex items-center gap-3.5 rounded-[16px_4px_16px_4px] border-2 border-[#e5e7f0] bg-[#fbfcff] p-4'>
              <div
                className='flex size-12 shrink-0 items-center justify-center rounded-[12px_4px_12px_4px] text-white'
                style={{
                  background:
                    'linear-gradient(135deg, #00a8f1 0%, #2f3567 100%)',
                }}
                aria-hidden='true'
              >
                <svg
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='h-5 w-5'
                  aria-hidden='true'
                >
                  <path d='M8 5v14l11-7z' />
                </svg>
              </div>
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <span className='rounded-full bg-[rgba(0,168,241,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.4px] text-[#00a8f1]'>
                    {t.featuredCourseBadge}
                  </span>
                  <span className='text-[11px] font-semibold text-[#6b7196]'>
                    {featuredCoursePercent}
                  </span>
                </div>
                <strong className='block truncate text-[13.5px] font-bold tracking-[-0.2px] text-[#1e2364]'>
                  {t.featuredCourseTitle}
                </strong>
                <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e7f0]'>
                  <div
                    className='h-full rounded-full bg-[#00a8f1]'
                    style={{ width: '68%' }}
                  />
                </div>
              </div>
            </div>

            {/* Metric tiles */}
            <div className='mb-5.5 grid grid-cols-3 gap-2 sm:gap-3.5'>
              {content.metrics.map((metric, index) => (
                <div
                  key={`${metric.label}-${index}`}
                  className='rounded-[16px_4px_16px_4px] border-2 border-[#e5e7f0] bg-white p-3 sm:p-4.5'
                >
                  <div
                    className={`text-[20px] font-extrabold leading-none tracking-[-1px] sm:text-[26px] ${index === 0 ? 'text-[#1e2364]' : index === 1 ? 'text-[#00dec9]' : 'text-[#d9743c]'}`}
                  >
                    {metric.value}
                  </div>
                  <div className='mt-1.5 text-[11px] text-[#6b7196] sm:text-[12px]'>
                    {metric.label}
                  </div>
                  <div className='mt-2.5 flex h-7.5 items-end gap-0.75'>
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

            {/* Learner / course rows */}
            {t.learners.map((learner, index) => (
              <div
                key={learner.name}
                className='mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#e5e7f0] bg-white px-3.5 py-2.75'
              >
                <div
                  className='flex size-9.5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white'
                  style={{
                    background:
                      'linear-gradient(135deg, #00a8f1 0%, #2f3567 100%)',
                  }}
                  aria-hidden='true'
                >
                  {index + 1}
                </div>
                <div className='min-w-0 flex-1'>
                  <strong className='block truncate text-[13px] font-bold tracking-[-0.2px] text-[#1e2364]'>
                    {learner.name}
                  </strong>
                  <span className='block truncate text-[11px] text-[#6b7196]'>
                    {learner.course}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full border-2 px-2.5 py-1.25 text-[10px] font-bold uppercase tracking-[0.4px] ${getStatusClassName(learner.status)}`}
                >
                  {statusLabel(t, learner.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
