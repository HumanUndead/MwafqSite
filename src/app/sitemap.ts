import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { ROUTES } from '@/shared/constants/routes';
import { SITE_URL } from '@/shared/constants/config';
import { fetchServiceGroupsList } from '@/modules/auth/server/ServiceGroupService';
// import { fetchCourseList } from '@/modules/auth/server/courseListService';

// Courses section is hidden from the frontend for now — re-add ROUTES.COURSES
// here and the course loop below once it's re-enabled.
const STATIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.SERVICES,
  ROUTES.B2B,
  ROUTES.CONTACT,
] as const;

function localizedUrl(locale: string, path: string): string {
  return `${SITE_URL}${path === '/' ? `/${locale}` : `/${locale}${path}`}`;
}

function localizedAlternates(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, localizedUrl(locale, path)])
  );
}

/** One sitemap entry per locale, each pointing to itself plus hreflang alternates for every locale. */
function entriesForPath(path: string): MetadataRoute.Sitemap {
  const alternates = { languages: localizedAlternates(path) };
  return locales.map((locale) => ({
    url: localizedUrl(locale, path),
    alternates,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    entriesForPath(route)
  );

  try {
    const services = await fetchServiceGroupsList({
      pageNumber: 1,
      pageSize: 200,
    });
    for (const service of services.data) {
      entries.push(...entriesForPath(`${ROUTES.SERVICES}/${service.id}`));
    }
  } catch {
    // Upstream unavailable — keep static routes in the sitemap.
  }

  // Courses section is hidden from the frontend for now — re-enable when it's live again.
  // try {
  //   const courses = await fetchCourseList({ pageNumber: 1, pageSize: 200 });
  //   for (const course of courses.data) {
  //     entries.push(...entriesForPath(`${ROUTES.COURSES}/${course.id}`));
  //   }
  // } catch {
  //   // Upstream unavailable — keep static routes in the sitemap.
  // }

  return entries;
}
