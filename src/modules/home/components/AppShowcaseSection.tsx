import type { Locale } from '@/i18n/config';
import type { HomeAppContent } from '../home.types';
import { CmsLink } from './CmsLink';
import { Eyebrow } from './Eyebrow';
import { CheckIcon, getUtilityIconByKey } from './Icons';

interface Props {
  locale: Locale;
  content: HomeAppContent;
}

export function AppShowcaseSection({ locale, content }: Props) {
  return (
    <section
      id='app'
      className='sticky top-[-100px] flex min-h-screen items-center border-t-2 border-[#e5e7f0] bg-[#eeeeef] pb-30'
    >
      <div
        className='pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:26px_26px] opacity-55 [mask-image:radial-gradient(circle_at_70%_50%,#000_0%,transparent_70%)]'
        aria-hidden='true'
      />
      <div className='relative z-10 mx-auto w-full max-w-[1320px] px-4 py-16 md:px-7 lg:py-30'>
        <div className='grid items-center gap-[60px] lg:grid-cols-[1.1fr_1fr]'>
          <div className='relative hidden h-150 overflow-hidden rounded-[32px] perspective-[1500px] lg:block'>
            <div
              className='absolute left-1/2 top-1/2 h-[560px] w-[380px] [transform-style:preserve-3d] animate-[stackShowcase_9s_ease-in-out_infinite]'
              id='phones'
            >
              <div className='device-card absolute -left-10 bottom-[-40px] right-20 top-[140px] overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-[#1e2364] p-[30px] text-white animate-[cardFloat1_5s_ease-in-out_infinite]'>
                <div className='mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-white/85'>
                  {content.scheduleCard.label}
                </div>
                <div className='mb-[18px] text-[20px] font-extrabold tracking-[-0.4px]'>
                  {content.scheduleCard.detail}
                </div>
                <div className='flex items-center gap-2.5 rounded-[14px] border-2 border-white bg-white p-3.5'>
                  <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#1e2364] font-extrabold text-white'>
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
                <div className='mb-[18px] text-[20px] font-extrabold tracking-[-0.4px]'>
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
                        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          index === 0
                            ? 'bg-[#1e2364]'
                            : index === 1
                              ? 'border border-white/40 bg-[#742f88]'
                              : 'bg-[#f5b400]'
                        }`}
                        aria-hidden='true'
                      />
                      {statusLabel.trim()}
                    </div>
                  ))}
              </div>

              <div className='device-card absolute bottom-5 left-[60px] right-[-40px] top-[60px] overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-white p-[26px] animate-[cardFloat3_6s_ease-in-out_infinite]'>
                <div className='mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b7196]'>
                  {content.reportsCard.label}
                </div>
                <div className='mb-[18px] text-[20px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
                  {content.reportsCard.status}
                </div>
                {content.reportsCard.items.map((report, index) => (
                  <div
                    key={`${report.title}-${index}`}
                    className='mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#e5e7f0] bg-white px-3.5 py-3'
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-white ${index === 0 ? 'bg-[#1e2364]' : 'bg-[#742f88]'}`}
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

          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className='mb-7 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]'>
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
            <p className='text-[16px] leading-[1.65] text-[#6b7196]'>
              {content.body}
            </p>
            <div className='mt-7 flex flex-col gap-3.5'>
              {content.points.map((point) => (
                <div
                  key={point.title}
                  className='flex items-center gap-3.5 rounded-[18px] border-2 border-[#e5e7f0] bg-white px-[22px] py-[18px] transition-[border-color,transform] duration-300 hover:translate-x-[3px] hover:border-[#1e2364]'
                >
                  <div className='flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[#00dec9] bg-[rgba(0,222,201,0.10)] text-[#007a6e]'>
                    <CheckIcon />
                  </div>
                  <div>
                    <strong className='block text-[15.5px] font-bold tracking-[-0.2px] text-[#1e2364]'>
                      {point.title}
                    </strong>
                    <span className='text-[13.5px] text-[#6b7196]'>
                      {point.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-[30px] flex flex-wrap gap-3.5'>
              {content.downloadLinks.map((link) => (
                <CmsLink
                  key={`${link.label}-${link.path ?? 'no-path'}`}
                  locale={locale}
                  href={link.path}
                  className={`inline-flex items-center gap-2 rounded-full px-[30px] py-4 text-[15px] font-semibold ${
                    link.iconKey === 'icon-apple'
                      ? 'bg-[#1e2364] text-white'
                      : 'border-2 border-[#1e2364] bg-white text-[#1e2364]'
                  }`}
                >
                  {getUtilityIconByKey(link.iconKey)}
                  {link.label}
                </CmsLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
