import { isRtl, type Locale } from '@/i18n/config';
import { AcademySection } from './components/AcademySection';
import { AppShowcaseSection } from './components/AppShowcaseSection';
import { B2BSection } from './components/B2BSection';
import { BookingSection } from './components/BookingSection';
import { CtaSection } from './components/CtaSection';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { StatsSection } from './components/StatsSection';
import { StepsSection } from './components/StepsSection';
import { TestimonialSection } from './components/TestimonialSection';
import { TickerSection } from './components/TickerSection';
import { WhySection } from './components/WhySection';
import { getHomePageContent } from './server/homeContentService';

interface Props {
  locale: Locale;
}

export async function HomePage({ locale }: Props) {
  const content = await getHomePageContent(locale);
  const rtl = isRtl(locale);

  return (
    <main className='bg-[#eeeeef] text-[#1e2364]'>
      <HeroSection content={content.hero} isRtl={rtl} locale={locale} />
      <TickerSection content={content.companies} />
      <ServicesSection locale={locale} content={content.services} />
      <WhySection content={content.why} isRtl={rtl} />
      <BookingSection locale={locale} content={content.booking} />
      <StepsSection locale={locale} content={content.steps} />
      <div>
        <AppShowcaseSection locale={locale} content={content.app} />
        <AcademySection locale={locale} content={content.academy} />
        <StatsSection content={content.stats} />
      </div>
      <B2BSection locale={locale} content={content.business} />
      <TestimonialSection content={content.testimonial} />
      <CtaSection locale={locale} content={content.finalCta} />
    </main>
  );
}
