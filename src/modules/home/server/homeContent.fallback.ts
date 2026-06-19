import 'server-only';

import type {
  HomeActionContent,
  HomeAppCardAppointmentContent,
  HomeAppCardReportsContent,
  HomeAppCardStatusContent,
  HomeBookingFieldContent,
  HomePageContent,
} from '../home.types';

const EMPTY_ACTION: HomeActionContent = { label: '', path: null };

const EMPTY_BOOKING_FIELD: HomeBookingFieldContent = {
  label: '',
  placeholder: '',
};

const EMPTY_APP_APPOINTMENT: HomeAppCardAppointmentContent = {
  value: '',
  detail: '',
  location: '',
  iconKey: null,
};

const EMPTY_APP_STATUS: HomeAppCardStatusContent = {
  label: '',
  detail: '',
  status: '',
};

const EMPTY_APP_REPORTS: HomeAppCardReportsContent = {
  label: '',
  detail: '',
  status: '',
  items: [],
};

export function buildEmptyHomeFallback(): HomePageContent {
  return {
    header: {
      brandLabel: '',
      brandDescription: '',
      brandPath: '#home',
      brandImageSrc: '/demo-assets/logo.svg',
      navLinks: [],
      primaryAction: null,
      signInAction: EMPTY_ACTION,
      userMenu: null,
      localeSwitchLabel: null,
      businessSignInAction: EMPTY_ACTION,
    },
    hero: {
      badge: '',
      badgeImages: [],
      titleLead: '',
      titleMiddle: '',
      rotatingWords: [],
      subtitle: '',
      primaryAction: { ...EMPTY_ACTION },
      secondaryAction: { ...EMPTY_ACTION },
      stats: [],
      phoneGreeting: '',
      phoneName: '',
      phoneSearchPlaceholder: '',
      servicesTitle: '',
      servicesLink: '',
      phoneTiles: [],
      liveBookings: '',
      liveBookingsLabel: '',
      floatingCards: [],
    },
    companies: {
      items: [],
    },
    services: {
      eyebrow: '',
      title: '',
      accent: '',
      body: '',
      items: [],
    },
    why: {
      eyebrow: '',
      title: '',
      items: [],
    },
    booking: {
      eyebrow: '',
      title: '',
      note: '',
      fields: {
        exam: { ...EMPTY_BOOKING_FIELD },
        city: { ...EMPTY_BOOKING_FIELD },
        date: { ...EMPTY_BOOKING_FIELD },
        search: { ...EMPTY_ACTION },
      },
      examOptions: [],
    },
    steps: {
      eyebrow: '',
      title: '',
      highlight: '',
      cta: { ...EMPTY_ACTION },
      items: [],
    },
    app: {
      eyebrow: '',
      title: '',
      accent: '',
      body: '',
      scheduleCard: {
        label: '',
        detail: '',
        appointment: { ...EMPTY_APP_APPOINTMENT },
      },
      statusCard: { ...EMPTY_APP_STATUS },
      reportsCard: { ...EMPTY_APP_REPORTS },
      points: [],
      downloadLinks: [],
    },
    academy: {
      eyebrow: '',
      title: '',
      accent: '',
      ctaLabel: '',
      items: [],
    },
    stats: {
      title: '',
      items: [],
    },
    testimonial: [
      {
        quote: '',
        highlight: '',
        author: '',
        role: '',
      },
    ],
    finalCta: {
      title: '',
      highlight: '',
      body: '',
      primaryAction: { ...EMPTY_ACTION },
      secondaryAction: { ...EMPTY_ACTION },
    },
    footer: {
      brandLabel: '',
      brandBody: '',
      brandPath: '#home',
      brandImageSrc: '/demo-assets/logo.svg',
      newsletterPlaceholder: '',
      newsletterEyebrow: '',
      newsletterAction: '',
      copyrightLabel: '',
      copyrightBody: '',
      pages: { title: '', links: [] },
      help: { title: '', links: [] },
      contact: { title: '', links: [] },
    },
    sectionOrder: [],
  };
}
