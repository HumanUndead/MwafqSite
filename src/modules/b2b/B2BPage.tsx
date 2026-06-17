import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import type { B2BPageContent } from '@/modules/b2b/server/b2bContentService';
import { TickerSection } from '@/modules/home/components/TickerSection';
import { B2BHeroSection } from './components/B2BHeroSection';
import { B2BWhySection } from './components/B2BWhySection';
import { B2BServicesSection } from './components/B2BServicesSection';
import { B2BStepsSection } from './components/B2BStepsSection';

interface Props {
  locale: Locale;
  content: B2BPageContent;
}

export function B2BPage({ locale, content }: Props) {
  const rtl = isRtl(locale);

  return (
    <>
      <B2BHeroSection locale={locale} content={content.hero} isRtl={rtl} />
      <TickerSection content={content.companies} />
      <B2BWhySection content={content.why} />
      <B2BServicesSection content={content.services} />
      <B2BStepsSection content={content.steps} />
    </>
  );
}
