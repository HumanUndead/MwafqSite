import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import type { AboutB2bSnippetContent } from '@/modules/about/types/aboutContent';
import { ROUTES } from '@/shared/constants/routes';
import { Eyebrow } from '@/modules/home/components/Eyebrow';

interface Props {
  locale: Locale;
  content: AboutB2bSnippetContent;
}

export function AboutB2BSection({ locale, content }: Props) {
  return (
    <section className='relative overflow-hidden border-y-2 border-[#e5e7f0] bg-[#1e2364] px-4 py-12 text-white sm:px-7 sm:py-16'>
      <div className='relative z-2 mx-auto max-w-[1320px]'>
        <div className='grid items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-[50px]'>
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className='mb-5 text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-white'>
              {content.titleLead}{' '}
              <em className='font-normal italic text-[#00a8f1]/95'>
                {content.titleAccent}
              </em>
            </h2>
            <p className='mb-7 max-w-[520px] text-[16px] leading-[1.7] text-white/80'>
              {content.body}
            </p>
            <a
              href={getLocalizedRoute(locale, ROUTES.CONTACT)}
              className='inline-flex items-center justify-center gap-2 rounded-full bg-[#00a8f1] px-[30px] py-4 text-[14.5px] font-semibold text-white transition hover:bg-[#0090d1]'
            >
              {content.cta}
            </a>
          </div>

          <ul className='flex flex-col gap-3.5'>
            {content.points.map((point) => (
              <li
                key={point}
                className='flex items-start gap-3 text-[15px] font-medium leading-[1.55] text-white/92'
              >
                <span
                  aria-hidden='true'
                  className='mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#00a8f1]'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='white'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-[10px] w-[10px]'
                    aria-hidden='true'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
