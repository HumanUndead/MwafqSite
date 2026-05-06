import { GetLocale, getTranslations } from '@/i18n/server'
import { WhySection } from './components/WhySection'
import { StepsSection } from './components/StepsSection'
import { BookingSection } from './components/BookingSection'
import { HeroSection } from './components/HeroSection'
import { TickerSection } from './components/TickerSection'
import { ServicesSection } from './components/ServicesSection'
import { AppShowcaseSection } from './components/AppShowcaseSection'
import { AcademySection } from './components/AcademySection'
import { StatsSection } from './components/StatsSection'
import { B2BSection } from './components/B2BSection'
import { TestimonialSection } from './components/TestimonialSection'
import { CtaSection } from './components/CtaSection'
import { FooterSection } from './components/FooterSection'

export async function HomePage() {
  const locale = await GetLocale()
  const content = await getTranslations('home')
  const isRtl = locale === 'ar'

  return (
    <main className="bg-[#eeeeef] text-[#1e2364]">
      <HeroSection content={content.hero} isRtl={isRtl} />
      <TickerSection />
      <ServicesSection content={content.services} />
      <WhySection />
      <BookingSection />
      <StepsSection />
      <div>
        <AppShowcaseSection content={content.app} />
        <AcademySection content={content.academy} />
        <StatsSection content={content.stats} />
      </div>
      <B2BSection content={content.business} />
      <TestimonialSection content={content.testimonial} />
      <CtaSection content={content.finalCta} />
      <FooterSection content={content.footer} />
    </main>
  )
}
