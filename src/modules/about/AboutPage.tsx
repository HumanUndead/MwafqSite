import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/locales/types'
import { AboutHero } from './components/AboutHero'
import { StorySection } from './components/StorySection'
import { MissionVisionSection } from './components/MissionVisionSection'
import { AboutStatsSection } from './components/AboutStatsSection'
import { WhatWeDoSection } from './components/WhatWeDoSection'
import { WhyMwafqSection } from './components/WhyMwafqSection'
import { ValuesSection } from './components/ValuesSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import { MilestonesSection } from './components/MilestonesSection'
import { AboutB2BSection } from './components/AboutB2BSection'
import { AboutFinalCtaSection } from './components/AboutFinalCtaSection'

interface Props {
  locale: Locale
  content: Dictionary['about']
}

export function AboutPage({ locale, content }: Props) {
  return (
    <>
      <AboutHero content={content.hero} />
      <StorySection content={content.story} />
      <MissionVisionSection content={content.mv} />
      <AboutStatsSection items={content.stats} />
      <WhatWeDoSection content={content.what} />
      <WhyMwafqSection content={content.why} />
      <ValuesSection content={content.values} />
      <HowItWorksSection content={content.how} />
      <MilestonesSection content={content.milestones} />
      <AboutB2BSection locale={locale} content={content.b2b} />
      <AboutFinalCtaSection locale={locale} content={content.finalCta} />
    </>
  )
}
