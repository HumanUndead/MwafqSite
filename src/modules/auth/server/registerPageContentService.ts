import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import { stripHtmlTags } from '@/shared/lib/htmlText';
import type { RegisterPageContent } from '../registerPage.types';
import {
  REGISTER_PAGE_ARTICLE_RANKS,
  REGISTER_PAGE_CHILD_CATEGORY_RANKS,
  REGISTER_PAGE_CONTENT_API_BASE_URL,
  REGISTER_PAGE_CONTENT_CACHE_TAG,
  REGISTER_PAGE_CONTENT_REVALIDATE_SECONDS,
  REGISTER_PAGE_CONTENT_ROOT_CATEGORY_ID,
} from './registerPageContent.config';

interface ArticleCategoryTranslationDto {
  id: number;
  articleCategoryId: number;
  name: string;
  description: string | null;
  langId: number;
}

interface ArticleTranslationDto {
  id: number;
  articleId: number;
  langId: number;
  name: string;
  description: string | null;
  shortDescription: string | null;
  extraInfo: string | null;
}

interface RecursiveArticleDto {
  id: number;
  articleCategoryId: number;
  rank: number;
  published: boolean;
  image: string | null;
  path: string | null | undefined;
  translations: ArticleTranslationDto[];
}

interface RecursiveArticleCategoryDto {
  id: number;
  rank: number;
  published: boolean;
  parentId: number | null;
  translations: ArticleCategoryTranslationDto[];
  children: RecursiveArticleCategoryDto[];
  articles: RecursiveArticleDto[];
}

interface RecursiveArticleCategoryResponse {
  value: RecursiveArticleCategoryDto | null;
  isSuccess: boolean;
}

const localeToLangId: Record<Locale, number> = {
  en: 1,
  ar: 2,
};

function sortByRank<T extends { id: number; rank: number }>(
  items: readonly T[]
): T[] {
  return [...items].sort((left, right) => {
    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    return left.id - right.id;
  });
}

function trimToNull(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getPreferredTranslation<T extends { langId: number }>(
  translations: readonly T[],
  langId: number
): T | null {
  return (
    translations.find((translation) => translation.langId === langId) ??
    translations.find(
      (translation) => translation.langId === localeToLangId.en
    ) ??
    translations[0] ??
    null
  );
}

function getVisibleChildren(
  category: RecursiveArticleCategoryDto | null
): RecursiveArticleCategoryDto[] {
  if (!category) {
    return [];
  }

  return sortByRank(category.children.filter((child) => child.published));
}

function getVisibleArticles(
  category: RecursiveArticleCategoryDto | null
): RecursiveArticleDto[] {
  if (!category) {
    return [];
  }

  return sortByRank(category.articles.filter((article) => article.published));
}

function getChildCategoryByRank(
  category: RecursiveArticleCategoryDto | null,
  rank: number
): RecursiveArticleCategoryDto | null {
  return (
    getVisibleChildren(category).find((child) => child.rank === rank) ?? null
  );
}

function getArticleByRank(
  category: RecursiveArticleCategoryDto | null,
  rank: number
): RecursiveArticleDto | null {
  return (
    getVisibleArticles(category).find((article) => article.rank === rank) ??
    null
  );
}

function getArticleTranslation(
  article: RecursiveArticleDto,
  langId: number
): Pick<
  ArticleTranslationDto,
  'name' | 'description' | 'shortDescription' | 'extraInfo'
> {
  const translation = getPreferredTranslation(article.translations, langId);

  return {
    name: translation?.name ?? '',
    description: translation?.description ?? null,
    shortDescription: translation?.shortDescription ?? null,
    extraInfo: translation?.extraInfo ?? null,
  };
}

function buildFallbackContent(dict: Dictionary): RegisterPageContent {
  return {
    titleLead: dict.auth.registerPage.hero.titleLead,
    titleAccent: dict.auth.registerPage.hero.titleAccent,
    body: dict.auth.registerPage.hero.body,
    steps: dict.auth.registerPage.steps.map((step) => ({ ...step })),
    stats: dict.auth.registerPage.stats.map((stat) => ({ ...stat })),
  };
}

function mapRegisterPageContent(
  fallback: RegisterPageContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): RegisterPageContent {
  if (!rootCategory) {
    return fallback;
  }

  const heroArticle = getArticleByRank(
    rootCategory,
    REGISTER_PAGE_ARTICLE_RANKS.hero
  );
  const heroTranslation = heroArticle
    ? getArticleTranslation(heroArticle, langId)
    : null;
  const stepsCategory = getChildCategoryByRank(
    rootCategory,
    REGISTER_PAGE_CHILD_CATEGORY_RANKS.steps
  );
  const statsCategory = getChildCategoryByRank(
    rootCategory,
    REGISTER_PAGE_CHILD_CATEGORY_RANKS.stats
  );

  // Real steps are ranked 10, 20, 30, ...; rank 1 is a stray hero-content
  // duplicate that sometimes appears in this category and must be excluded.
  const steps = getVisibleArticles(stepsCategory)
    .filter((article) => article.rank >= 10)
    .map((article) => {
      const translation = getArticleTranslation(article, langId);

      return {
        title: trimToNull(translation.name) ?? '',
        body: stripHtmlTags(translation.description) ?? '',
      };
    });

  const stats = getVisibleArticles(statsCategory).map((article) => {
    const translation = getArticleTranslation(article, langId);

    return {
      value: trimToNull(translation.name) ?? '',
      label:
        stripHtmlTags(translation.description) ??
        trimToNull(translation.shortDescription) ??
        '',
    };
  });

  return {
    titleLead: trimToNull(heroTranslation?.name) ?? fallback.titleLead,
    titleAccent:
      trimToNull(heroTranslation?.extraInfo) ??
      trimToNull(heroTranslation?.shortDescription) ??
      fallback.titleAccent,
    body: stripHtmlTags(heroTranslation?.description) ?? fallback.body,
    steps: steps.length > 0 ? steps : fallback.steps,
    stats: stats.length > 0 ? stats : fallback.stats,
  };
}

const fetchRegisterPageContentTree = cache(
  async (): Promise<RecursiveArticleCategoryDto | null> => {
    if (!REGISTER_PAGE_CONTENT_ROOT_CATEGORY_ID) {
      return null;
    }

    const endpoint = new URL(
      '/api/General/ArticleCategory/GetRecursiveById',
      REGISTER_PAGE_CONTENT_API_BASE_URL
    );

    endpoint.searchParams.set(
      'Id',
      String(REGISTER_PAGE_CONTENT_ROOT_CATEGORY_ID)
    );

    try {
      const response = await fetch(endpoint.toString(), {
        cache: 'no-store',
      });

      // if (!response.ok) {
      //   throw new Error(`Request failed with status ${response.status}`)
      // }
      const payload =
        (await response.json()) as RecursiveArticleCategoryResponse;

      if (!payload.isSuccess || !payload.value) {
        return null;
      }

      return payload.value;
    } catch (error) {
      return null;
    }
  }
);

export async function getRegisterPageContent(
  locale: Locale,
  dict: Dictionary
): Promise<RegisterPageContent> {
  const fallback = buildFallbackContent(dict);
  const rootCategory = await fetchRegisterPageContentTree();

  return mapRegisterPageContent(fallback, rootCategory, localeToLangId[locale]);
}
