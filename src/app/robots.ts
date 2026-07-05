import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { ROUTES } from '@/shared/constants/routes';
import { SITE_URL } from '@/shared/constants/config';

const PRIVATE_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.DASHBOARD,
  ROUTES.PERSONAL_INFO,
  ROUTES.ACADEMY_COURSES,
  ROUTES.MY_RESERVATIONS,
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/api/'].concat(
    locales.flatMap((locale) =>
      PRIVATE_ROUTES.map((route) => `/${locale}${route}`)
    )
  );

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
