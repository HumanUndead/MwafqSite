import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import type { AboutFinalCtaContent } from '@/modules/about/types/aboutContent';
import { ROUTES } from '@/shared/constants/routes';
import { buttonVariants } from '@/shared/lib/variants';

interface Props {
  locale: Locale;
  content: AboutFinalCtaContent;
}

export function AboutFinalCtaSection({ locale, content }: Props) {
  const primaryLabel = content.primary.trim();
  const secondaryLabel = content.secondary.trim();
  const showActions = primaryLabel.length > 0 || secondaryLabel.length > 0;

  return (
    <section className='relative border-t-2 border-[#e5e7f0] bg-white px-7 py-12 text-center sm:py-16'>
      <div className='mx-auto max-w-[760px]'>
        <h2 className='mb-5 text-[clamp(34px,5vw,60px)] font-extrabold leading-[1.05] tracking-[-1.8px] text-[#1e2364]'>
          {content.titleLead}{' '}
          <em className='font-normal italic text-[#00a8f1]/95'>
            {content.titleAccent}
          </em>
        </h2>
        <p className='mx-auto mb-9 max-w-[560px] text-[16.5px] leading-[1.65] text-[#6b7196]'>
          {content.body}
        </p>
        {showActions ? (
          <div className='flex flex-wrap justify-center gap-3.5'>
            {primaryLabel ? (
              <a
                href={getLocalizedRoute(locale, ROUTES.HOME) + '#booking'}
                className={buttonVariants({
                  variant: 'brand',
                  size: 'hero',
                  shape: 'pill',
                })}
              >
                {primaryLabel}
              </a>
            ) : null}
            {secondaryLabel ? (
              <a
                href={getLocalizedRoute(locale, ROUTES.CONTACT)}
                className={buttonVariants({
                  variant: 'brandOutline',
                  size: 'hero',
                  shape: 'pill',
                })}
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
