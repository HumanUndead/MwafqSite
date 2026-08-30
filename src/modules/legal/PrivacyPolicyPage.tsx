import type { Locale } from '@/i18n/config';
import { marketingAlignedShellClass } from '@/shared/components/marketing';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { privacyPolicyAr } from './content/privacyPolicy.ar';
import { privacyPolicyEn } from './content/privacyPolicy.en';
import { LegalTableView } from './components/LegalTableView';
import type { PrivacyPolicyContent } from './types/legalContent.types';

interface Props {
  locale: Locale;
}

const contentByLocale: Record<Locale, PrivacyPolicyContent> = {
  en: privacyPolicyEn,
  ar: privacyPolicyAr,
};

export function getPrivacyPolicyContent(locale: Locale): PrivacyPolicyContent {
  return contentByLocale[locale] ?? contentByLocale.en;
}

export function PrivacyPolicyPage({ locale }: Props) {
  const content = getPrivacyPolicyContent(locale);

  return (
    <div className='overflow-x-clip px-4 py-10 text-[#1e2364] md:px-7 md:py-16'>
      <div className={marketingAlignedShellClass}>
        <div className='mx-auto grid w-full max-w-[900px] gap-10 lg:max-w-none lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-14'>
          <header className='lg:col-span-2'>
            <ScrollReveal variant='y'>
              <span className='mb-4 inline-block text-[13px] font-bold uppercase tracking-[0.14em] text-[#00a8f1]'>
                {content.eyebrow}
              </span>
              <h1 className='mb-4 text-[clamp(30px,4.2vw,48px)] font-extrabold leading-[1.08] tracking-[-1px]'>
                {content.title}
              </h1>
              <p className='mb-5 max-w-165 text-[15px] leading-[1.65] text-[#6b7196]'>
                {content.intro}
              </p>
              <div className='flex flex-wrap items-center gap-x-6 gap-y-1.5 border-y border-[#e5e7f0] py-3 text-[12.5px] text-[#6b7196]'>
                <span>
                  <strong className='font-semibold text-[#1e2364]'>
                    {content.lastUpdatedLabel}:
                  </strong>{' '}
                  {content.lastUpdated}
                </span>
                <span>{content.version}</span>
              </div>
            </ScrollReveal>
          </header>

          <nav
            aria-label={content.tocTitle}
            className='hidden lg:sticky lg:top-28 lg:block lg:self-start'
          >
            <h2 className='mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7196]'>
              {content.tocTitle}
            </h2>
            <ol className='flex flex-col gap-2 border-s-2 border-[#e5e7f0] ps-3.5'>
              {content.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className='block text-[13px] leading-snug text-[#6b7196] transition-colors hover:text-[#00a8f1]'
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <main className='min-w-0'>
            {content.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className='mb-12 scroll-mt-28 border-t-2 border-[#1e2364] pt-4'
              >
                <h2 className='mb-4 text-[clamp(20px,2.4vw,26px)] font-extrabold tracking-[-0.3px]'>
                  {section.title}
                </h2>

                {section.paragraphs?.map((paragraph, index) => (
                  <p
                    key={index}
                    className='mb-4 max-w-165 text-[14.5px] leading-[1.7] text-[#4a4f78]'
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets ? (
                  <ul className='mb-4 flex max-w-165 flex-col gap-2.5 ps-5 text-[14.5px] leading-[1.6] text-[#4a4f78]'>
                    {section.bullets.map((bullet, index) => (
                      <li key={index} className='list-disc'>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.table ? (
                  <LegalTableView table={section.table} />
                ) : null}

                {section.note ? (
                  <p className='max-w-165 border-s-2 border-[#00a8f1] bg-[#f5f8ff] px-4 py-3 text-[13.5px] leading-[1.6] text-[#4a4f78]'>
                    {section.note}
                  </p>
                ) : null}
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
