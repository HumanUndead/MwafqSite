import type { Locale } from '@/i18n/config';
import type { AboutPageContent } from '@/modules/about/types/aboutContent';
import { AboutHero } from './components/AboutHero';
import { StorySection } from './components/StorySection';
import { MissionVisionSection } from './components/MissionVisionSection';
import { WhatWeDoSection } from './components/WhatWeDoSection';
import { ValuesSection } from './components/ValuesSection';
import { PartnersSection } from './components/PartnersSection';
import { MilestonesSection } from './components/MilestonesSection';
import { AboutFinalCtaSection } from './components/AboutFinalCtaSection';

interface Props {
  locale: Locale;
  content: AboutPageContent;
}

export function AboutPage({ locale, content }: Props) {
  return (
    <>
      <AboutHero content={content.hero} />
      <StorySection content={content.story} />
      <MissionVisionSection content={content.mv} />
      <WhatWeDoSection content={content.what} />
      <ValuesSection content={content.values} />
      <PartnersSection locale={locale} content={content.companies} />
      <MilestonesSection content={content.milestones} />
      <AboutFinalCtaSection locale={locale} content={content.finalCta} />
    </>
  );
}
