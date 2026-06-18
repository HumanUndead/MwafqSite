import { isRtl, type Locale } from '@/i18n/config';
import type { HomePageContent, HomeSectionKey } from './home.types';
import { AcademySection } from './components/AcademySection';
import { AppShowcaseSection } from './components/AppShowcaseSection';
import { BookingSection } from './components/BookingSection';
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

function renderSection(
  key: HomeSectionKey,
  content: HomePageContent,
  locale: Locale,
  rtl: boolean
) {
  switch (key) {
    case 'hero':
      return (
        <HeroSection
          key={key}
          content={content.hero}
          isRtl={rtl}
          locale={locale}
        />
      );
    case 'companies':
      return <TickerSection key={key} content={content.companies} />;
    case 'services':
      return (
        <ServicesSection key={key} locale={locale} content={content.services} />
      );
    case 'why':
      return <WhySection key={key} content={content.why} isRtl={rtl} />;
    case 'booking':
      return (
        <BookingSection key={key} locale={locale} content={content.booking} />
      );
    case 'steps':
      return <StepsSection key={key} locale={locale} content={content.steps} />;
    case 'app':
      return (
        <AppShowcaseSection key={key} locale={locale} content={content.app} />
      );
    case 'academy':
      return (
        <AcademySection key={key} locale={locale} content={content.academy} />
      );
    case 'stats':
      return <StatsSection key={key} content={content.stats} />;
    case 'testimonial':
      return <TestimonialSection key={key} items={content.testimonial} />;
    default:
      return null;
  }
}

export async function HomePage({ locale }: Props) {
  const content = await getHomePageContent(locale);
  const rtl = isRtl(locale);

  return (
    <main className='bg-[#eeeeef] text-[#1e2364]'>
      {content.sectionOrder.map((key) =>
        renderSection(key, content, locale, rtl)
      )}
    </main>
  );
}
