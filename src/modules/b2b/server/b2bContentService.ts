import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import type {
  HomeActionContent,
  HomeBusinessContent,
  HomeCompaniesContent,
} from '@/modules/home/home.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import {
  B2B_BUSINESS_ARTICLE_IDS,
  B2B_BUSINESS_CATEGORY_ID,
  B2B_COMPANIES_CATEGORY_ID,
  B2B_CONTENT_API_BASE_URL,
  B2B_CONTENT_CACHE_TAG,
  B2B_CONTENT_REVALIDATE_SECONDS,
  B2B_CONTENT_ROOT_CATEGORY_ID,
  B2B_FAQ_ARTICLE_IDS,
  B2B_FAQ_CATEGORY_ID,
  B2B_HERO_ARTICLE_RANKS,
  B2B_HERO_OVERRIDE_ARTICLE_ID,
  B2B_JOURNEY_CATEGORY_ID,
  B2B_JOURNEY_STAGE_ARTICLE_IDS,
  B2B_SECTION_RANKS,
  B2B_SERVICES_ARTICLE_RANKS,
  B2B_SERVICES_PRODUCT_ARTICLE_IDS,
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

function getArticleById(
  category: CategoryDto | null,
  id: number
): ArticleDto | null {
  return category?.articles.find((a) => a.id === id) ?? null;
}

// Resolves articles by explicit id, preserving the order of the id list.
function getArticlesByIds(
  category: CategoryDto | null,
  ids: readonly number[]
): ArticleDto[] {
  return ids
    .map((id) => getArticleById(category, id))
    .filter((a): a is ArticleDto => a !== null);
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

const HTML_ENTITIES: Record<string, string> = {
  '&middot;': '·',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&mdash;': '—',
  '&ndash;': '–',
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&[a-zA-Z]+;/g, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function stripHtmlTags(html: string | null | undefined): string | null {
  const trimmed = trimToNull(html);
  if (!trimmed) return null;
  const stripped = decodeHtmlEntities(trimmed.replace(/<[^>]*>/g, '')).trim();
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
export interface WhyItemContent {
  key: string;
  title: string;
  body: string;
}
export interface WhyContent {
  titleLead: string;
  titleAccent: string;
  items: WhyItemContent[];
}
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
  const heroOverrideArticle = getArticleById(
    heroCategory,
    B2B_HERO_OVERRIDE_ARTICLE_ID
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
    (a) =>
      a.rank >= B2B_HERO_ARTICLE_RANKS.floatingCardStart &&
      a.id !== B2B_HERO_OVERRIDE_ARTICLE_ID
  );

  // Eyebrow: CMS stores the value as HTML in `description` of rank-1 article.
  const eyebrowT = eyebrowArticle
    ? getArticleTranslation(eyebrowArticle, langId)
    : null;

  const headingT = headingArticle
    ? getArticleTranslation(headingArticle, langId)
    : null;

  // Override: a later CMS article replaces eyebrow/heading/lead wholesale
  // (name -> eyebrow, extraInfo -> heading, shortDescription -> lead).
  const heroOverrideT = heroOverrideArticle
    ? getArticleTranslation(heroOverrideArticle, langId)
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
      city: '',
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
    eyebrow:
      trimToNull(heroOverrideT?.name) ??
      stripHtmlTags(eyebrowT?.description) ??
      '',
    headingLead:
      trimToNull(heroOverrideT?.extraInfo) ?? trimToNull(headingT?.name) ?? '',
    headingAccent: heroOverrideT ? '' : (trimToNull(headingT?.extraInfo) ?? ''),
    lead:
      trimToNull(heroOverrideT?.shortDescription) ??
      trimToNull(
        leadArticle ? getArticleTranslation(leadArticle, langId).name : null
      ) ??
      '',
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
    } as any,
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

  const items: WhyItemContent[] = getVisibleArticles(whyCategory)
    .filter((a) => a.rank !== B2B_WHY_ARTICLE_RANKS.header)
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      const englishT = getArticleTranslation(article, localeToLangId.en);
      return {
        key: slugify(englishT.name),
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
  langId: number,
  fallback: ServicesContent
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

  const cmsItems = B2B_SERVICES_PRODUCT_ARTICLE_IDS.map((id) => {
    const article = getArticleById(servicesCategory, id);
    if (!article) return null;
    const t = getArticleTranslation(article, langId);
    const summary = trimToNull(t.shortDescription) ?? trimToNull(t.extraInfo);
    return {
      title: trimToNull(t.name) ?? '',
      body: summary,
    };
  });

  const items = fallback.items.map((item, index) => {
    const cms = cmsItems[index];
    if (!cms) return item;

    return {
      ...item,
      title: cms.title || item.title,
      body: cms.body ?? item.body,
      outcome: cms.body ?? item.outcome,
    };
  });

  return {
    titleLead: trimToNull(headerT?.name) ?? fallback.titleLead,
    titleAccent: trimToNull(headerT?.extraInfo) ?? fallback.titleAccent,
    body:
      trimToNull(
        bodyArticle ? getArticleTranslation(bodyArticle, langId).name : null
      ) ?? fallback.body,
    trustChips: fallback.trustChips,
    previewLabel: fallback.previewLabel,
    dashboard: fallback.dashboard,
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

  // CMS `rank` is unreliable here (two step articles share rank 3) — the
  // intended order is stored in each article's `extraInfo` ("1", "2", "3").
  const items = getVisibleArticles(stepsCategory)
    .filter((a) => a.rank !== B2B_STEPS_ARTICLE_RANKS.header)
    .map((article) => {
      const t = getArticleTranslation(article, langId);
      return {
        order: Number(t.extraInfo) || Number.MAX_SAFE_INTEGER,
        title: trimToNull(t.name) ?? '',
        body: trimToNull(t.shortDescription) ?? '',
      };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ title, body }) => ({ title, body }));

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

// ─── Business section ─────────────────────────────────────────────────────────

const EMPTY_BUSINESS: HomeBusinessContent = {
  eyebrow: '',
  title: '',
  accent: '',
  body: '',
  points: [],
  tabs: [],
  metrics: [],
  employees: [],
  primaryAction: { label: '', path: null },
  secondaryAction: { label: '', path: null },
};

function toBusinessAction(
  article: ArticleDto | null,
  langId: number,
  fallback: HomeActionContent
): HomeActionContent {
  if (!article)
    return { label: fallback.label, path: trimToNull(fallback.path) };
  const t = getArticleTranslation(article, langId);
  return {
    label: trimToNull(t.name) ?? '',
    path: trimToNull(article.path) ?? trimToNull(fallback.path),
  };
}

function mapBusinessContent(
  businessCategory: CategoryDto | null,
  langId: number
): HomeBusinessContent {
  if (!businessCategory) return EMPTY_BUSINESS;

  const headerArticle = getArticleById(
    businessCategory,
    B2B_BUSINESS_ARTICLE_IDS.header
  );
  const primaryActionArticle = getArticleById(
    businessCategory,
    B2B_BUSINESS_ARTICLE_IDS.primaryAction
  );
  const secondaryActionArticle = getArticleById(
    businessCategory,
    B2B_BUSINESS_ARTICLE_IDS.secondaryAction
  );
  const headerT = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  const pointArticles = getArticlesByIds(
    businessCategory,
    B2B_BUSINESS_ARTICLE_IDS.points
  );

  const tabsArticle = getArticleById(
    businessCategory,
    B2B_BUSINESS_ARTICLE_IDS.tabs
  );
  const tabsT = tabsArticle ? getArticleTranslation(tabsArticle, langId) : null;

  const metricArticles = getArticlesByIds(
    businessCategory,
    B2B_BUSINESS_ARTICLE_IDS.metrics
  );
  const employeeArticles = getArticlesByIds(
    businessCategory,
    B2B_BUSINESS_ARTICLE_IDS.employees
  );

  return {
    eyebrow: trimToNull(headerT?.shortDescription) ?? EMPTY_BUSINESS.eyebrow,
    title: trimToNull(headerT?.name) ?? EMPTY_BUSINESS.title,
    accent: trimToNull(headerT?.extraInfo) ?? EMPTY_BUSINESS.accent,
    body: stripHtmlTags(headerT?.description) ?? EMPTY_BUSINESS.body,
    points:
      pointArticles.length > 0
        ? pointArticles.map(
            (a) => trimToNull(getArticleTranslation(a, langId).name) ?? ''
          )
        : EMPTY_BUSINESS.points,
    tabs: tabsT
      ? [
          trimToNull(tabsT.name),
          trimToNull(tabsT.shortDescription),
          trimToNull(tabsT.extraInfo),
        ].filter((t): t is string => Boolean(t))
      : EMPTY_BUSINESS.tabs,
    metrics:
      metricArticles.length > 0
        ? metricArticles.map((a) => {
            const t = getArticleTranslation(a, langId);
            return {
              value: trimToNull(t.name) ?? '',
              label: stripHtmlTags(t.description) ?? '',
            };
          })
        : EMPTY_BUSINESS.metrics,
    employees:
      employeeArticles.length > 0
        ? employeeArticles.map((a) => {
            const t = getArticleTranslation(a, langId);
            return {
              name: trimToNull(t.name) ?? '',
              exam: stripHtmlTags(t.description) ?? '',
              status: trimToNull(t.shortDescription) ?? '',
            };
          })
        : EMPTY_BUSINESS.employees,
    primaryAction: toBusinessAction(
      primaryActionArticle,
      langId,
      EMPTY_BUSINESS.primaryAction
    ),
    secondaryAction: toBusinessAction(
      secondaryActionArticle,
      langId,
      EMPTY_BUSINESS.secondaryAction
    ),
  };
}

// ─── Journey ──────────────────────────────────────────────────────────────────

export interface JourneyStageContent {
  number: string;
  title: string;
  description: string;
}

export interface JourneyContent {
  stages: JourneyStageContent[];
}

function mapJourneyContent(
  rootCategory: CategoryDto | null,
  langId: number
): JourneyContent {
  const journeyCategory = getChildCategoryById(
    rootCategory,
    B2B_JOURNEY_CATEGORY_ID
  );

  const stages = B2B_JOURNEY_STAGE_ARTICLE_IDS.map((id, index) => {
    const article = getArticleById(journeyCategory, id);
    const t = article ? getArticleTranslation(article, langId) : null;
    return {
      number: String(index + 1).padStart(2, '0'),
      title: trimToNull(t?.name) ?? '',
      body: trimToNull(t?.extraInfo) ?? '',
    };
  }).filter((stage) => stage.title || stage.body);

  return {
    stages: stages.map((stage) => ({
      number: stage.number,
      title: stage.title,
      description: stage.body,
    })),
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FaqItemContent {
  question: string;
  answer: string;
}

export interface FaqContent {
  title: string;
  items: FaqItemContent[];
}

function mapFaqContent(
  rootCategory: CategoryDto | null,
  langId: number,
  title: string
): FaqContent {
  const faqCategory = getChildCategoryById(rootCategory, B2B_FAQ_CATEGORY_ID);

  const items = B2B_FAQ_ARTICLE_IDS.map((id) => {
    const article = getArticleById(faqCategory, id);
    const t = article ? getArticleTranslation(article, langId) : null;
    return {
      question: trimToNull(t?.name) ?? '',
      answer: trimToNull(t?.shortDescription) ?? '',
    };
  }).filter((item) => item.question || item.answer);

  return { title, items };
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

export type B2BPageContent = Omit<Dictionary['b2b'], 'why' | 'faq'> & {
  why: WhyContent;
  companies: HomeCompaniesContent;
  business: HomeBusinessContent;
  journey: JourneyContent;
  faq: FaqContent;
};

function buildB2BContent(
  dict: Dictionary,
  rootCategory: CategoryDto | null,
  companiesCategory: CategoryDto | null,
  business: HomeBusinessContent,
  langId: number
): B2BPageContent {
  return {
    meta: dict.b2b.meta,
    hero: mapHeroContent(rootCategory, langId),
    why: mapWhyContent(rootCategory, langId),
    services: mapServicesContent(rootCategory, langId, dict.b2b.services),
    steps: mapStepsContent(rootCategory, langId),
    finalCta: mapFinalCtaContent(rootCategory, langId),
    companies: mapB2BCompaniesContent(companiesCategory),
    business,
    journey: mapJourneyContent(rootCategory, langId),
    faq: mapFaqContent(rootCategory, langId, dict.b2b.faq.title),
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
      console.error('[b2b-content] Failed to fetch companies category.', error);
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
  const businessCategory = getChildCategoryById(
    rootCategory,
    B2B_BUSINESS_CATEGORY_ID
  );
  return buildB2BContent(
    dict,
    rootCategory,
    companiesCategory,
    mapBusinessContent(businessCategory, langId),
    langId
  );
}
