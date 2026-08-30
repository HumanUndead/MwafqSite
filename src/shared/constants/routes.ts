export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  COURSES: '/courses',
  B2B: '/b2b',
  CONTACT: '/contact',
  LOGIN: '/login',
  SSO_LOGIN: '/ssologin',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PERSONAL_INFO: '/personal-info',
  ACADEMY_COURSES: '/academy-courses',
  MY_RESERVATIONS: '/my-reservations',
  PRIVACY_POLICY: '/privacy-policy',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
