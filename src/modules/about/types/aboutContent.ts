import type { HomeCompaniesContent } from '@/modules/home/home.types';

export interface AboutMetaContent {
  title: string;
  description: string;
}

export interface AboutHeroContent {
  headingTop: string;
  headingMidLead: string;
  headingMidAccent: string;
  leadLabel: string;
  lead: string;
  imageAlt: string;
}

export interface AboutStoryContent {
  title: string;
  body: string;
}

export interface AboutMissionVisionBlockContent {
  label: string;
  headline: string;
  body: string;
}

export interface AboutMvContent {
  mission: AboutMissionVisionBlockContent;
  vision: AboutMissionVisionBlockContent;
}

export interface AboutListItemContent {
  title: string;
  body: string;
}

export interface AboutSectionWithItemsContent {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  items: AboutListItemContent[];
}

export interface AboutWhyContent {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  body: string;
  items: AboutListItemContent[];
}

export interface AboutValueItemContent {
  key: string;
  title: string;
  body: string;
}

export interface AboutValuesContent {
  eyebrow: string;
  items: AboutValueItemContent[];
}

export interface AboutMilestoneItemContent {
  year: string;
  title: string;
  body: string;
}

export interface AboutMilestonesContent {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  items: AboutMilestoneItemContent[];
}

export interface AboutB2bSnippetContent {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  body: string;
  cta: string;
  points: string[];
}

export interface AboutFinalCtaContent {
  titleLead: string;
  titleAccent: string;
  body: string;
  primary: string;
  secondary: string;
}

export interface AboutPageContent {
  meta: AboutMetaContent;
  hero: AboutHeroContent;
  story: AboutStoryContent;
  mv: AboutMvContent;
  what: AboutSectionWithItemsContent;
  why: AboutWhyContent;
  values: AboutValuesContent;
  how: AboutSectionWithItemsContent;
  companies: HomeCompaniesContent;
  milestones: AboutMilestonesContent;
  b2b: AboutB2bSnippetContent;
  finalCta: AboutFinalCtaContent;
}
