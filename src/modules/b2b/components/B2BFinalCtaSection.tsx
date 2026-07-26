import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import type { Dictionary } from '@/locales/types';
import { ROUTES } from '@/shared/constants/routes';

interface Props {
  locale: Locale;
  content: Dictionary['b2b']['finalCta'];
}

export function B2BFinalCtaSection({ locale, content }: Props) {
  return (
    <section
      id='cta'
      className='relative border-y-2 border-[#e5e7f0] bg-[#1e2364] px-6 py-12 text-center sm:px-[60px] sm:py-20'
    >
      <div className='mx-auto max-w-[760px]'>
        <h2 className='mx-auto mb-5 max-w-[720px] text-[clamp(30px,4.6vw,56px)] font-extrabold leading-[1.06] tracking-[-1.6px] text-white'>
          {content.titleLead}
          <em className='ms-2 font-normal italic text-[#00a8f1]/95'>
            {content.titleAccent}
          </em>
        </h2>
        <p className='mx-auto mb-9 max-w-[560px] text-[16.5px] leading-[1.6] text-white/80'>
          {content.body}
        </p>
        <div className='flex flex-wrap justify-center gap-3.5'>
          <a
            href={getLocalizedRoute(locale, ROUTES.REGISTER)}
            className='inline-flex items-center justify-center gap-2 rounded-full bg-[#00a8f1] px-7 py-3 text-[14px] font-semibold text-white transition hover:bg-[#0090d1]'
          >
            {content.primary}
          </a>
          <a
            href={getLocalizedRoute(locale, ROUTES.CONTACT)}
            className='inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-transparent px-7 py-3 text-[14px] font-semibold text-white transition hover:bg-white hover:text-[#1e2364]'
          >
            {content.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
