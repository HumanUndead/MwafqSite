import dynamic from 'next/dynamic';
import { isRtl, type Locale } from '@/i18n/config';
import type { HomePageContent, HomeSectionKey } from './home.types';
import { AcademySection } from './components/AcademySection';
import { AppShowcaseSection } from './components/AppShowcaseSection';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { StatsSection } from './components/StatsSection';
import { TickerSection } from './components/TickerSection';
import { getHomePageContent } from './server/homeContentService';

const WhySection = dynamic(() =>
  import('./components/WhySection').then((m) => ({ default: m.WhySection }))
);

const BookingSection = dynamic(() =>
  import('./components/BookingSection').then((m) => ({
    default: m.BookingSection,
  }))
);

const StepsSection = dynamic(() =>
  import('./components/StepsSection').then((m) => ({ default: m.StepsSection }))
);

const TestimonialSection = dynamic(() =>
  import('./components/TestimonialSection').then((m) => ({
    default: m.TestimonialSection,
  }))
);

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
      return <AppShowcaseSection key={key} content={content.app} isRtl={rtl} />;
    case 'academy':
      return <AcademySection key={key} content={content.academy} />;
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

  console.log('Booking section content (category 164):', content.booking);
  console.log('Hero section content:', content.hero);
  console.log('Steps section content (ابدأ الحجز CTA, category 165):', content.steps);
  console.log('App section content (category 166):', content.app);
  console.log('Academy section content (category 167):', content.academy);

  return (
    <main className='bg-[#eeeeef] text-[#1e2364]'>
      {content.sectionOrder.map((key) =>
        renderSection(key, content, locale, rtl)
      )}
    </main>
  );
}
