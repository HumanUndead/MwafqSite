import 'server-only';

import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildPageMetadata } from '@/i18n/seo';
import { IOS_APP_STORE_ID } from '@/modules/deep-linking/config';
import { SITE_URL } from '@/shared/constants/config';

/**
 * Metadata for an `/app/*` handoff page: never indexed, plus the iOS Smart App
 * Banner once `NEXT_PUBLIC_IOS_APP_STORE_ID` is set.
 */
export async function buildAppLinkMetadata(
  locale: Locale,
  route: string
): Promise<Metadata> {
  const { appLink } = await getDictionary(locale);

  return {
    ...buildPageMetadata({
      locale,
      route,
      title: appLink.metaTitle,
      description: appLink.metaDescription,
      index: false,
    }),
    ...(IOS_APP_STORE_ID
      ? {
          itunes: {
            appId: IOS_APP_STORE_ID,
            appArgument: `${SITE_URL}/${locale}${route}`,
          },
        }
      : {}),
  };
}
