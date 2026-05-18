export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PERSONAL_INFO: '/personal-info',
  ACADEMY_COURSES: '/academy-courses',
  MY_RESERVATIONS: '/my-reservations',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
