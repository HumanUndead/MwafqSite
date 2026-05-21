import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import { TickerSection } from '@/modules/home/components/TickerSection';
import { B2BHeroSection } from './components/B2BHeroSection';
import { B2BWhySection } from './components/B2BWhySection';
import { B2BServicesSection } from './components/B2BServicesSection';
import { B2BStepsSection } from './components/B2BStepsSection';
import { B2BFinalCtaSection } from './components/B2BFinalCtaSection';

interface Props {
  locale: Locale;
  content: Dictionary['b2b'];
}

export function B2BPage({ locale, content }: Props) {
  const rtl = isRtl(locale);

  return (
    <>
      <B2BHeroSection locale={locale} content={content.hero} isRtl={rtl} />
      <TickerSection />
      <B2BWhySection content={content.why} />
      <B2BServicesSection content={content.services} />
      <B2BStepsSection content={content.steps} />
      <B2BFinalCtaSection locale={locale} content={content.finalCta} />
    </>
  );
}
