import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type {
  HomeAcademyContent,
  HomeActionContent,
  HomeAppContent,
  HomeBookingContent,
  HomeBusinessContent,
  HomeCompaniesContent,
  HomeFinalCtaContent,
  HomeFooterContent,
  HomeHeaderContent,
  HomeHeroContent,
  HomeHeroStatContent,
  HomeImageContent,
  HomeLinkItemContent,
  HomePageContent,
  HomeServicesContent,
  HomeStatsContent,
  HomeStatsItemContent,
  HomeStepsContent,
  HomeTestimonialContent,
  HomeWhyContent,
} from '../home.types';
import {
  ACADEMY_ARTICLE_RANKS,
  APP_ARTICLE_RANKS,
  APP_CHILD_CATEGORY_IDS,
  BOOKING_ARTICLE_RANKS,
  BOOKING_CHILD_CATEGORY_IDS,
  BUSINESS_ARTICLE_RANKS,
  BUSINESS_CHILD_CATEGORY_IDS,
  COMPANIES_CATEGORY_ID,
  FINAL_CTA_ARTICLE_RANKS,
  FINAL_CTA_CATEGORY_ID,
  FOOTER_ARTICLE_RANKS,
  FOOTER_CATEGORY_ID,
  FOOTER_CHILD_CATEGORY_IDS,
  HEADER_ARTICLE_RANKS,
  HEADER_CATEGORY_ID,
  HERO_CHILD_CATEGORY_IDS,
  HERO_WORDS_ARTICLE_RANKS,
  HOME_CONTENT_API_BASE_URL,
  HOME_CONTENT_CACHE_TAG,
  HOME_CONTENT_REVALIDATE_SECONDS,
  HOME_CONTENT_ROOT_CATEGORY_ID,
  HOME_SECTION_IDS,
  SERVICES_ARTICLE_RANKS,
  STATS_ARTICLE_RANKS,
  STEPS_ARTICLE_RANKS,
  STEPS_CHILD_CATEGORY_IDS,
  WHY_ARTICLE_RANKS,
} from './homeContent.config';
import { buildEmptyHomeFallback } from './homeContent.fallback';
import type {
  RecursiveArticleCategoryDto,
  RecursiveArticleCategoryResponse,
  RecursiveArticleDto,
} from './articleCategory.dto';
import { stripHtmlToNull } from '@/shared/lib/text';

interface CmsTranslationSnapshot {
  name: string;
  description: string | null;
  shortDescription: string | null;
  extraInfo: string | null;
}

type HeroStatSnapshot = HomeHeroStatContent;

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

function getChildCategoryById(
  category: RecursiveArticleCategoryDto | null,
  id: number
): RecursiveArticleCategoryDto | null {
  return (
    getVisibleChildren(category).find((child) => child.id === id) ?? null
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
): CmsTranslationSnapshot {
  const translation = getPreferredTranslation(article.translations, langId);

  return {
    name: translation?.name ?? '',
    description: stripHtmlToNull(translation?.description) ?? null,
    shortDescription: translation?.shortDescription ?? null,
    extraInfo: translation?.extraInfo ?? null,
  };
}

function trimToNull(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function splitTitleParts(
  value: string,
  delimiter: string
): { title: string; accent: string } {
  const normalized = value.trim();

  if (!normalized) {
    return {
      title: '',
      accent: '',
    };
  }

  const parts = normalized.split(delimiter);
  const first = parts.shift()?.trim() ?? normalized;
  const rest = parts.join(delimiter).trim();

  return {
    title:
      delimiter === '.'
        ? first.endsWith('.') || !rest
          ? first
          : `${first}.`
        : first,
    accent: rest,
  };
}

function parseStatValue(value: string): Omit<HeroStatSnapshot, 'label'> | null {
  const normalized = value.replace(/\s+/g, '').toUpperCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(K\+|\+|%)?$/);

  if (!match) {
    return null;
  }

  const numericValue = Number(match[1]);
  const suffix = match[2];

  if (Number.isNaN(numericValue)) {
    return null;
  }

  if (suffix === 'K+') {
    return {
      value: numericValue * 1000,
      suffix,
    };
  }

  if (suffix) {
    return {
      value: numericValue,
      suffix,
    };
  }

  const decimalDigits = match[1]?.split('.')[1]?.length ?? 0;

  return {
    value: numericValue,
    decimals: decimalDigits > 0 ? decimalDigits : undefined,
  };
}

function parseRatingMeta(extraInfo: string | null): {
  ratingValue: string;
  ratingCount: string;
} {
  const [ratingValue = '', ratingCount = ''] = (extraInfo ?? '').split('|');

  return {
    ratingValue: ratingValue.trim(),
    ratingCount: ratingCount.trim().replace(/^\(/, '').replace(/\)$/, ''),
  };
}

function splitImageList(
  images?: string | null,
  alt?: string
): HomeImageContent[] {
  return (images ?? '')
    .split(',')
    .map((value) => resolveCmsAssetUrl(value))
    .filter((src): src is string => Boolean(src))
    .map((src) => ({ src, alt }));
}

function resolveCmsAssetUrl(value: string | null | undefined): string | null {
  const trimmed = trimToNull(value);

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/\\/g, '/');

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/demo-assets/')) {
    return normalized;
  }

  const baseUrl = HOME_CONTENT_API_BASE_URL.replace(/\/+$/, '');
  const relativePath = normalized.replace(/^\/+/, '');

  return `${baseUrl}/${relativePath}`;
}

function extractIconKey(image: string | null | undefined): string | null {
  const trimmed = trimToNull(image);

  if (!trimmed) {
    return null;
  }

  const lastSegment = trimmed
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .at(-1);

  if (!lastSegment || lastSegment.includes('.')) {
    return null;
  }

  return lastSegment;
}

function toActionContent(
  article: RecursiveArticleDto | null,
  langId: number,
  fallback?: HomeActionContent
): HomeActionContent {
  if (!article) {
    return {
      label: '',
      path: trimToNull(fallback?.path),
    };
  }

  const translation = getArticleTranslation(article, langId);

  return {
    label: trimToNull(translation.name) ?? '',
    path: trimToNull(article.path) ?? trimToNull(fallback?.path),
  };
}

function toOptionalActionContent(
  article: RecursiveArticleDto | null,
  langId: number,
  fallback?: HomeActionContent
): HomeActionContent | null {
  const action = toActionContent(article, langId, fallback);
  return action.label.trim() ? action : null;
}

function toLinkItemContent(
  article: RecursiveArticleDto,
  langId: number
): HomeLinkItemContent {
  const translation = getArticleTranslation(article, langId);

  return {
    label: translation.name,
    path: trimToNull(article.path),
    iconKey: extractIconKey(article.image),
  };
}

function mapHeroStats(
  category: RecursiveArticleCategoryDto | null,
  langId: number,
  fallbackStats: readonly HomeHeroStatContent[]
): HeroStatSnapshot[] {
  const articles = getVisibleArticles(category);

  if (articles.length === 0) {
    return [...fallbackStats];
  }

  return articles.map((article, index) => {
    const localized = getArticleTranslation(article, langId);
    const english = getArticleTranslation(article, localeToLangId.en);
    const parsed =
      parseStatValue(localized.name) ?? parseStatValue(english.name);
    const fallback = fallbackStats[index];

    if (!parsed) {
      return (
        fallback ?? {
          value: 0,
          label: localized.description ?? english.description ?? localized.name,
        }
      );
    }

    return {
      ...parsed,
      label:
        trimToNull(localized.description) ??
        trimToNull(english.description) ??
        fallback?.label ??
        localized.name,
    };
  });
}


function mapHeroContent(
  fallback: HomeHeroContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeHeroContent {
  const heroCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.hero
  );

  if (!heroCategory) {
    return fallback;
  }

  const wordsCategory = getChildCategoryById(
    heroCategory,
    HERO_CHILD_CATEGORY_IDS.words
  );
  const rotatingWordsArticle = getArticleByRank(
    wordsCategory,
    HERO_WORDS_ARTICLE_RANKS.rotatingWords
  );
  const contentArticle = getArticleByRank(
    wordsCategory,
    HERO_WORDS_ARTICLE_RANKS.content
  );
  const contentTranslation = contentArticle
    ? getArticleTranslation(contentArticle, langId)
    : null;
  const rotatingWordsTranslation = rotatingWordsArticle
    ? getArticleTranslation(rotatingWordsArticle, langId)
    : null;
  const actionsCategory = getChildCategoryById(
    heroCategory,
    HERO_CHILD_CATEGORY_IDS.actions
  );
  const primaryAction = getArticleByRank(actionsCategory, 10);
  const secondaryAction = getArticleByRank(actionsCategory, 20);
  const metricsCategory = getChildCategoryById(
    heroCategory,
    HERO_CHILD_CATEGORY_IDS.metrics
  );
  const phoneUiCategory = getChildCategoryById(
    heroCategory,
    HERO_CHILD_CATEGORY_IDS.phoneUi
  );
  const greetingArticle = getArticleByRank(phoneUiCategory, 10);
  const servicesArticle = getArticleByRank(phoneUiCategory, 20);
  const liveArticle = getArticleByRank(phoneUiCategory, 30);
  const phoneTilesCategory = getChildCategoryById(
    heroCategory,
    HERO_CHILD_CATEGORY_IDS.phoneTiles
  );
  const floatingCardsCategory = getChildCategoryById(
    heroCategory,
    HERO_CHILD_CATEGORY_IDS.floatingCards
  );

  const greetingTranslation = greetingArticle
    ? getArticleTranslation(greetingArticle, langId)
    : null;
  const servicesTranslation = servicesArticle
    ? getArticleTranslation(servicesArticle, langId)
    : null;
  const liveTranslation = liveArticle
    ? getArticleTranslation(liveArticle, langId)
    : null;

  return {
    badge: trimToNull(contentTranslation?.shortDescription) ?? fallback.badge,
    badgeImages:
      splitImageList(
        contentArticle?.images,
        fallback.badge || fallback.titleLead
      ).length > 0
        ? splitImageList(
            contentArticle?.images,
            fallback.badge || fallback.titleLead
          )
        : fallback.badgeImages,
    titleLead: trimToNull(contentTranslation?.name) ?? fallback.titleLead,
    titleMiddle:
      trimToNull(contentTranslation?.extraInfo) ?? fallback.titleMiddle,
    rotatingWords: rotatingWordsTranslation
      ? [
          trimToNull(rotatingWordsTranslation.name),
          trimToNull(rotatingWordsTranslation.shortDescription),
          trimToNull(rotatingWordsTranslation.extraInfo),
        ].filter((word): word is string => Boolean(word))
      : fallback.rotatingWords,
    subtitle: trimToNull(contentTranslation?.description) ?? fallback.subtitle,
    primaryAction: toActionContent(
      primaryAction,
      langId,
      fallback.primaryAction
    ),
    secondaryAction: toActionContent(
      secondaryAction,
      langId,
      fallback.secondaryAction
    ),
    stats: mapHeroStats(metricsCategory, langId, fallback.stats),
    phoneGreeting:
      trimToNull(greetingTranslation?.name) ?? fallback.phoneGreeting,
    phoneName: trimToNull(greetingTranslation?.extraInfo) ?? fallback.phoneName,
    phoneSearchPlaceholder:
      trimToNull(greetingTranslation?.shortDescription) ??
      fallback.phoneSearchPlaceholder,
    servicesTitle:
      trimToNull(servicesTranslation?.name) ?? fallback.servicesTitle,
    servicesLink:
      trimToNull(servicesTranslation?.extraInfo) ?? fallback.servicesLink,
    phoneTiles:
      getVisibleArticles(phoneTilesCategory).length > 0
        ? getVisibleArticles(phoneTilesCategory).map((article) => {
            const translation = getArticleTranslation(article, langId);

            return {
              title: trimToNull(translation.name) ?? '',
              subtitle: trimToNull(translation.shortDescription) ?? '',
              iconKey: extractIconKey(article.image),
            };
          })
        : fallback.phoneTiles,
    liveBookings: trimToNull(liveTranslation?.name) ?? fallback.liveBookings,
    liveBookingsLabel:
      trimToNull(liveTranslation?.description) ?? fallback.liveBookingsLabel,
    floatingCards:
      getVisibleArticles(floatingCardsCategory).length > 0
        ? getVisibleArticles(floatingCardsCategory).map((article) => {
            const translation = getArticleTranslation(article, langId);

            return {
              title: trimToNull(translation.name) ?? '',
              detail: trimToNull(translation.description) ?? '',
            };
          })
        : fallback.floatingCards,
  };
}

function mapServicesContent(
  fallback: HomeServicesContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeServicesContent {
  const servicesCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.services
  );

  if (!servicesCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(
    servicesCategory,
    SERVICES_ARTICLE_RANKS.header
  );
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;
  const items = getVisibleArticles(servicesCategory)
    .filter((article) => article.rank !== SERVICES_ARTICLE_RANKS.header)
    .map((article) => {
      const translation = getArticleTranslation(article, langId);

      return {
        title: trimToNull(translation.name) ?? '',
        description: trimToNull(translation.description) ?? '',
        path: trimToNull(article.path),
        iconKey: extractIconKey(article.image),
      };
    });

  return {
    eyebrow:
      trimToNull(headerTranslation?.shortDescription) ?? fallback.eyebrow,
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    accent: trimToNull(headerTranslation?.extraInfo) ?? fallback.accent,
    body: trimToNull(headerTranslation?.description) ?? fallback.body,
    items: items.length > 0 ? items : fallback.items,
  };
}

function mapWhyContent(
  fallback: HomeWhyContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeWhyContent {
  const whyCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.why
  );

  if (!whyCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(whyCategory, WHY_ARTICLE_RANKS.header);
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  return {
    eyebrow:
      trimToNull(headerTranslation?.shortDescription) ?? fallback.eyebrow,
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    items: (() => {
      const items = getVisibleArticles(whyCategory)
        .filter((article) => article.rank !== WHY_ARTICLE_RANKS.header)
        .map((article) => {
          const translation = getArticleTranslation(article, langId);

          return {
            title: trimToNull(translation.name) ?? '',
            description: trimToNull(translation.description) ?? '',
            iconKey: extractIconKey(article.image),
          };
        });

      return items.length > 0 ? items : fallback.items;
    })(),
  };
}

function mapBookingContent(
  fallback: HomeBookingContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeBookingContent {
  const bookingCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.booking
  );

  if (!bookingCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(
    bookingCategory,
    BOOKING_ARTICLE_RANKS.header
  );
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;
  const fieldsCategory = getChildCategoryById(
    bookingCategory,
    BOOKING_CHILD_CATEGORY_IDS.fields
  );
  const optionsCategory = getChildCategoryById(
    bookingCategory,
    BOOKING_CHILD_CATEGORY_IDS.options
  );
  const examField = getArticleByRank(fieldsCategory, 10);
  const cityField = getArticleByRank(fieldsCategory, 20);
  const dateField = getArticleByRank(fieldsCategory, 30);
  const searchField = getArticleByRank(fieldsCategory, 40);

  return {
    eyebrow:
      trimToNull(headerTranslation?.shortDescription) ?? fallback.eyebrow,
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    note: trimToNull(headerTranslation?.description) ?? fallback.note,
    fields: {
      exam: {
        label:
          trimToNull(
            examField ? getArticleTranslation(examField, langId).name : null
          ) ?? fallback.fields.exam.label,
        placeholder:
          trimToNull(
            examField
              ? getArticleTranslation(examField, langId).shortDescription
              : null
          ) ?? fallback.fields.exam.placeholder,
      },
      city: {
        label:
          trimToNull(
            cityField ? getArticleTranslation(cityField, langId).name : null
          ) ?? fallback.fields.city.label,
        placeholder:
          trimToNull(
            cityField
              ? getArticleTranslation(cityField, langId).shortDescription
              : null
          ) ?? fallback.fields.city.placeholder,
      },
      date: {
        label:
          trimToNull(
            dateField ? getArticleTranslation(dateField, langId).name : null
          ) ?? fallback.fields.date.label,
        placeholder:
          trimToNull(
            dateField
              ? getArticleTranslation(dateField, langId).shortDescription
              : null
          ) ?? fallback.fields.date.placeholder,
      },
      search: toActionContent(searchField, langId, fallback.fields.search),
    },
    examOptions:
      getVisibleArticles(optionsCategory).length > 0
        ? getVisibleArticles(optionsCategory).map(
            (article) => getArticleTranslation(article, langId).name
          )
        : fallback.examOptions,
  };
}

function mapStepsContent(
  fallback: HomeStepsContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeStepsContent {
  const stepsCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.steps
  );

  if (!stepsCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(
    stepsCategory,
    STEPS_ARTICLE_RANKS.header
  );
  const ctaArticle = getArticleByRank(stepsCategory, STEPS_ARTICLE_RANKS.cta);
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;
  const stepCategories = [
    getChildCategoryById(stepsCategory, STEPS_CHILD_CATEGORY_IDS.first),
    getChildCategoryById(stepsCategory, STEPS_CHILD_CATEGORY_IDS.second),
    getChildCategoryById(stepsCategory, STEPS_CHILD_CATEGORY_IDS.third),
  ];

  return {
    eyebrow:
      trimToNull(headerTranslation?.shortDescription) ?? fallback.eyebrow,
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    highlight: trimToNull(headerTranslation?.extraInfo) ?? fallback.highlight,
    cta: toActionContent(ctaArticle, langId, fallback.cta),
    items: stepCategories.every(Boolean)
      ? stepCategories.map((category, index) => {
          const contentArticle = getArticleByRank(category, 1);
          const meta1Article = getArticleByRank(category, 10);
          const meta2Article = getArticleByRank(category, 20);
          const fallbackItem = fallback.items[index];

          return {
            title:
              trimToNull(
                contentArticle
                  ? getArticleTranslation(contentArticle, langId).name
                  : null
              ) ??
              fallbackItem?.title ??
              '',
            body:
              trimToNull(
                contentArticle
                  ? getArticleTranslation(contentArticle, langId).description
                  : null
              ) ??
              fallbackItem?.body ??
              '',
            meta1: {
              value:
                trimToNull(
                  meta1Article
                    ? getArticleTranslation(meta1Article, langId).name
                    : null
                ) ??
                fallbackItem?.meta1.value ??
                '',
              label:
                trimToNull(
                  meta1Article
                    ? getArticleTranslation(meta1Article, langId).description
                    : null
                ) ??
                fallbackItem?.meta1.label ??
                '',
            },
            meta2: {
              value:
                trimToNull(
                  meta2Article
                    ? getArticleTranslation(meta2Article, langId).name
                    : null
                ) ??
                fallbackItem?.meta2.value ??
                '',
              label:
                trimToNull(
                  meta2Article
                    ? getArticleTranslation(meta2Article, langId).description
                    : null
                ) ??
                fallbackItem?.meta2.label ??
                '',
            },
          };
        })
      : fallback.items,
  };
}

function mapAppContent(
  fallback: HomeAppContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeAppContent {
  const appCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.app
  );

  if (!appCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(appCategory, APP_ARTICLE_RANKS.header);
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;
  const scheduleCategory = getChildCategoryById(
    appCategory,
    APP_CHILD_CATEGORY_IDS.schedule
  );
  const statusCategory = getChildCategoryById(
    appCategory,
    APP_CHILD_CATEGORY_IDS.status
  );
  const reportsCategory = getChildCategoryById(
    appCategory,
    APP_CHILD_CATEGORY_IDS.reports
  );
  const pointsCategory = getChildCategoryById(
    appCategory,
    APP_CHILD_CATEGORY_IDS.points
  );
  const linksCategory = getChildCategoryById(
    appCategory,
    APP_CHILD_CATEGORY_IDS.links
  );

  const scheduleHeader = getArticleByRank(scheduleCategory, 1);
  const scheduleAppointment = getArticleByRank(scheduleCategory, 10);
  const statusHeader = getArticleByRank(statusCategory, 1);
  const reportsHeader = getArticleByRank(reportsCategory, 1);
  const reportItems = getVisibleArticles(reportsCategory).filter(
    (article) => article.rank > 1
  );

  return {
    eyebrow:
      trimToNull(headerTranslation?.shortDescription) ?? fallback.eyebrow,
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    accent: trimToNull(headerTranslation?.extraInfo) ?? fallback.accent,
    body: trimToNull(headerTranslation?.description) ?? fallback.body,
    scheduleCard: {
      label:
        trimToNull(
          scheduleHeader
            ? getArticleTranslation(scheduleHeader, langId).name
            : null
        ) ?? fallback.scheduleCard.label,
      detail:
        trimToNull(
          scheduleHeader
            ? getArticleTranslation(scheduleHeader, langId).description
            : null
        ) ?? fallback.scheduleCard.detail,
      appointment: {
        value:
          trimToNull(
            scheduleAppointment
              ? getArticleTranslation(scheduleAppointment, langId).name
              : null
          ) ?? fallback.scheduleCard.appointment.value,
        detail:
          trimToNull(
            scheduleAppointment
              ? getArticleTranslation(scheduleAppointment, langId).description
              : null
          ) ?? fallback.scheduleCard.appointment.detail,
        location:
          trimToNull(
            scheduleAppointment
              ? getArticleTranslation(scheduleAppointment, langId)
                  .shortDescription
              : null
          ) ?? fallback.scheduleCard.appointment.location,
        iconKey:
          extractIconKey(scheduleAppointment?.image) ??
          fallback.scheduleCard.appointment.iconKey,
      },
    },
    statusCard: {
      label:
        trimToNull(
          statusHeader ? getArticleTranslation(statusHeader, langId).name : null
        ) ?? fallback.statusCard.label,
      detail:
        trimToNull(
          statusHeader
            ? getArticleTranslation(statusHeader, langId).description
            : null
        ) ?? fallback.statusCard.detail,
      status:
        trimToNull(
          statusHeader
            ? getArticleTranslation(statusHeader, langId).shortDescription
            : null
        ) ?? fallback.statusCard.status,
    },
    reportsCard: {
      label:
        trimToNull(
          reportsHeader
            ? getArticleTranslation(reportsHeader, langId).name
            : null
        ) ?? fallback.reportsCard.label,
      detail:
        trimToNull(
          reportsHeader
            ? getArticleTranslation(reportsHeader, langId).description
            : null
        ) ?? fallback.reportsCard.detail,
      status:
        trimToNull(
          reportsHeader
            ? getArticleTranslation(reportsHeader, langId).shortDescription
            : null
        ) ?? fallback.reportsCard.status,
      items:
        reportItems.length > 0
          ? reportItems.map((article) => {
              const translation = getArticleTranslation(article, langId);

              return {
                title: trimToNull(translation.name) ?? '',
                detail: trimToNull(translation.shortDescription) ?? '',
                badge: trimToNull(translation.extraInfo) ?? '',
                iconKey: extractIconKey(article.image),
              };
            })
          : fallback.reportsCard.items,
    },
    points:
      getVisibleArticles(pointsCategory).length > 0
        ? getVisibleArticles(pointsCategory).map((article) => {
            const translation = getArticleTranslation(article, langId);

            return {
              title: trimToNull(translation.name) ?? '',
              detail: trimToNull(translation.description) ?? '',
            };
          })
        : fallback.points,
    downloadLinks:
      getVisibleArticles(linksCategory).length > 0
        ? getVisibleArticles(linksCategory).map((article) => {
            const translation = getArticleTranslation(article, langId);

            return {
              label: trimToNull(translation.name) ?? '',
              path: trimToNull(article.path),
              iconKey: extractIconKey(article.image),
            };
          })
        : fallback.downloadLinks,
  };
}

function mapAcademyContent(
  fallback: HomeAcademyContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeAcademyContent {
  const academyCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.academy
  );

  if (!academyCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(
    academyCategory,
    ACADEMY_ARTICLE_RANKS.header
  );
  const ctaArticle = getArticleByRank(
    academyCategory,
    ACADEMY_ARTICLE_RANKS.cta
  );
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  return {
    eyebrow:
      trimToNull(headerTranslation?.shortDescription) ?? fallback.eyebrow,
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    accent: trimToNull(headerTranslation?.extraInfo) ?? fallback.accent,
    ctaLabel:
      trimToNull(
        ctaArticle ? getArticleTranslation(ctaArticle, langId).name : null
      ) ?? fallback.ctaLabel,
    items: (() => {
      const items = getVisibleArticles(academyCategory)
        .filter((article) => article.rank > ACADEMY_ARTICLE_RANKS.cta)
        .map((article) => {
          const translation = getArticleTranslation(article, langId);
          const rating = parseRatingMeta(translation.extraInfo);

          return {
            title: trimToNull(translation.name) ?? '',
            detail: trimToNull(translation.description) ?? '',
            meta: trimToNull(translation.shortDescription) ?? '',
            ratingValue: rating.ratingValue,
            ratingCount: rating.ratingCount,
            path: trimToNull(article.path),
            iconKey: extractIconKey(article.image),
          };
        });

      return items.length > 0 ? items : fallback.items;
    })(),
  };
}

function mapStatsContent(
  fallback: HomeStatsContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeStatsContent {
  const statsCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.stats
  );

  if (!statsCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(
    statsCategory,
    STATS_ARTICLE_RANKS.header
  );
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;
  const items = getVisibleArticles(statsCategory)
    .filter((article) => article.rank !== STATS_ARTICLE_RANKS.header)
    .map((article, index) => {
      const translation = getArticleTranslation(article, langId);
      const english = getArticleTranslation(article, localeToLangId.en);
      const parsed =
        parseStatValue(translation.name) ?? parseStatValue(english.name);
      const fallbackItem = fallback.items[index];

      return {
        value: parsed?.value ?? fallbackItem?.value ?? 0,
        suffix: parsed?.suffix ?? fallbackItem?.suffix,
        decimals: parsed?.decimals ?? fallbackItem?.decimals,
        label:
          trimToNull(translation.description) ??
          trimToNull(english.description) ??
          fallbackItem?.label ??
          '',
      } satisfies HomeStatsItemContent;
    });

  return {
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    items: items.length > 0 ? items : fallback.items,
  };
}

function mapBusinessContent(
  fallback: HomeBusinessContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeBusinessContent {
  const businessCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.business
  );

  if (!businessCategory) {
    return fallback;
  }

  const headerArticle = getArticleByRank(
    businessCategory,
    BUSINESS_ARTICLE_RANKS.header
  );
  const primaryActionArticle = getArticleByRank(
    businessCategory,
    BUSINESS_ARTICLE_RANKS.primaryAction
  );
  const secondaryActionArticle = getArticleByRank(
    businessCategory,
    BUSINESS_ARTICLE_RANKS.secondaryAction
  );
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;
  const pointArticles = getVisibleArticles(businessCategory).filter(
    (article) =>
      article.rank >= BUSINESS_ARTICLE_RANKS.pointStart &&
      article.rank < BUSINESS_ARTICLE_RANKS.primaryAction
  );
  const tabsCategory = getChildCategoryById(
    businessCategory,
    BUSINESS_CHILD_CATEGORY_IDS.tabs
  );
  const tabsArticle = getArticleByRank(tabsCategory, 1);
  const tabsTranslation = tabsArticle
    ? getArticleTranslation(tabsArticle, langId)
    : null;
  const metricsCategory = getChildCategoryById(
    businessCategory,
    BUSINESS_CHILD_CATEGORY_IDS.metrics
  );
  const employeesCategory = getChildCategoryById(
    businessCategory,
    BUSINESS_CHILD_CATEGORY_IDS.employees
  );

  return {
    eyebrow:
      trimToNull(headerTranslation?.shortDescription) ?? fallback.eyebrow,
    title: trimToNull(headerTranslation?.name) ?? fallback.title,
    accent: trimToNull(headerTranslation?.extraInfo) ?? fallback.accent,
    body: trimToNull(headerTranslation?.description) ?? fallback.body,
    points:
      pointArticles.length > 0
        ? pointArticles.map(
            (article) =>
              trimToNull(getArticleTranslation(article, langId).name) ?? ''
          )
        : fallback.points,
    tabs: tabsTranslation
      ? [
          trimToNull(tabsTranslation.name),
          trimToNull(tabsTranslation.shortDescription),
          trimToNull(tabsTranslation.extraInfo),
        ].filter((tab): tab is string => Boolean(tab))
      : fallback.tabs,
    metrics:
      getVisibleArticles(metricsCategory).length > 0
        ? getVisibleArticles(metricsCategory).map((article) => {
            const translation = getArticleTranslation(article, langId);

            return {
              value: trimToNull(translation.name) ?? '',
              label: trimToNull(translation.description) ?? '',
            };
          })
        : fallback.metrics,
    employees:
      getVisibleArticles(employeesCategory).length > 0
        ? getVisibleArticles(employeesCategory).map((article) => {
            const translation = getArticleTranslation(article, langId);

            return {
              name: trimToNull(translation.name) ?? '',
              exam: trimToNull(translation.description) ?? '',
              status: trimToNull(translation.shortDescription) ?? '',
            };
          })
        : fallback.employees,
    primaryAction: toActionContent(
      primaryActionArticle,
      langId,
      fallback.primaryAction
    ),
    secondaryAction: toActionContent(
      secondaryActionArticle,
      langId,
      fallback.secondaryAction
    ),
  };
}

function mapTestimonialContent(
  fallback: HomeTestimonialContent[],
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeTestimonialContent[] {
  const testimonialCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.testimonial
  );
  const articles = getVisibleArticles(testimonialCategory);

  if (articles.length === 0) {
    return fallback;
  }

  return articles.map((article) => {
    const translation = getArticleTranslation(article, langId);
    const fb = fallback[0] ?? {
      quote: '',
      highlight: '',
      author: '',
      role: '',
    };
    return {
      quote: trimToNull(translation.name) ?? fb.quote,
      highlight: trimToNull(translation.extraInfo) ?? fb.highlight,
      author: trimToNull(translation.shortDescription) ?? fb.author,
      role: trimToNull(translation.description) ?? fb.role,
    };
  });
}

export function mapHeaderContent(
  fallback: HomeHeaderContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeHeaderContent {
  const headerCategory = getChildCategoryById(rootCategory, HEADER_CATEGORY_ID);

  if (!headerCategory) {
    return fallback;
  }

  const brandArticle = getArticleByRank(
    headerCategory,
    HEADER_ARTICLE_RANKS.brand
  );
  const primaryArticle = getArticleByRank(
    headerCategory,
    HEADER_ARTICLE_RANKS.primaryAction
  );
  const signInArticle = getArticleByRank(
    headerCategory,
    HEADER_ARTICLE_RANKS.signInIndividual
  );
  const localeSwitchArticle = getArticleByRank(
    headerCategory,
    HEADER_ARTICLE_RANKS.localeSwitch
  );
  const businessSignInArticle = getArticleByRank(
    headerCategory,
    HEADER_ARTICLE_RANKS.signInBusiness
  );
  const navLinks = getVisibleArticles(headerCategory)
    .filter(
      (article) =>
        article.rank >= 10 && article.rank < HEADER_ARTICLE_RANKS.primaryAction
    )
    .map((article) => toLinkItemContent(article, langId))
    .filter((link) => link.label.trim().length > 0);

  const brandTranslation = brandArticle
    ? getArticleTranslation(brandArticle, langId)
    : null;

  return {
    brandLabel: trimToNull(brandTranslation?.name) ?? fallback.brandLabel,
    brandDescription:
      trimToNull(brandTranslation?.description) ?? fallback.brandDescription,
    brandPath: trimToNull(brandArticle?.path) ?? fallback.brandPath,
    brandImageSrc:
      resolveCmsAssetUrl(brandArticle?.image) ?? fallback.brandImageSrc,
    navLinks: navLinks.length > 0 ? navLinks : fallback.navLinks,
    primaryAction: toOptionalActionContent(
      primaryArticle,
      langId,
      fallback.primaryAction ?? { label: '', path: null }
    ),
    signInAction: toOptionalActionContent(
      signInArticle,
      langId,
      fallback.signInAction ?? { label: '', path: null }
    ),
    businessSignInAction: toOptionalActionContent(
      businessSignInArticle,
      langId,
      fallback.businessSignInAction ?? { label: '', path: null }
    ),
    userMenu: fallback.userMenu,
    localeSwitchLabel:
      trimToNull(
        localeSwitchArticle
          ? getArticleTranslation(localeSwitchArticle, langId).name
          : null
      ) ?? fallback.localeSwitchLabel,
  };
}

export function mapFinalCtaContent(
  fallback: HomeFinalCtaContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeFinalCtaContent {
  const finalCtaCategory = getChildCategoryById(
    rootCategory,
    FINAL_CTA_CATEGORY_ID
  );

  if (!finalCtaCategory) {
    return fallback;
  }

  const contentArticle = getArticleByRank(
    finalCtaCategory,
    FINAL_CTA_ARTICLE_RANKS.content
  );
  const primaryActionArticle = getArticleByRank(
    finalCtaCategory,
    FINAL_CTA_ARTICLE_RANKS.primaryAction
  );
  const secondaryActionArticle = getArticleByRank(
    finalCtaCategory,
    FINAL_CTA_ARTICLE_RANKS.secondaryAction
  );
  const translation = contentArticle
    ? getArticleTranslation(contentArticle, langId)
    : null;

  return {
    title: trimToNull(translation?.name) ?? fallback.title,
    highlight: trimToNull(translation?.extraInfo) ?? fallback.highlight,
    body: trimToNull(translation?.description) ?? fallback.body,
    primaryAction: toActionContent(
      primaryActionArticle,
      langId,
      fallback.primaryAction
    ),
    secondaryAction: toActionContent(
      secondaryActionArticle,
      langId,
      fallback.secondaryAction
    ),
  };
}

function mapFooterGroup(
  category: RecursiveArticleCategoryDto | null,
  langId: number,
  fallback: HomeFooterContent['pages']
): HomeFooterContent['pages'] {
  if (!category) {
    return fallback;
  }

  const headingArticle = getArticleByRank(category, 1);
  const headingTranslation = headingArticle
    ? getArticleTranslation(headingArticle, langId)
    : null;
  const links = getVisibleArticles(category)
    .filter((article) => article.rank > 1)
    .map((article) => toLinkItemContent(article, langId));

  return {
    title: trimToNull(headingTranslation?.name) ?? fallback.title,
    links: links.length > 0 ? links : fallback.links,
  };
}

export function mapFooterContent(
  fallback: HomeFooterContent,
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeFooterContent {
  const footerCategory = getChildCategoryById(rootCategory, FOOTER_CATEGORY_ID);

  if (!footerCategory) {
    return fallback;
  }

  const brandArticle = getArticleByRank(
    footerCategory,
    FOOTER_ARTICLE_RANKS.brand
  );
  const newsletterArticle = getArticleByRank(
    footerCategory,
    FOOTER_ARTICLE_RANKS.newsletter
  );
  const copyrightArticle = getArticleByRank(
    footerCategory,
    FOOTER_ARTICLE_RANKS.copyright
  );
  const brandTranslation = brandArticle
    ? getArticleTranslation(brandArticle, langId)
    : null;
  const newsletterTranslation = newsletterArticle
    ? getArticleTranslation(newsletterArticle, langId)
    : null;
  const copyrightTranslation = copyrightArticle
    ? getArticleTranslation(copyrightArticle, langId)
    : null;

  return {
    brandLabel: trimToNull(brandTranslation?.name) ?? fallback.brandLabel,
    brandBody: trimToNull(brandTranslation?.description) ?? fallback.brandBody,
    brandPath: trimToNull(brandArticle?.path) ?? fallback.brandPath,
    brandImageSrc:
      resolveCmsAssetUrl(brandArticle?.image) ?? fallback.brandImageSrc,
    newsletterPlaceholder:
      trimToNull(newsletterTranslation?.name) ?? fallback.newsletterPlaceholder,
    newsletterEyebrow:
      trimToNull(newsletterTranslation?.shortDescription) ??
      fallback.newsletterEyebrow,
    newsletterAction:
      trimToNull(newsletterTranslation?.extraInfo) ?? fallback.newsletterAction,
    copyrightLabel:
      trimToNull(copyrightTranslation?.name) ?? fallback.copyrightLabel,
    copyrightBody:
      trimToNull(copyrightTranslation?.description) ?? fallback.copyrightBody,
    pages: mapFooterGroup(
      getChildCategoryById(footerCategory, FOOTER_CHILD_CATEGORY_IDS.pages),
      langId,
      fallback.pages
    ),
    help: mapFooterGroup(
      getChildCategoryById(footerCategory, FOOTER_CHILD_CATEGORY_IDS.help),
      langId,
      fallback.help
    ),
    contact: mapFooterGroup(
      getChildCategoryById(footerCategory, FOOTER_CHILD_CATEGORY_IDS.contact),
      langId,
      fallback.contact
    ),
  };
}

function buildHomePageContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  companiesCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomePageContent {
  const fallback = buildEmptyHomeFallback();

  return {
    header: fallback.header,
    hero: mapHeroContent(fallback.hero, rootCategory, langId),
    companies: mapCompaniesContent(companiesCategory),
    services: mapServicesContent(fallback.services, rootCategory, langId),
    why: mapWhyContent(fallback.why, rootCategory, langId),
    booking: mapBookingContent(fallback.booking, rootCategory, langId),
    steps: mapStepsContent(fallback.steps, rootCategory, langId),
    app: mapAppContent(fallback.app, rootCategory, langId),
    academy: mapAcademyContent(fallback.academy, rootCategory, langId),
    stats: mapStatsContent(fallback.stats, rootCategory, langId),
    business: mapBusinessContent(fallback.business, rootCategory, langId),
    testimonial: mapTestimonialContent(
      fallback.testimonial,
      rootCategory,
      langId
    ),
    finalCta: fallback.finalCta,
    footer: fallback.footer,
  };
}

function mapCompaniesContent(
  category: RecursiveArticleCategoryDto | null
): HomeCompaniesContent {
  return {
    items: getVisibleArticles(category)
      .filter((article) => article.image)
      .map((article) => ({
        id: article.id,
        imageSrc: resolveCmsAssetUrl(article.image),
      })),
  };
}

const fetchCompaniesCategoryTree = cache(
  async (): Promise<RecursiveArticleCategoryDto | null> => {
    const endpoint = new URL(
      '/api/General/ArticleCategory/GetRecursiveById',
      HOME_CONTENT_API_BASE_URL
    );

    endpoint.searchParams.set('Id', String(COMPANIES_CATEGORY_ID));

    try {
      const response = await fetch(endpoint.toString(), {
        cache: 'force-cache',
        next: {
          revalidate: HOME_CONTENT_REVALIDATE_SECONDS,
          tags: [HOME_CONTENT_CACHE_TAG],
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload =
        (await response.json()) as RecursiveArticleCategoryResponse;

      if (!payload.isSuccess || !payload.value) {
        return null;
      }

      return payload.value;
    } catch (error) {
      console.error(
        '[home-content] Failed to fetch companies category.',
        error
      );
      return null;
    }
  }
);

const fetchHomeContentTree = cache(
  async (): Promise<RecursiveArticleCategoryDto | null> => {
    const endpoint = new URL(
      '/api/General/ArticleCategory/GetRecursiveById',
      HOME_CONTENT_API_BASE_URL
    );

    endpoint.searchParams.set('Id', String(HOME_CONTENT_ROOT_CATEGORY_ID));

    try {
      const response = await fetch(endpoint.toString(), {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload =
        (await response.json()) as RecursiveArticleCategoryResponse;

      if (!payload.isSuccess || !payload.value) {
        return null;
      }

      return payload.value;
    } catch (error) {
      console.error(
        '[home-content] Failed to fetch recursive home content.',
        error
      );
      return null;
    }
  }
);

export const getHomePageContent = cache(
  async (locale: Locale): Promise<HomePageContent> => {
    const langId = localeToLangId[locale];
    const [rootCategory, companiesCategory] = await Promise.all([
      fetchHomeContentTree(),
      fetchCompaniesCategoryTree(),
    ]);

    return buildHomePageContent(rootCategory, companiesCategory, langId);
  }
);
