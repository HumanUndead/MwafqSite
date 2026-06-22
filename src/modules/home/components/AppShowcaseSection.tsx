import type { HomeAppContent } from '../home.types';
import { cn } from '@/shared/lib/cn';
import { Eyebrow } from './Eyebrow';
import { CheckIcon, getUtilityIconByKey } from '@/shared/components/icons/home';

interface Props {
  content: HomeAppContent;
  isRtl: boolean;
}

export function AppShowcaseSection({ content, isRtl }: Props) {
  const compact = !isRtl;

  return (
    <section
      id='app'
      className='relative flex flex-col border-t-2 border-[#e5e7f0] bg-[#eeeeef] lg:min-h-[calc(100vh-104px)]'
    >
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] bg-size-[26px_26px] opacity-55 mask-[radial-gradient(circle_at_70%_50%,#000_0%,transparent_70%)]'
        aria-hidden='true'
      />
      <div
        className={cn(
          'relative z-10 mx-auto flex w-full max-w-330 flex-1 flex-col justify-center px-4 md:px-7',
          compact ? 'py-7 lg:py-8' : 'py-8 lg:py-10'
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]',
            compact ? 'gap-y-5 lg:gap-10' : 'gap-y-6 lg:gap-12'
          )}
        >
          {/* Intro — first on mobile */}
          <div className='min-w-0 lg:col-start-2 lg:row-start-1'>
            <Eyebrow
              className={cn(compact ? 'mb-2.5 lg:mb-3' : 'mb-3 lg:mb-4')}
            >
              {content.eyebrow}
            </Eyebrow>
            <h2
              className={cn(
                'font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]',
                compact
                  ? 'mb-2.5 text-[clamp(25px,3.4vw,46px)] lg:mb-4'
                  : 'mb-4 text-[clamp(30px,4.2vw,52px)] lg:mb-6'
              )}
            >
              {content.title}
              {content.accent && (
                <>
                  {' '}
                  <span className='font-normal italic opacity-55'>
                    {content.accent}
                  </span>
                </>
              )}
            </h2>
            <p
              className={cn(
                'text-[#6b7196]',
                compact
                  ? 'text-[14px] leading-[1.5] lg:text-[15px] lg:leading-[1.55]'
                  : 'text-[16px] leading-[1.65]'
              )}
            >
              {content.body}
            </p>
          </div>

          {/* Phone stack — visible on mobile, left column on desktop */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[32px] perspective-[1500px]',
              'mx-auto h-[min(320px,42vh)] w-full max-w-[340px]',
              'sm:h-[min(380px,48vh)] sm:max-w-[380px]',
              'lg:col-start-1 lg:row-start-1 lg:row-span-3 lg:mx-0 lg:h-140 lg:max-w-none lg:max-h-[calc(100vh-220px)]'
            )}
          >
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='origin-center scale-[0.52] sm:scale-[0.62] lg:scale-100'>
                <div className='relative h-[min(500px,calc(100vh-240px))] w-95'>
                  <div
                    className='absolute left-1/2 top-1/2 h-[min(500px,calc(100vh-240px))] w-95 transform-3d animate-[stackShowcase_9s_ease-in-out_infinite]'
                    id='phones'
                  >
                    <div className='device-card absolute -left-10 -bottom-10 right-20 top-35 overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-[#1e2364] p-7.5 text-white animate-[cardFloat1_5s_ease-in-out_infinite]'>
                      <div className='mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-white/85'>
                        {content.scheduleCard.label}
                      </div>
                      <div className='mb-4.5 text-[20px] font-extrabold tracking-[-0.4px]'>
                        {content.scheduleCard.detail}
                      </div>
                      <div className='flex items-center gap-2.5 rounded-[14px] border-2 border-white bg-white p-3.5'>
                        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#1e2364] font-extrabold text-white'>
                          {content.scheduleCard.appointment.value}
                        </div>
                        <div>
                          <strong className='block text-[14px] font-extrabold text-[#1e2364]'>
                            {content.scheduleCard.appointment.location}
                          </strong>
                          <span className='text-[12px] text-[#6b7196]'>
                            {content.scheduleCard.appointment.detail}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='device-card absolute bottom-20 left-0 right-0 top-0 overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-[#742f88] p-6 text-white animate-[cardFloat2_7s_ease-in-out_infinite]'>
                      <div className='mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-white/85'>
                        {content.statusCard.label}
                      </div>
                      <div className='mb-4.5 text-[20px] font-extrabold tracking-[-0.4px]'>
                        {content.statusCard.status}
                      </div>
                      {content.statusCard.detail
                        .split('·')
                        .map((statusLabel, index) => (
                          <div
                            key={`${statusLabel}-${index}`}
                            className='mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#1e2364] bg-white px-3.5 py-3 text-[13px] font-bold text-[#1e2364]'
                          >
                            <span
                              className={cn(
                                'size-2.5 shrink-0 rounded-full',
                                index === 0 && 'bg-[#1e2364]',
                                index === 1 && 'border border-white/40 bg-[#742f88]',
                                index >= 2 && 'bg-[#f5b400]'
                              )}
                              aria-hidden='true'
                            />
                            {statusLabel.trim()}
                          </div>
                        ))}
                    </div>

                    <div className='device-card absolute bottom-5 left-15 -right-10 top-15 overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-white p-6.5 animate-[cardFloat3_6s_ease-in-out_infinite]'>
                      <div className='mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b7196]'>
                        {content.reportsCard.label}
                      </div>
                      <div className='mb-4.5 text-[20px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
                        {content.reportsCard.status}
                      </div>
                      {content.reportsCard.items.map((report, index) => (
                        <div
                          key={`${report.title}-${index}`}
                          className='mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#e5e7f0] bg-white px-3.5 py-3'
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-white ${index === 0 ? 'bg-[#1e2364]' : 'bg-[#742f88]'}`}
                            aria-hidden='true'
                          >
                            {getUtilityIconByKey(report.iconKey) ?? <CheckIcon />}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <strong className='block text-[13px] font-extrabold text-[#1e2364]'>
                              {report.title}
                            </strong>
                            <span className='text-[11px] text-[#6b7196]'>
                              {report.detail}
                            </span>
                          </div>
                          <span className='rounded-full bg-[#00a8f1] px-2.5 py-1 text-[10.5px] font-extrabold text-white'>
                            {report.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'flex flex-col lg:col-start-2 lg:row-start-2',
              compact
                ? 'gap-2 lg:gap-2'
                : 'gap-2.5 lg:gap-3'
            )}
          >
            {content.points.map((point) => (
              <div
                key={point.title}
                className={cn(
                  'flex items-center gap-3 rounded-[18px] border-2 border-[#e5e7f0] bg-white transition-[border-color,transform] duration-300 hover:translate-x-0.75 hover:border-[#1e2364]',
                  compact
                    ? 'px-3.5 py-2.5 lg:px-4 lg:py-3'
                    : 'px-5 py-3.5 lg:px-5 lg:py-4'
                )}
              >
                <div className='flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[#00dec9] bg-[rgba(0,222,201,0.10)] text-[#007a6e]'>
                  <CheckIcon />
                </div>
                <div className='min-w-0'>
                  <strong
                    className={cn(
                      'block font-bold tracking-[-0.2px] text-[#1e2364]',
                      compact ? 'text-[14px] lg:text-[14.5px]' : 'text-[15.5px]'
                    )}
                  >
                    {point.title}
                  </strong>
                  <span
                    className={cn(
                      'text-[#6b7196]',
                      compact ? 'text-[12px] lg:text-[12.5px]' : 'text-[13.5px]'
                    )}
                  >
                    {point.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Store buttons — extra space below on mobile */}
          <div
            className={cn(
              'flex flex-wrap lg:col-start-2 lg:row-start-3',
              compact
                ? 'mt-8 gap-2 pb-4 lg:mt-5 lg:gap-2.5 lg:pb-0'
                : 'mt-10 gap-3 pb-5 lg:mt-6 lg:pb-0'
            )}
          >
            {content.downloadLinks.map((link) => (
              <span
                key={`${link.label}-${link.path ?? 'no-path'}`}
                aria-disabled='true'
                className={cn(
                  'pointer-events-none inline-flex items-center gap-2 rounded-full font-semibold',
                  compact
                    ? 'px-5 py-2.5 text-[13px] lg:px-5 lg:py-2.5 lg:text-[14px]'
                    : 'px-6 py-3 text-[14px] lg:px-7 lg:py-3.5 lg:text-[15px]',
                  link.iconKey === 'icon-apple'
                    ? 'bg-[#1e2364] text-white'
                    : 'border-2 border-[#1e2364] bg-white text-[#1e2364]'
                )}
              >
                {getUtilityIconByKey(link.iconKey)}
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
