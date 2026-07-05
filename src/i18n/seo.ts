import type { Metadata } from 'next';
import type { Route } from '@/shared/constants/routes';
import { locales, type Locale } from './config';

interface BuildPageMetadataArgs {
  locale: Locale;
  /** A static route from ROUTES, or a full path (e.g. dynamic detail pages: `/services/${id}`). */
  route: Route | (string & {});
  title: string;
  description: string;
  /** Set false for pages that must never be indexed (auth, dashboard, profile). */
  index?: boolean;
}

function localizePath(locale: Locale, route: string): string {
  return route === '/' ? `/${locale}` : `/${locale}${route}`;
}

/** Builds canonical + hreflang alternates and OG/Twitter defaults for a page. */
export function buildPageMetadata({
  locale,
  route,
  title,
  description,
  index = true,
}: BuildPageMetadataArgs): Metadata {
  const canonicalPath = localizePath(locale, route);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, localizePath(loc, route)])
      ),
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(index
      ? {}
      : {
          robots: {
            index: false,
            follow: false,
          },
        }),
  };
}
