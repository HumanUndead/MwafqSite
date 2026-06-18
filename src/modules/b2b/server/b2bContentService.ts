import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import type { HomeCompaniesContent } from '@/modules/home/home.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import {
  B2B_COMPANIES_CATEGORY_ID,
  B2B_CONTENT_API_BASE_URL,
  B2B_CONTENT_CACHE_TAG,
  B2B_CONTENT_REVALIDATE_SECONDS,
  B2B_CONTENT_ROOT_CATEGORY_ID,
  B2B_HERO_ARTICLE_RANKS,
  B2B_SECTION_RANKS,
  B2B_SERVICES_ARTICLE_RANKS,
  B2B_STEPS_ARTICLE_RANKS,
  B2B_WHY_ARTICLE_RANKS,
} from './b2bContent.config';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface ArticleTranslationDto {
  id: number;
  articleId: number;
  langId: number;
  name: string;
  description: string | null;
  shortDescription: string | null;
  extraInfo: string | null;
}

interface ArticleDto {
  id: number;
  articleCategoryId: number;
  rank: number;
  published: boolean;
  image: string | null;
  images: string | null | undefined;
  path: string | null | undefined;
  translations: ArticleTranslationDto[];
}

interface CategoryDto {
  id: number;
  rank: number;
  published: boolean;
  parentId: number | null;
  image: string | null;
  hasChild: boolean;
  hasArticle: boolean;
  translations: {
    id: number;
    articleCategoryId: number;
    name: string;
    description: string | null;
    langId: number;
  }[];
  children: CategoryDto[];
  articles: ArticleDto[];
}

interface TranslationSnapshot {
  name: string;
  description: string | null;
  shortDescription: string | null;
  extraInfo: string | null;
}

// ─── Locale map ───────────────────────────────────────────────────────────────

const localeToLangId: Record<Locale, number> = { en: 1, ar: 2 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortByRank<T extends { id: number; rank: number }>(
  items: readonly T[]
): T[] {
  return [...items].sort((a, b) =>
    a.rank !== b.rank ? a.rank - b.rank : a.id - b.id
  );
}

function getPreferredTranslation<T extends { langId: number }>(
  translations: readonly T[],
  langId: number
): T | null {
  return (
    translations.find((t) => t.langId === langId) ??
    translations.find((t) => t.langId === localeToLangId.en) ??
    translations[0] ??
    null
  );
}

function getVisibleChildren(category: CategoryDto | null): CategoryDto[] {
  if (!category) return [];
  return sortByRank(category.children);
}

function getVisibleArticles(category: CategoryDto | null): ArticleDto[] {
  if (!category) return [];
  return sortByRank(category.articles);
}

function getChildCategoryByRank(
  category: CategoryDto | null,
  rank: number
): CategoryDto | null {
  return getVisibleChildren(category).find((c) => c.rank === rank) ?? null;
}

function getChildCategoryById(
  category: CategoryDto | null,
  id: number
): CategoryDto | null {
  return category?.children.find((c) => c.id === id) ?? null;
}

function getArticleByRank(
  category: CategoryDto | null,
  rank: number
): ArticleDto | null {
  return getVisibleArticles(category).find((a) => a.rank === rank) ?? null;
}

function getArticleTranslation(
  article: ArticleDto,
  langId: number
): TranslationSnapshot {
  const t = getPreferredTranslation(article.translations, langId);
  return {
    name: t?.name ?? '',
    description: t?.description ?? null,
    shortDescription: t?.shortDescription ?? null,
    extraInfo: t?.extraInfo ?? null,
  };
}

function trimToNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stripHtmlTags(html: string | null | undefined): string | null {
  const trimmed = trimToNull(html);
  if (!trimmed) return null;
  const stripped = trimmed.replace(/<[^>]*>/g, '').trim();
  return stripped.length > 0 ? stripped : null;
}

// Derives initials from a display name, Unicode-safe (handles Arabic names).
function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)
    .map((part) => ([...part][0] ?? '').toUpperCase())
    .join('')
    .slice(0, 2);
}

// Status is always normalised from English (it is a CSS key: done/active/wait).
function normalizeStatus(value: string | null | undefined): string {
  return trimToNull(value)?.toLowerCase() ?? 'wait';
}

// ─── Section mappers ──────────────────────────────────────────────────────────

type HeroContent = Dictionary['b2b']['hero'];
type WhyContent = Dictionary['b2b']['why'];
type ServicesContent = Dictionary['b2b']['services'];
type StepsContent = Dictionary['b2b']['steps'];
type FinalCtaContent = Dictionary['b2b']['finalCta'];

function mapHeroContent(
  rootCategory: CategoryDto | null,
  langId: number
): HeroContent {
  const heroCategory = getChildCategoryByRank(
    rootCategory,
    B2B_SECTION_RANKS.hero
  );

  const eyebrowArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.eyebrow
  );
  const headingArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.heading
  );
  const leadArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.lead
  );
  const primaryCtaArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.primaryCta
  );
  const secondaryCtaArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.secondaryCta
  );
  const phoneGreetingArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.phoneGreeting
  );
  const phoneNameArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.phoneName
  );
  const phoneBulkArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.phoneBulk
  );
  const phoneSectionTitleArticle = getArticleByRank(
    heroCategory,
    B2B_HERO_ARTICLE_RANKS.phoneSectionTitle
  );

  const allArticles = getVisibleArticles(heroCategory);
  const employeeArticles = allArticles.filter(
    (a) =>
      a.rank >= B2B_HERO_ARTICLE_RANKS.employeeStart &&
      a.rank <= B2B_HERO_ARTICLE_RANKS.employeeEnd
  );
  const floatingCardArticles = allArticles.filter(
    (a) => a.rank >= B2B_HERO_ARTICLE_RANKS.floatingCardStart
  );

  // Eyebrow: CMS stores the value as HTML in `description` of rank-1 article.
  const eyebrowT = eyebrowArticle
    ? getArticleTranslation(eyebrowArticle, langId)
    : null;

  const headingT = headingArticle
    ? getArticleTranslation(headingArticle, langId)
    : null;
  const phoneGreetingT = phoneGreetingArticle
    ? getArticleTranslation(phoneGreetingArticle, langId)
    : null;
  const phoneNameT = phoneNameArticle
    ? getArticleTranslation(phoneNameArticle, langId)
    : null;
  const phoneBulkT = phoneBulkArticle
    ? getArticleTranslation(phoneBulkArticle, langId)
    : null;
  const phoneSectionTitleT = phoneSectionTitleArticle
    ? getArticleTranslation(phoneSectionTitleArticle, langId)
    : null;

  const employees = employeeArticles.map((article) => {
    const localized = getArticleTranslation(article, langId);
    // Status is always from English — it is a CSS key (done/active/wait).
    const english = getArticleTranslation(article, localeToLangId.en);
    const name = trimToNull(localized.name) ?? trimToNull(english.name) ?? '';
    return {
      initials: deriveInitials(name),
      name,
      type:
        trimToNull(localized.extraInfo) ?? trimToNull(english.extraInfo) ?? '',
      status: normalizeStatus(english.shortDescription),
    };
  });

  const floatingCards = floatingCardArticles.map((article) => {
    const t = getArticleTranslation(article, langId);
    return {
      title: trimToNull(t.name) ?? '',
      detail: trimToNull(t.extraInfo) ?? '',
    };
  });

  return {
    eyebrow: stripHtmlTags(eyebrowT?.description) ?? '',
    headingLead: trimToNull(headingT?.name) ?? '',
    headingAccent: trimToNull(headingT?.extraInfo) ?? '',
    lead:
      trimToNull(
        leadArticle ? getArticleTranslation(leadArticle, langId).name : null
      ) ?? '',
    primaryCta:
      trimToNull(
        primaryCtaArticle
          ? getArticleTranslation(primaryCtaArticle, langId).name
          : null
      ) ?? '',
    secondaryCta:
      trimToNull(
        secondaryCtaArticle
          ? getArticleTranslation(secondaryCtaArticle, langId).name
          : null
      ) ?? '',
    phone: {
      greeting: trimToNull(phoneGreetingT?.name) ?? '',
      name: trimToNull(phoneNameT?.name) ?? '',
      bulkTitle: trimToNull(phoneBulkT?.name) ?? '',
      bulkSubtitle: trimToNull(phoneBulkT?.extraInfo) ?? '',
      sectionTitle: trimToNull(phoneSectionTitleT?.name) ?? '',
      statusDone: '',
      statusActive: '',
      statusWait: '',
      employees,
    },
    floatingCards,
  };
}

function mapWhyContent(
  rootCategory: CategoryDto | null,
  langId: number
): WhyContent {
  const whyCategory = getChildCategoryByRank(
    rootCategory,
    B2B_SECTION_RANKS.why
  );

  const headerArticle = getArticleByRank(
    whyCategory,
    B2B_WHY_ARTICLE_RANKS.header
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const items = getVisibleArticles(whyCategory)
    .filter((a) => a.rank !== B2B_WHY_ARTICLE_RANKS.header)
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return {
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    });

  return {
    titleLead: trimToNull(headerT?.name) ?? '',
    titleAccent: trimToNull(headerT?.extraInfo) ?? '',
    items,
  };
}

function mapServicesContent(
  rootCategory: CategoryDto | null,
  langId: number
): ServicesContent {
  const servicesCategory = getChildCategoryByRank(
    rootCategory,
    B2B_SECTION_RANKS.services
  );

  const headerArticle = getArticleByRank(
    servicesCategory,
    B2B_SERVICES_ARTICLE_RANKS.header
  );
  const bodyArticle = getArticleByRank(
    servicesCategory,
    B2B_SERVICES_ARTICLE_RANKS.body
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const items = getVisibleArticles(servicesCategory)
    .filter(
      (a) =>
        a.rank !== B2B_SERVICES_ARTICLE_RANKS.header &&
        a.rank !== B2B_SERVICES_ARTICLE_RANKS.body
    )
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return {
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    });

  return {
    titleLead: trimToNull(headerT?.name) ?? '',
    titleAccent: trimToNull(headerT?.extraInfo) ?? '',
    body:
      trimToNull(
        bodyArticle ? getArticleTranslation(bodyArticle, langId).name : null
      ) ?? '',
    items,
  };
}

function mapStepsContent(
  rootCategory: CategoryDto | null,
  langId: number
): StepsContent {
  const stepsCategory = getChildCategoryByRank(
    rootCategory,
    B2B_SECTION_RANKS.steps
  );

  const headerArticle = getArticleByRank(
    stepsCategory,
    B2B_STEPS_ARTICLE_RANKS.header
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const items = getVisibleArticles(stepsCategory)
    .filter((a) => a.rank !== B2B_STEPS_ARTICLE_RANKS.header)
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return {
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    });

  return {
    titleLead: trimToNull(headerT?.name) ?? '',
    titleAccent: trimToNull(headerT?.shortDescription) ?? '',
    items,
  };
}

function mapFinalCtaContent(
  rootCategory: CategoryDto | null,
  langId: number
): FinalCtaContent {
  const finalCtaCategory = getChildCategoryByRank(
    rootCategory,
    B2B_SECTION_RANKS.finalCta
  );

  // Two CMS articles share rank 2 (ids 325, 326). Use index-based access after
  // sortByRank (which breaks ties by id), so 325 < 326 < 327.
  const articles = getVisibleArticles(finalCtaCategory);
  const contentArticle = articles[0] ?? null;
  const primaryCtaArticle = articles[1] ?? null;
  const secondaryCtaArticle = articles[2] ?? null;

  const contentT = contentArticle
    ? getArticleTranslation(contentArticle, langId)
    : null;

  return {
    titleLead: trimToNull(contentT?.name) ?? '',
    titleAccent: trimToNull(contentT?.extraInfo) ?? '',
    body: trimToNull(contentT?.shortDescription) ?? '',
    primary:
      trimToNull(
        primaryCtaArticle
          ? getArticleTranslation(primaryCtaArticle, langId).name
          : null
      ) ?? '',
    secondary:
      trimToNull(
        secondaryCtaArticle
          ? getArticleTranslation(secondaryCtaArticle, langId).name
          : null
      ) ?? '',
  };
}

// ─── Companies ────────────────────────────────────────────────────────────────

function resolveCmsAssetUrl(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim().replace(/\\/g, '/');
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = B2B_CONTENT_API_BASE_URL.replace(/\/+$/, '');
  return `${base}/${trimmed.replace(/^\/+/, '')}`;
}

function mapB2BCompaniesContent(
  companiesCategory: CategoryDto | null
): HomeCompaniesContent {
  if (!companiesCategory) return { items: [] };
  return {
    items: companiesCategory.articles
      .filter((article) => article.published && article.image)
      .map((article) => ({
        id: article.id,
        imageSrc: resolveCmsAssetUrl(article.image),
      })),
  };
}

// ─── Build ────────────────────────────────────────────────────────────────────

export type B2BPageContent = Dictionary['b2b'] & {
  companies: HomeCompaniesContent;
};

function buildB2BContent(
  dict: Dictionary,
  rootCategory: CategoryDto | null,
  companiesCategory: CategoryDto | null,
  langId: number
): B2BPageContent {
  return {
    meta: dict.b2b.meta,
    hero: mapHeroContent(rootCategory, langId),
    why: mapWhyContent(rootCategory, langId),
    services: mapServicesContent(rootCategory, langId),
    steps: mapStepsContent(rootCategory, langId),
    finalCta: mapFinalCtaContent(rootCategory, langId),
    companies: mapB2BCompaniesContent(companiesCategory),
  };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchB2BContentTree = cache(async (): Promise<CategoryDto | null> => {
  try {
    return await fetchWithErrorHandling<CategoryDto | null>(
      `/api/General/ArticleCategory/GetRecursiveById?Id=${B2B_CONTENT_ROOT_CATEGORY_ID}`,
      {
        cache: 'no-store',
      }
    );
  } catch (error) {
    console.error('[b2b-content] Failed to fetch B2B content tree.', error);
    return null;
  }
});

const fetchB2BCompaniesCategoryTree = cache(
  async (): Promise<CategoryDto | null> => {
    try {
      return await fetchWithErrorHandling<CategoryDto | null>(
        `/api/General/ArticleCategory/GetRecursiveById?Id=${B2B_COMPANIES_CATEGORY_ID}`,
        {
          next: {
            revalidate: B2B_CONTENT_REVALIDATE_SECONDS,
            tags: [B2B_CONTENT_CACHE_TAG],
          },
        }
      );
    } catch (error) {
      console.error(
        '[b2b-content] Failed to fetch companies category.',
        error
      );
      return null;
    }
  }
);

// ─── Export ───────────────────────────────────────────────────────────────────

export async function getB2BPageContent(
  locale: Locale,
  dict: Dictionary
): Promise<B2BPageContent> {
  const langId = localeToLangId[locale];
  const [rootCategory, companiesCategory] = await Promise.all([
    fetchB2BContentTree(),
    fetchB2BCompaniesCategoryTree(),
  ]);
  return buildB2BContent(dict, rootCategory, companiesCategory, langId);
}
