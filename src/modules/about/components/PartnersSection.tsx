import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import type { HomeCompaniesContent } from '@/modules/home/home.types';
import { Eyebrow } from '@/modules/home/components/Eyebrow';
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
    <section className='bg-[#eeeeef] px-4 pb-12 pt-2 sm:px-7 sm:pb-16'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='mb-10 max-w-[780px]'>
          <Eyebrow>{isRtl(locale) ? TITLE.ar : TITLE.en}</Eyebrow>
        </div>
      </div>
      <TickerSection content={content} />
    </section>
  );
}
