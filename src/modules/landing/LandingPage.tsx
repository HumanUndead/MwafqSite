import { HeroSection } from './components/HeroSection'
import { FeaturesSection } from './components/FeaturesSection'
import { TestimonialsSection } from './components/TestimonialsSection'
import { PricingSection } from './components/PricingSection'
import { CtaSection } from './components/CtaSection'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
    </>
  )
}
