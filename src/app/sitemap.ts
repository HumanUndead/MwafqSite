import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { ROUTES } from '@/shared/constants/routes';
import { SITE_URL } from '@/shared/constants/config';
import { fetchServiceGroupsList } from '@/modules/auth/server/ServiceGroupService';
import { fetchCourseList } from '@/modules/auth/server/courseListService';

const STATIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.SERVICES,
  ROUTES.COURSES,
  ROUTES.B2B,
  ROUTES.CONTACT,
] as const;

function localizedAlternates(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      `${SITE_URL}${path === '/' ? `/${locale}` : `/${locale}${path}`}`,
    ])
  );
}

function entry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path === '/' ? `/${locales[0]}` : `/${locales[0]}${path}`}`,
    alternates: { languages: localizedAlternates(path) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) =>
    entry(route)
  );

  try {
    const services = await fetchServiceGroupsList({
      pageNumber: 1,
      pageSize: 200,
    });
    for (const service of services.data) {
      entries.push(entry(`${ROUTES.SERVICES}/${service.id}`));
    }
  } catch {
    // Upstream unavailable — keep static routes in the sitemap.
  }

  try {
    const courses = await fetchCourseList({ pageNumber: 1, pageSize: 200 });
    for (const course of courses.data) {
      entries.push(entry(`${ROUTES.COURSES}/${course.id}`));
    }
  } catch {
    // Upstream unavailable — keep static routes in the sitemap.
  }

  return entries;
}
