import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type {
  AboutB2bSnippetContent,
  AboutFinalCtaContent,
  AboutHeroContent,
  AboutMetaContent,
  AboutMilestonesContent,
  AboutMvContent,
  AboutPageContent,
  AboutSectionWithItemsContent,
  AboutStatItemContent,
  AboutStoryContent,
  AboutValueItemContent,
  AboutValuesContent,
  AboutWhyContent,
} from '@/modules/about/types/aboutContent';
import { getHomeStatsContent } from '@/modules/home/server/homeContentService';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import { stripHtmlToNull } from '@/shared/lib/text';
import {
  ABOUT_B2B_ARTICLE_RANKS,
  ABOUT_CONTENT_CACHE_TAG,
  ABOUT_CONTENT_REVALIDATE_SECONDS,
  ABOUT_CONTENT_ROOT_CATEGORY_ID,
  ABOUT_FINAL_CTA_ARTICLE_RANKS,
  ABOUT_HERO_ARTICLE_RANKS,
  ABOUT_HOW_ARTICLE_RANKS,
  ABOUT_MILESTONE_YEARS,
  ABOUT_MILESTONES_ARTICLE_RANKS,
  ABOUT_MV_ARTICLE_RANKS,
  ABOUT_SECTION_RANKS,
  ABOUT_VALUES_ARTICLE_RANKS,
  ABOUT_WHAT_ARTICLE_RANKS,
  ABOUT_WHY_ARTICLE_RANKS,
} from './aboutContent.config';

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

function getChildrenByRank(
  category: CategoryDto | null,
  rank: number
): CategoryDto[] {
  return getVisibleChildren(category).filter((c) => c.rank === rank);
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getCategoryTranslation(
  category: CategoryDto | null,
  langId: number
): { name: string; description: string | null } | null {
  if (!category) return null;
  const t = getPreferredTranslation(category.translations, langId);
  if (!t) return null;
  return { name: t.name ?? '', description: t.description ?? null };
}

function mapMetaContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutMetaContent {
  const t = getCategoryTranslation(rootCategory, langId);
  return {
    title: trimToNull(t?.name) ?? '',
    description: stripHtmlToNull(t?.description) ?? '',
  };
}

// ─── Section mappers ──────────────────────────────────────────────────────────

function mapHeroContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutHeroContent {
  const heroCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.hero
  );
  const headingArticle = getArticleByRank(
    heroCategory,
    ABOUT_HERO_ARTICLE_RANKS.heading
  );
  const leadArticle = getArticleByRank(
    heroCategory,
    ABOUT_HERO_ARTICLE_RANKS.lead
  );

  const headingT = headingArticle
    ? getArticleTranslation(headingArticle, langId)
    : null;
  const leadT = leadArticle ? getArticleTranslation(leadArticle, langId) : null;

  return {
    headingTop: trimToNull(headingT?.name) ?? '',
    headingMidLead: trimToNull(headingT?.extraInfo) ?? '',
    headingMidAccent: trimToNull(headingT?.shortDescription) ?? '',
    leadLabel: trimToNull(leadT?.name) ?? '',
    lead: trimToNull(leadT?.shortDescription) ?? '',
    imageAlt: '',
  };
}

function mapStoryContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutStoryContent {
  const storyCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.story
  );
  const article = getVisibleArticles(storyCategory)[0] ?? null;
  const t = article ? getArticleTranslation(article, langId) : null;

  return {
    title: trimToNull(t?.name) ?? '',
    body: trimToNull(t?.shortDescription) ?? '',
  };
}

function mapMvContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutMvContent {
  const mvCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.mv
  );
  const missionArticle = getArticleByRank(
    mvCategory,
    ABOUT_MV_ARTICLE_RANKS.mission
  );
  const visionArticle = getArticleByRank(
    mvCategory,
    ABOUT_MV_ARTICLE_RANKS.vision
  );

  const missionT = missionArticle
    ? getArticleTranslation(missionArticle, langId)
    : null;
  const visionT = visionArticle
    ? getArticleTranslation(visionArticle, langId)
    : null;

  return {
    mission: {
      label: trimToNull(missionT?.name) ?? '',
      headline: trimToNull(missionT?.extraInfo) ?? '',
      body: trimToNull(missionT?.shortDescription) ?? '',
    },
    vision: {
      label: trimToNull(visionT?.name) ?? '',
      headline: trimToNull(visionT?.extraInfo) ?? '',
      body: trimToNull(visionT?.shortDescription) ?? '',
    },
  };
}

function mapWhatContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutSectionWithItemsContent {
  const whatCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.what
  );
  const headerArticle = getArticleByRank(
    whatCategory,
    ABOUT_WHAT_ARTICLE_RANKS.header
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const items = getVisibleArticles(whatCategory)
    .filter((a) => a.rank !== ABOUT_WHAT_ARTICLE_RANKS.header)
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return {
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    });

  return {
    eyebrow: trimToNull(headerT?.name) ?? '',
    titleLead: trimToNull(headerT?.extraInfo) ?? '',
    titleAccent: '',
    items,
  };
}

function mapWhyContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutWhyContent {
  const whyCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.why
  );
  const eyebrowArticle = getArticleByRank(
    whyCategory,
    ABOUT_WHY_ARTICLE_RANKS.eyebrow
  );
  const contentArticle = getArticleByRank(
    whyCategory,
    ABOUT_WHY_ARTICLE_RANKS.content
  );

  const eyebrowT = eyebrowArticle
    ? getArticleTranslation(eyebrowArticle, langId)
    : null;
  const contentT = contentArticle
    ? getArticleTranslation(contentArticle, langId)
    : null;

  const items = getVisibleArticles(whyCategory)
    .filter(
      (a) =>
        a.rank !== ABOUT_WHY_ARTICLE_RANKS.eyebrow &&
        a.rank !== ABOUT_WHY_ARTICLE_RANKS.content
    )
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return {
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    });

  return {
    eyebrow: trimToNull(eyebrowT?.name) ?? '',
    titleLead: trimToNull(contentT?.name) ?? '',
    titleAccent: trimToNull(contentT?.extraInfo) ?? '',
    body: trimToNull(contentT?.shortDescription) ?? '',
    items,
  };
}

function mapValuesContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutValuesContent {
  const valuesCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.values
  );
  const headerArticle = getArticleByRank(
    valuesCategory,
    ABOUT_VALUES_ARTICLE_RANKS.header
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const items: AboutValueItemContent[] = getVisibleArticles(valuesCategory)
    .filter((a) => a.rank !== ABOUT_VALUES_ARTICLE_RANKS.header)
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      const enT = getArticleTranslation(article, localeToLangId.en);
      return {
        key: slugify(enT.name),
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    });

  return {
    eyebrow: trimToNull(headerT?.name) ?? '',
    items,
  };
}

function mapHowContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutSectionWithItemsContent {
  const howCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.how
  );
  const headerArticle = getArticleByRank(
    howCategory,
    ABOUT_HOW_ARTICLE_RANKS.header
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const items = getVisibleArticles(howCategory)
    .filter((a) => a.rank !== ABOUT_HOW_ARTICLE_RANKS.header)
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return {
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    });

  return {
    eyebrow: trimToNull(headerT?.name) ?? '',
    titleLead: trimToNull(headerT?.extraInfo) ?? '',
    titleAccent: '',
    items,
  };
}

function mapMilestonesContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutMilestonesContent {
  // Rank-9 categories sorted by id: index 0 = milestones (id 155), index 1 = b2b (id 156)
  const milestonesCategory =
    getChildrenByRank(
      rootCategory,
      ABOUT_SECTION_RANKS.rankWithMilestonesAndB2b
    )[0] ?? null;

  const headerArticle = getArticleByRank(
    milestonesCategory,
    ABOUT_MILESTONES_ARTICLE_RANKS.header
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const itemArticles = getVisibleArticles(milestonesCategory).filter(
    (a) => a.rank !== ABOUT_MILESTONES_ARTICLE_RANKS.header
  );

  const items = itemArticles.map((article, index) => {
    const t = getArticleTranslation(article, langId);
    return {
      year: ABOUT_MILESTONE_YEARS[index] ?? '',
      title: trimToNull(t.name) ?? '',
      body: trimToNull(t.shortDescription) ?? '',
    };
  });

  return {
    eyebrow: trimToNull(headerT?.name) ?? '',
    titleLead: trimToNull(headerT?.extraInfo) ?? '',
    titleAccent: '',
    items,
  };
}

function mapB2bSnippetContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutB2bSnippetContent {
  // Rank-9 categories sorted by id: index 0 = milestones (id 155), index 1 = b2b (id 156)
  const b2bCategory =
    getChildrenByRank(
      rootCategory,
      ABOUT_SECTION_RANKS.rankWithMilestonesAndB2b
    )[1] ?? null;

  const headerArticle = getArticleByRank(
    b2bCategory,
    ABOUT_B2B_ARTICLE_RANKS.header
  );
  const contentArticle = getArticleByRank(
    b2bCategory,
    ABOUT_B2B_ARTICLE_RANKS.content
  );

  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;
  const contentT = contentArticle
    ? getArticleTranslation(contentArticle, langId)
    : null;

  const points = getVisibleArticles(b2bCategory)
    .filter(
      (a) =>
        a.rank !== ABOUT_B2B_ARTICLE_RANKS.header &&
        a.rank !== ABOUT_B2B_ARTICLE_RANKS.content
    )
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return trimToNull(t.name) ?? '';
    });

  return {
    eyebrow: trimToNull(headerT?.name) ?? '',
    titleLead: trimToNull(headerT?.extraInfo) ?? '',
    titleAccent: trimToNull(headerT?.shortDescription) ?? '',
    body: trimToNull(contentT?.name) ?? '',
    cta: trimToNull(contentT?.extraInfo) ?? '',
    points,
  };
}

function mapFinalCtaContent(
  rootCategory: CategoryDto | null,
  langId: number
): AboutFinalCtaContent {
  const finalCtaCategory = getChildCategoryByRank(
    rootCategory,
    ABOUT_SECTION_RANKS.finalCta
  );
  const contentArticle = getArticleByRank(
    finalCtaCategory,
    ABOUT_FINAL_CTA_ARTICLE_RANKS.content
  );
  const actionsArticle = getArticleByRank(
    finalCtaCategory,
    ABOUT_FINAL_CTA_ARTICLE_RANKS.actions
  );
  const secondaryFallbackArticle = getArticleByRank(
    finalCtaCategory,
    ABOUT_FINAL_CTA_ARTICLE_RANKS.secondaryFallback
  );

  const contentT = contentArticle
    ? getArticleTranslation(contentArticle, langId)
    : null;
  const actionsT = actionsArticle
    ? getArticleTranslation(actionsArticle, langId)
    : null;
  const secondaryFallbackT = secondaryFallbackArticle
    ? getArticleTranslation(secondaryFallbackArticle, langId)
    : null;

  return {
    titleLead: trimToNull(contentT?.name) ?? '',
    titleAccent: trimToNull(contentT?.extraInfo) ?? '',
    body: trimToNull(contentT?.shortDescription) ?? '',
    primary: trimToNull(actionsT?.name) ?? '',
    secondary:
      trimToNull(actionsT?.extraInfo) ??
      trimToNull(secondaryFallbackT?.name) ??
      '',
  };
}

// ─── Build ────────────────────────────────────────────────────────────────────

function buildAboutContent(
  rootCategory: CategoryDto | null,
  stats: AboutStatItemContent[],
  langId: number
): AboutPageContent {
  return {
    meta: mapMetaContent(rootCategory, langId),
    hero: mapHeroContent(rootCategory, langId),
    story: mapStoryContent(rootCategory, langId),
    mv: mapMvContent(rootCategory, langId),
    stats,
    what: mapWhatContent(rootCategory, langId),
    why: mapWhyContent(rootCategory, langId),
    values: mapValuesContent(rootCategory, langId),
    how: mapHowContent(rootCategory, langId),
    milestones: mapMilestonesContent(rootCategory, langId),
    b2b: mapB2bSnippetContent(rootCategory, langId),
    finalCta: mapFinalCtaContent(rootCategory, langId),
  };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchAboutContentTree = cache(async (): Promise<CategoryDto | null> => {
  try {
    return await fetchWithErrorHandling<CategoryDto | null>(
      `/api/General/ArticleCategory/GetRecursiveById?Id=${ABOUT_CONTENT_ROOT_CATEGORY_ID}`,
      {
        cache: 'no-store',
      }
    );
  } catch (error) {
    console.error('[about-content] Failed to fetch About content tree.', error);
    return null;
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

export const getAboutPageContent = cache(
  async (locale: Locale): Promise<AboutPageContent> => {
    const langId = localeToLangId[locale];
    const [rootCategory, homeStats] = await Promise.all([
      fetchAboutContentTree(),
      getHomeStatsContent(locale),
    ]);
    const stats: AboutStatItemContent[] = homeStats.items.map((item) => ({
      value: item.value,
      suffix: item.suffix ?? '',
      label: item.label,
    }));
    return buildAboutContent(rootCategory, stats, langId);
  }
);
