import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { cn } from '@/shared/lib/cn';
import type { RegisterPageContent } from '../registerPage.types';

interface AuthSplitShellProps {
  locale: Locale;
  title: string;
  subtitle?: string;
  aside?: RegisterPageContent;
  children: ReactNode;
  cardClassName?: string;
  centered?: boolean;
  wideForm?: boolean;
}

export function AuthSplitShell({
  locale,
  title,
  subtitle,
  aside,
  children,
  cardClassName,
  centered = false,
  wideForm = false,
}: AuthSplitShellProps) {
  const isArabic = locale === 'ar';

  return (
    <section className='relative overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-16 pt-[132px] md:px-7 md:pb-24 md:pt-[190px]'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle,_#e5e7f0_1.2px,_transparent_1.2px)] [background-size:24px_24px] [mask-image:radial-gradient(circle_at_center,_black,_transparent_76%)]'
      />

      <div
        className={cn(
          'relative z-10 mx-auto flex max-w-[1320px] items-start justify-center gap-10 max-[1100px]:flex-col max-[1100px]:items-center',
          centered && 'max-w-[520px]'
        )}
      >
        {!centered && aside ? (
          <div className='max-w-[480px] flex-1 max-[880px]:hidden'>
            <div className='max-w-[480px] pt-2'>
              <h1 className='text-[clamp(36px,4vw,58px)] font-extrabold leading-[0.98] tracking-[-0.06em] text-[#1e2364]'>
                <span className='block'>{aside.titleLead}</span>
                <span className='mt-1 block font-normal italic text-[#7f84b0]'>
                  {aside.titleAccent}
                </span>
              </h1>

              <p className='mt-5 max-w-[420px] text-[15.5px] leading-7 text-[#6b7196]'>
                {aside.body}
              </p>

              <ol className='relative mt-9 space-y-2 before:absolute before:bottom-4 before:start-[14px] before:top-4 before:w-0.5 before:bg-[#1e2364]/15'>
                {aside.steps.map((step, index) => (
                  <li
                    key={`${step.title}-${index}`}
                    className='relative flex items-start gap-4 py-1 pb-5'
                  >
                    <span className='relative z-10 flex size-[30px] items-center justify-center rounded-full border-2 border-[#1e2364] bg-white text-[13px] font-extrabold text-[#1e2364]'>
                      {index + 1}
                    </span>
                    <div className='pt-0.5'>
                      <strong className='block text-[15.5px] font-extrabold leading-5 text-[#1e2364]'>
                        {step.title}
                      </strong>
                      <span className='mt-1 block text-[13px] leading-5 text-[#6b7196]'>
                        {step.body}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              {aside.stats.length > 0 ? (
                <div className='mt-9 grid max-w-[560px] grid-cols-3 gap-6 border-t-2 border-[#e5e7f0] pt-9 max-[640px]:grid-cols-2'>
                  {aside.stats.map((stat) => (
                    <div key={`${stat.value}-${stat.label}`}>
                      <strong className='text-[30px] font-extrabold leading-none tracking-[-0.05em] text-[#1e2364]'>
                        {stat.value}
                      </strong>
                      <span className='mt-2 block text-[12.5px] text-[#6b7196]'>
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={cn('w-full flex-none', wideForm ? 'max-w-190' : 'max-w-115')}>
          <div
            className={cn(
              'rounded-[28px] border-2 border-[#1e2364] bg-white px-5 py-7 shadow-[0_24px_80px_rgba(30,35,100,0.08)] sm:px-7 sm:py-9',
              cardClassName
            )}
          >
            <header className='mb-7 text-center'>
              <h2 className='text-[30px] font-extrabold tracking-[-0.05em] text-[#1e2364] sm:text-[34px]'>
                {title}
              </h2>
              {subtitle ? (
                <p className='mx-auto mt-3 max-w-[360px] text-sm leading-6 text-[#6b7196]'>
                  {subtitle}
                </p>
              ) : null}
            </header>

            <div dir={isArabic ? 'rtl' : 'ltr'}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
