import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type { HomeFooterContent, HomeHeaderContent } from '../home.types';
import type {
  RecursiveArticleCategoryDto,
  RecursiveArticleCategoryResponse,
} from './articleCategory.dto';
import {
  MENU_CONTENT_API_BASE_URL,
  MENU_CONTENT_CACHE_TAG,
  MENU_CONTENT_REVALIDATE_SECONDS,
  MENU_ITEMS_ROOT_CATEGORY_ID,
  SOCIAL_MEDIA_CATEGORY_ID,
} from './menuContent.config';
import { mapFooterContent, mapHeaderContent } from './homeContentService';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

export interface MenuContent {
  header: HomeHeaderContent;
  footer: HomeFooterContent;
}

const localeToLangId: Record<Locale, number> = {
  en: 1,
  ar: 2,
};

const fetchMenuItemsTree = cache(
  async (): Promise<RecursiveArticleCategoryDto> => {
    const endpoint = new URL(
      '/api/General/ArticleCategory/GetRecursiveById',
      MENU_CONTENT_API_BASE_URL
    );

    endpoint.searchParams.set('Id', String(MENU_ITEMS_ROOT_CATEGORY_ID));

    const response = await fetchWithErrorHandling<
      RecursiveArticleCategoryResponse['value']
    >(endpoint.toString(), {
      next: {
        revalidate: MENU_CONTENT_REVALIDATE_SECONDS,
        tags: [MENU_CONTENT_CACHE_TAG],
      },
    });
    return response;
  }
);

const fetchSocialMediaCategoryTree = cache(
  async (): Promise<RecursiveArticleCategoryDto | null> => {
    const endpoint = new URL(
      '/api/General/ArticleCategory/GetRecursiveById',
      MENU_CONTENT_API_BASE_URL
    );

    endpoint.searchParams.set('Id', String(SOCIAL_MEDIA_CATEGORY_ID));

    const response = await fetch(endpoint.toString(), {
      next: {
        revalidate: MENU_CONTENT_REVALIDATE_SECONDS,
        tags: [MENU_CONTENT_CACHE_TAG],
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as RecursiveArticleCategoryResponse;

    if (!payload.isSuccess || !payload.value) {
      return null;
    }

    return payload.value;
  }
);

export const getMenuContent = cache(
  async (locale: Locale): Promise<MenuContent> => {
    const langId = localeToLangId[locale];
    const [menuCategory, socialMediaCategory] = await Promise.all([
      fetchMenuItemsTree(),
      fetchSocialMediaCategoryTree(),
    ]);

    const footer = mapFooterContent(menuCategory, langId, socialMediaCategory);

    return {
      header: mapHeaderContent(menuCategory, langId),
      footer,
    };
  }
);
