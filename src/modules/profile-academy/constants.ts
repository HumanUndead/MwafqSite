export const EASE = [0.22, 1, 0.36, 1] as const;

export const courseCardVariants = {
  rest: {
    y: 0,
    borderColor: '#e5e7f0',
    backgroundColor: '#ffffff',
  },
  hover: {
    y: -4,
    borderColor: '#00a8f1',
    backgroundColor: '#fbfcff',
    transition: { duration: 0.35, ease: EASE },
  },
} as const;

export const courseMediaVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.06,
    transition: { duration: 0.5, ease: EASE },
  },
} as const;

/** Placeholder rows until API provides enrolled courses. */
export const academyCoursesPlaceholder = [
  {
    id: 'course-cpr',
    title: 'CPR Basics',
    description:
      'Develop your professional and medical skills through specialized, certified courses.',
    imageSrc: 'https://loremflickr.com/640/400/cpr,training/all?lock=31',
    imageAlt: 'CPR training',
    progress: 52,
    rating: 4.8,
    reviewCount: 12,
    transitionDelay: 0,
  },
  {
    id: 'course-first-aid',
    title: 'First Aid Essentials',
    description:
      'Learn life-saving response techniques for workplaces and everyday emergencies.',
    imageSrc: 'https://loremflickr.com/640/400/first-aid,medical/all?lock=42',
    imageAlt: 'First aid',
    progress: 38,
    rating: 4.7,
    reviewCount: 28,
    transitionDelay: 0.08,
  },
  {
    id: 'course-infection',
    title: 'Infection Control',
    description:
      'Master hygiene protocols and infection prevention practices in clinical settings.',
    imageSrc: 'https://loremflickr.com/640/400/infection,control/all?lock=53',
    imageAlt: 'Infection control',
    progress: 71,
    rating: 4.9,
    reviewCount: 41,
    transitionDelay: 0.16,
  },
  {
    id: 'course-vitals',
    title: 'Vital Signs Monitoring',
    description:
      'Build accurate vital-sign assessment skills used across hospitals and clinics.',
    imageSrc: 'https://loremflickr.com/640/400/medical,training/all?lock=64',
    imageAlt: 'Medical training',
    progress: 20,
    rating: 4.6,
    reviewCount: 19,
    transitionDelay: 0.24,
  },
] as const;

export type AcademyCourseRow = (typeof academyCoursesPlaceholder)[number];
