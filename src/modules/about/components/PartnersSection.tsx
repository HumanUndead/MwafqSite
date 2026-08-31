import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import type { HomeCompaniesContent } from '@/modules/home/home.types';
import { TickerSection } from '@/modules/home/components/TickerSection';

interface Props {
  locale: Locale;
  content: HomeCompaniesContent;
}

const TITLE = {
  en: 'Our Partners in Success',
  ar: 'شركاؤنا في النجاح',
};

export function PartnersSection({ locale, content }: Props) {
  if (content.items.length === 0) {
    return null;
  }

  return (
    <section className='bg-[#eeeeef] px-4 pb-3 pt-2 sm:px-7 sm:pb-5'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='mb-10 flex max-w-[780px] flex-col items-start'>
          <span className='text-[clamp(22px,3.6vw,36px)] font-extrabold leading-none tracking-[-1px] text-[#1e2364]'>
            {isRtl(locale) ? TITLE.ar : TITLE.en}
          </span>
          <svg
            className='mt-4 h-3 w-[45%] min-w-[120px] text-[#00a8f1]'
            viewBox='0 0 200 12'
            fill='none'
            preserveAspectRatio='none'
            aria-hidden='true'
          >
            <path
              d='M2 8.5C40 2.5 90 2 130 6C155 8.5 175 4 198 6.5'
              stroke='currentColor'
              strokeWidth='5'
              strokeLinecap='round'
            />
          </svg>
        </div>
      </div>
      <TickerSection content={content} />
    </section>
  );
}
