export interface HomeActionContent {
  label: string;
  path: string | null;
}

export interface HomeLinkItemContent {
  label: string;
  path: string | null;
  iconKey?: string | null;
}

export interface HomeImageContent {
  src?: string | null;
  alt?: string | null;
}

export interface HomeHeaderUserMenuContent {
  greeting: string;
  avatarSrc: string | null;
  avatarInitials: string;
  profileLabel: string;
  profilePath: string;
  signOutLabel: string;
}

export interface HomeHeaderContent {
  brandLabel: string;
  brandDescription: string;
  brandPath: string | null;
  brandImageSrc: string | null;
  navLinks: HomeLinkItemContent[];
  primaryAction: HomeActionContent | null;
  signInAction: HomeActionContent | null;
  userMenu: HomeHeaderUserMenuContent | null;
  localeSwitchLabel: string | null;
  businessSignInAction: HomeActionContent | null;
}

export interface HomeHeroStatContent {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
}

export interface HomeHeroPhoneTileContent {
  title: string;
  subtitle: string;
  iconKey?: string | null;
}

export interface HomeFloatingCardContent {
  title: string;
  detail: string;
}

export interface HomeHeroContent {
  badge: string;
  badgeImages: HomeImageContent[];
  titleLead: string;
  titleMiddle: string;
  rotatingWords: string[];
  subtitle: string;
  primaryAction: HomeActionContent;
  secondaryAction: HomeActionContent;
  stats: readonly HomeHeroStatContent[];
  phoneGreeting: string;
  phoneName: string;
  phoneSearchPlaceholder: string;
  servicesTitle: string;
  servicesLink: string;
  phoneTiles: readonly HomeHeroPhoneTileContent[];
  liveBookings: string;
  liveBookingsLabel: string;
  floatingCards: readonly HomeFloatingCardContent[];
}

export interface HomeServiceItemContent {
  title: string;
  description: string;
  path: string | null;
  iconKey?: string | null;
}

export interface HomeServicesContent {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  items: HomeServiceItemContent[];
}

export interface HomeWhyItemContent {
  title: string;
  description: string;
  iconKey?: string | null;
}

export interface HomeWhyContent {
  eyebrow: string;
  title: string;
  items: HomeWhyItemContent[];
}

export interface HomeBookingFieldContent {
  label: string;
  placeholder: string;
}

export interface HomeBookingContent {
  eyebrow: string;
  title: string;
  note: string;
  fields: {
    exam: HomeBookingFieldContent;
    city: HomeBookingFieldContent;
    date: HomeBookingFieldContent;
    search: HomeActionContent;
  };
  examOptions: string[];
}

export interface HomeStepsMetricContent {
  value: string;
  label: string;
}

export interface HomeStepsItemContent {
  title: string;
  body: string;
  meta1: HomeStepsMetricContent;
  meta2: HomeStepsMetricContent;
}

export interface HomeStepsContent {
  eyebrow: string;
  title: string;
  highlight: string;
  cta: HomeActionContent;
  items: HomeStepsItemContent[];
}

export interface HomeAppCardAppointmentContent {
  value: string;
  detail: string;
  location: string;
  iconKey?: string | null;
}

export interface HomeAppCardStatusContent {
  label: string;
  detail: string;
  status: string;
}

export interface HomeAppReportItemContent {
  title: string;
  detail: string;
  badge: string;
  iconKey?: string | null;
}

export interface HomeAppCardReportsContent {
  label: string;
  detail: string;
  status: string;
  items: HomeAppReportItemContent[];
}

export interface HomeAppPointContent {
  title: string;
  detail: string;
}

export interface HomeAppDownloadLinkContent extends HomeActionContent {
  iconKey?: string | null;
}

export interface HomeAppContent {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  scheduleCard: {
    label: string;
    detail: string;
    appointment: HomeAppCardAppointmentContent;
  };
  statusCard: HomeAppCardStatusContent;
  reportsCard: HomeAppCardReportsContent;
  points: HomeAppPointContent[];
  downloadLinks: HomeAppDownloadLinkContent[];
}

export interface HomeAcademyItemContent {
  title: string;
  detail: string;
  meta: string;
  ratingValue: string;
  ratingCount: string;
  path: string | null;
  iconKey?: string | null;
}

export interface HomeAcademyContent {
  eyebrow: string;
  title: string;
  accent: string;
  ctaLabel: string;
  items: HomeAcademyItemContent[];
}

export type HomeStatsItemContent = HomeHeroStatContent;

export interface HomeStatsContent {
  title: string;
  items: HomeStatsItemContent[];
}

export interface HomeBusinessMetricContent {
  value: string;
  label: string;
}

export interface HomeBusinessEmployeeContent {
  name: string;
  exam: string;
  status: string;
}

export interface HomeBusinessContent {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  points: string[];
  tabs: string[];
  metrics: HomeBusinessMetricContent[];
  employees: HomeBusinessEmployeeContent[];
  primaryAction: HomeActionContent;
  secondaryAction: HomeActionContent;
}

export interface HomeTestimonialContent {
  quote: string;
  highlight: string;
  author: string;
  role: string;
}

export interface HomeFinalCtaContent {
  title: string;
  highlight: string;
  body: string;
  primaryAction: HomeActionContent;
  secondaryAction: HomeActionContent;
}

export interface HomeFooterGroupContent {
  title: string;
  links: HomeLinkItemContent[];
}

export interface HomeFooterContent {
  brandLabel: string;
  brandBody: string;
  brandPath: string | null;
  brandImageSrc: string | null;
  newsletterPlaceholder: string;
  newsletterEyebrow: string;
  newsletterAction: string;
  copyrightLabel: string;
  copyrightBody: string;
  pages: HomeFooterGroupContent;
  help: HomeFooterGroupContent;
  contact: HomeFooterGroupContent;
}

export interface HomeCompanyItemContent {
  id: number;
  imageSrc: string | null;
}

export interface HomeCompaniesContent {
  items: HomeCompanyItemContent[];
}

export interface HomePageContent {
  header: HomeHeaderContent;
  hero: HomeHeroContent;
  companies: HomeCompaniesContent;
  services: HomeServicesContent;
  why: HomeWhyContent;
  booking: HomeBookingContent;
  steps: HomeStepsContent;
  app: HomeAppContent;
  academy: HomeAcademyContent;
  stats: HomeStatsContent;
  business: HomeBusinessContent;
  testimonial: HomeTestimonialContent;
  finalCta: HomeFinalCtaContent;
  footer: HomeFooterContent;
}
