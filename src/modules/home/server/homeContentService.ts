import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type {
  HomeAcademyContent,
  HomeActionContent,
  HomeAppContent,
  HomeBookingContent,
  HomeCompaniesContent,
  HomeFinalCtaContent,
  HomeFooterContent,
  HomeHeaderContent,
  HomeHeroContent,
  HomeHeroStatContent,
  HomeImageContent,
  HomeLinkItemContent,
  HomePageContent,
  HomeSectionKey,
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
import type {
  RecursiveArticleCategoryDto,
  RecursiveArticleCategoryResponse,
  RecursiveArticleDto,
} from './articleCategory.dto';
import { stripHtmlToNull } from '@/shared/lib/text';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

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
  return getVisibleChildren(category).find((child) => child.id === id) ?? null;
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

  const demoAssetMatch = normalized.match(/(?:^|\/)demo-assets\/[^\s?#]+/i);
  if (demoAssetMatch) {
    const localPath = demoAssetMatch[0].replace(/^\/+/, '');
    return `/${localPath}`;
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
  langId: number
): HomeActionContent {
  if (!article) {
    return { label: '', path: null };
  }

  const translation = getArticleTranslation(article, langId);

  return {
    label: trimToNull(translation.name) ?? '',
    path: trimToNull(article.path),
  };
}

function toOptionalActionContent(
  article: RecursiveArticleDto | null,
  langId: number
): HomeActionContent | null {
  const action = toActionContent(article, langId);
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
  langId: number
): HeroStatSnapshot[] {
  const articles = getVisibleArticles(category);

  if (articles.length === 0) {
    return [];
  }

  return articles.map((article) => {
    const localized = getArticleTranslation(article, langId);
    const english = getArticleTranslation(article, localeToLangId.en);
    const parsed =
      parseStatValue(localized.name) ?? parseStatValue(english.name);

    if (!parsed) {
      return {
        value: 0,
        label: localized.description ?? english.description ?? localized.name,
      };
    }

    return {
      ...parsed,
      label:
        trimToNull(localized.description) ??
        trimToNull(english.description) ??
        localized.name,
    };
  });
}

function mapHeroContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeHeroContent {
  const heroCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.hero
  );

  if (!heroCategory) {
    return {
      badge: '',
      badgeImages: [],
      titleLead: '',
      titleMiddle: '',
      rotatingWords: [],
      subtitle: '',
      primaryAction: { label: '', path: null },
      secondaryAction: { label: '', path: null },
      stats: [],
      phoneGreeting: '',
      phoneName: '',
      phoneSearchPlaceholder: '',
      servicesTitle: '',
      servicesLink: '',
      phoneTiles: [],
      liveBookings: '',
      liveBookingsLabel: '',
      floatingCards: [],
    };
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
    badge: trimToNull(contentTranslation?.shortDescription) ?? '',
    badgeImages: splitImageList(
      contentArticle?.images,
      contentTranslation?.name ?? ''
    ),
    titleLead: trimToNull(contentTranslation?.name) ?? '',
    titleMiddle: trimToNull(contentTranslation?.extraInfo) ?? '',
    rotatingWords: rotatingWordsTranslation
      ? [
          trimToNull(rotatingWordsTranslation.name),
          trimToNull(rotatingWordsTranslation.shortDescription),
          trimToNull(rotatingWordsTranslation.extraInfo),
        ].filter((word): word is string => Boolean(word))
      : [],
    subtitle: trimToNull(contentTranslation?.description) ?? '',
    primaryAction: toActionContent(primaryAction, langId),
    secondaryAction: toActionContent(secondaryAction, langId),
    stats: mapHeroStats(metricsCategory, langId),
    phoneGreeting: trimToNull(greetingTranslation?.name) ?? '',
    phoneName: trimToNull(greetingTranslation?.extraInfo) ?? '',
    phoneSearchPlaceholder:
      trimToNull(greetingTranslation?.shortDescription) ?? '',
    servicesTitle: trimToNull(servicesTranslation?.name) ?? '',
    servicesLink: trimToNull(servicesTranslation?.extraInfo) ?? '',
    phoneTiles: getVisibleArticles(phoneTilesCategory).map((article) => {
      const translation = getArticleTranslation(article, langId);

      return {
        title: trimToNull(translation.name) ?? '',
        subtitle: trimToNull(translation.shortDescription) ?? '',
        iconKey: extractIconKey(article.image),
      };
    }),
    liveBookings: trimToNull(liveTranslation?.name) ?? '',
    liveBookingsLabel: trimToNull(liveTranslation?.description) ?? '',
    floatingCards: getVisibleArticles(floatingCardsCategory).map((article) => {
      const translation = getArticleTranslation(article, langId);

      return {
        title: trimToNull(translation.name) ?? '',
        detail: trimToNull(translation.description) ?? '',
      };
    }),
  };
}

function mapServicesContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeServicesContent {
  const servicesCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.services
  );

  if (!servicesCategory) {
    return { eyebrow: '', title: '', accent: '', body: '', items: [] };
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
    eyebrow: trimToNull(headerTranslation?.shortDescription) ?? '',
    title: trimToNull(headerTranslation?.name) ?? '',
    accent: trimToNull(headerTranslation?.extraInfo) ?? '',
    body: trimToNull(headerTranslation?.description) ?? '',
    items,
  };
}

function mapWhyContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeWhyContent {
  const whyCategory = getChildCategoryById(rootCategory, HOME_SECTION_IDS.why);

  if (!whyCategory) {
    return { eyebrow: '', title: '', items: [] };
  }

  const headerArticle = getArticleByRank(whyCategory, WHY_ARTICLE_RANKS.header);
  const headerTranslation = headerArticle
    ? getArticleTranslation(headerArticle, langId)
    : null;

  return {
    eyebrow: trimToNull(headerTranslation?.shortDescription) ?? '',
    title: trimToNull(headerTranslation?.name) ?? '',
    items: getVisibleArticles(whyCategory)
      .filter((article) => article.rank !== WHY_ARTICLE_RANKS.header)
      .map((article) => {
        const translation = getArticleTranslation(article, langId);

        return {
          title: trimToNull(translation.name) ?? '',
          description: trimToNull(translation.description) ?? '',
          iconKey: extractIconKey(article.image),
        };
      }),
  };
}

function mapBookingContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeBookingContent {
  const bookingCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.booking
  );

  if (!bookingCategory) {
    return {
      eyebrow: '',
      title: '',
      note: '',
      fields: {
        exam: { label: '', placeholder: '' },
        city: { label: '', placeholder: '' },
        date: { label: '', placeholder: '' },
        search: { label: '', path: null },
      },
      examOptions: [],
    };
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
    eyebrow: trimToNull(headerTranslation?.shortDescription) ?? '',
    title: trimToNull(headerTranslation?.name) ?? '',
    note: trimToNull(headerTranslation?.description) ?? '',
    fields: {
      exam: {
        label:
          trimToNull(
            examField ? getArticleTranslation(examField, langId).name : null
          ) ?? '',
        placeholder:
          trimToNull(
            examField
              ? getArticleTranslation(examField, langId).shortDescription
              : null
          ) ?? '',
      },
      city: {
        label:
          trimToNull(
            cityField ? getArticleTranslation(cityField, langId).name : null
          ) ?? '',
        placeholder:
          trimToNull(
            cityField
              ? getArticleTranslation(cityField, langId).shortDescription
              : null
          ) ?? '',
      },
      date: {
        label:
          trimToNull(
            dateField ? getArticleTranslation(dateField, langId).name : null
          ) ?? '',
        placeholder:
          trimToNull(
            dateField
              ? getArticleTranslation(dateField, langId).shortDescription
              : null
          ) ?? '',
      },
      search: toActionContent(searchField, langId),
    },
    examOptions: getVisibleArticles(optionsCategory).map(
      (article) => getArticleTranslation(article, langId).name
    ),
  };
}

function mapStepsContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeStepsContent {
  const stepsCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.steps
  );

  if (!stepsCategory) {
    return {
      eyebrow: '',
      title: '',
      highlight: '',
      cta: { label: '', path: null },
      items: [],
    };
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
    eyebrow: trimToNull(headerTranslation?.shortDescription) ?? '',
    title: trimToNull(headerTranslation?.name) ?? '',
    highlight: trimToNull(headerTranslation?.extraInfo) ?? '',
    cta: toActionContent(ctaArticle, langId),
    items: stepCategories.map((category) => {
      const contentArticle = getArticleByRank(category, 1);
      const meta1Article = getArticleByRank(category, 10);
      const meta2Article = getArticleByRank(category, 20);

      return {
        title:
          trimToNull(
            contentArticle
              ? getArticleTranslation(contentArticle, langId).name
              : null
          ) ?? '',
        body:
          trimToNull(
            contentArticle
              ? getArticleTranslation(contentArticle, langId).description
              : null
          ) ?? '',
        meta1: {
          value:
            trimToNull(
              meta1Article
                ? getArticleTranslation(meta1Article, langId).name
                : null
            ) ?? '',
          label:
            trimToNull(
              meta1Article
                ? getArticleTranslation(meta1Article, langId).description
                : null
            ) ?? '',
        },
        meta2: {
          value:
            trimToNull(
              meta2Article
                ? getArticleTranslation(meta2Article, langId).name
                : null
            ) ?? '',
          label:
            trimToNull(
              meta2Article
                ? getArticleTranslation(meta2Article, langId).description
                : null
            ) ?? '',
        },
      };
    }),
  };
}

function mapAppContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeAppContent {
  const appCategory = getChildCategoryById(rootCategory, HOME_SECTION_IDS.app);

  if (!appCategory) {
    return {
      eyebrow: '',
      title: '',
      accent: '',
      body: '',
      scheduleCard: {
        label: '',
        detail: '',
        appointment: { value: '', detail: '', location: '', iconKey: null },
      },
      statusCard: { label: '', detail: '', status: '' },
      reportsCard: { label: '', detail: '', status: '', items: [] },
      points: [],
      downloadLinks: [],
    };
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
    eyebrow: trimToNull(headerTranslation?.shortDescription) ?? '',
    title: trimToNull(headerTranslation?.name) ?? '',
    accent: trimToNull(headerTranslation?.extraInfo) ?? '',
    body: trimToNull(headerTranslation?.description) ?? '',
    scheduleCard: {
      label:
        trimToNull(
          scheduleHeader
            ? getArticleTranslation(scheduleHeader, langId).name
            : null
        ) ?? '',
      detail:
        trimToNull(
          scheduleHeader
            ? getArticleTranslation(scheduleHeader, langId).description
            : null
        ) ?? '',
      appointment: {
        value:
          trimToNull(
            scheduleAppointment
              ? getArticleTranslation(scheduleAppointment, langId).name
              : null
          ) ?? '',
        detail:
          trimToNull(
            scheduleAppointment
              ? getArticleTranslation(scheduleAppointment, langId).description
              : null
          ) ?? '',
        location:
          trimToNull(
            scheduleAppointment
              ? getArticleTranslation(scheduleAppointment, langId)
                  .shortDescription
              : null
          ) ?? '',
        iconKey: extractIconKey(scheduleAppointment?.image) ?? null,
      },
    },
    statusCard: {
      label:
        trimToNull(
          statusHeader ? getArticleTranslation(statusHeader, langId).name : null
        ) ?? '',
      detail:
        trimToNull(
          statusHeader
            ? getArticleTranslation(statusHeader, langId).description
            : null
        ) ?? '',
      status:
        trimToNull(
          statusHeader
            ? getArticleTranslation(statusHeader, langId).shortDescription
            : null
        ) ?? '',
    },
    reportsCard: {
      label:
        trimToNull(
          reportsHeader
            ? getArticleTranslation(reportsHeader, langId).name
            : null
        ) ?? '',
      detail:
        trimToNull(
          reportsHeader
            ? getArticleTranslation(reportsHeader, langId).description
            : null
        ) ?? '',
      status:
        trimToNull(
          reportsHeader
            ? getArticleTranslation(reportsHeader, langId).shortDescription
            : null
        ) ?? '',
      items: reportItems.map((article) => {
        const translation = getArticleTranslation(article, langId);

        return {
          title: trimToNull(translation.name) ?? '',
          detail: trimToNull(translation.shortDescription) ?? '',
          badge: trimToNull(translation.extraInfo) ?? '',
          iconKey: extractIconKey(article.image),
        };
      }),
    },
    points: getVisibleArticles(pointsCategory).map((article) => {
      const translation = getArticleTranslation(article, langId);

      return {
        title: trimToNull(translation.name) ?? '',
        detail: trimToNull(translation.description) ?? '',
      };
    }),
    downloadLinks: getVisibleArticles(linksCategory).map((article) => {
      const translation = getArticleTranslation(article, langId);

      return {
        label: trimToNull(translation.name) ?? '',
        path: trimToNull(article.path),
        iconKey: extractIconKey(article.image),
      };
    }),
  };
}

function mapAcademyContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeAcademyContent {
  const academyCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.academy
  );

  if (!academyCategory) {
    return { eyebrow: '', title: '', accent: '', ctaLabel: '', items: [] };
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
    eyebrow: trimToNull(headerTranslation?.shortDescription) ?? '',
    title: trimToNull(headerTranslation?.name) ?? '',
    accent: trimToNull(headerTranslation?.extraInfo) ?? '',
    ctaLabel:
      trimToNull(
        ctaArticle ? getArticleTranslation(ctaArticle, langId).name : null
      ) ?? '',
    items: getVisibleArticles(academyCategory)
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
      }),
  };
}

function mapStatsContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeStatsContent {
  const statsCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.stats
  );

  if (!statsCategory) {
    return { title: '', items: [] };
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
    .map((article) => {
      const translation = getArticleTranslation(article, langId);
      const english = getArticleTranslation(article, localeToLangId.en);
      const parsed =
        parseStatValue(translation.name) ?? parseStatValue(english.name);

      return {
        value: parsed?.value ?? 0,
        suffix: parsed?.suffix,
        decimals: parsed?.decimals,
        label:
          trimToNull(translation.description) ??
          trimToNull(english.description) ??
          '',
      } satisfies HomeStatsItemContent;
    });

  return {
    title: trimToNull(headerTranslation?.name) ?? '',
    items,
  };
}

function mapTestimonialContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeTestimonialContent[] {
  const testimonialCategory = getChildCategoryById(
    rootCategory,
    HOME_SECTION_IDS.testimonial
  );
  const articles = getVisibleArticles(testimonialCategory);

  return articles.map((article) => {
    const translation = getArticleTranslation(article, langId);

    return {
      quote: trimToNull(translation.name) ?? '',
      highlight: trimToNull(translation.extraInfo) ?? '',
      author: trimToNull(translation.shortDescription) ?? '',
      role: trimToNull(translation.description) ?? '',
    };
  });
}

export function mapHeaderContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeHeaderContent {
  const headerCategory = getChildCategoryById(rootCategory, HEADER_CATEGORY_ID);

  if (!headerCategory) {
    return {
      brandLabel: '',
      brandDescription: '',
      brandPath: null,
      brandImageSrc: null,
      navLinks: [],
      primaryAction: null,
      signInAction: null,
      businessSignInAction: null,
      userMenu: null,
      localeSwitchLabel: null,
    };
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
    brandLabel: trimToNull(brandTranslation?.name) ?? '',
    brandDescription: trimToNull(brandTranslation?.description) ?? '',
    brandPath: trimToNull(brandArticle?.path),
    brandImageSrc: resolveCmsAssetUrl(brandArticle?.image),
    navLinks,
    primaryAction: toOptionalActionContent(primaryArticle, langId),
    signInAction: toOptionalActionContent(signInArticle, langId),
    businessSignInAction: toOptionalActionContent(
      businessSignInArticle,
      langId
    ),
    userMenu: null,
    localeSwitchLabel: trimToNull(
      localeSwitchArticle
        ? getArticleTranslation(localeSwitchArticle, langId).name
        : null
    ),
  };
}

export function mapFinalCtaContent(
  rootCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomeFinalCtaContent {
  const finalCtaCategory = getChildCategoryById(
    rootCategory,
    FINAL_CTA_CATEGORY_ID
  );

  if (!finalCtaCategory) {
    return {
      title: '',
      highlight: '',
      body: '',
      primaryAction: { label: '', path: null },
      secondaryAction: { label: '', path: null },
    };
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
    title: trimToNull(translation?.name) ?? '',
    highlight: trimToNull(translation?.extraInfo) ?? '',
    body: trimToNull(translation?.description) ?? '',
    primaryAction: toActionContent(primaryActionArticle, langId),
    secondaryAction: toActionContent(secondaryActionArticle, langId),
  };
}

function mapFooterGroup(
  category: RecursiveArticleCategoryDto | null,
  langId: number
): HomeFooterContent['pages'] {
  if (!category) {
    return { title: '', links: [] };
  }

  const headingArticle = getArticleByRank(category, 1);
  const headingTranslation = headingArticle
    ? getArticleTranslation(headingArticle, langId)
    : null;
  const links = getVisibleArticles(category)
    .filter((article) => article.rank > 1)
    .map((article) => toLinkItemContent(article, langId));

  return {
    title: trimToNull(headingTranslation?.name) ?? '',
    links,
  };
}

export function mapFooterContent(
  rootCategory: RecursiveArticleCategoryDto,
  langId: number,
  socialMediaCategory: RecursiveArticleCategoryDto | null = null
): HomeFooterContent {
  const footerCategory = getChildCategoryById(rootCategory, FOOTER_CATEGORY_ID);

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
    brandLabel: trimToNull(brandTranslation?.name) ?? '',
    brandBody: trimToNull(brandTranslation?.description) ?? '',
    brandPath: trimToNull(brandArticle?.path),
    brandImageSrc: resolveCmsAssetUrl(brandArticle?.image),
    newsletterPlaceholder: trimToNull(newsletterTranslation?.name) ?? '',
    newsletterEyebrow:
      trimToNull(newsletterTranslation?.shortDescription) ?? '',
    newsletterAction: trimToNull(newsletterTranslation?.extraInfo) ?? '',
    copyrightLabel: trimToNull(copyrightTranslation?.name) ?? '',
    copyrightBody: trimToNull(copyrightTranslation?.description) ?? '',
    pages: mapFooterGroup(
      getChildCategoryById(footerCategory, FOOTER_CHILD_CATEGORY_IDS.pages),
      langId
    ),
    contact: mapFooterGroup(
      getChildCategoryById(footerCategory, FOOTER_CHILD_CATEGORY_IDS.contact),
      langId
    ),
    socialLinks: getVisibleArticles(socialMediaCategory).map((article) => {
      const translation = getArticleTranslation(article, langId);
      return {
        name: trimToNull(translation.name) ?? '',
        path: trimToNull(article.path),
      };
    }),
  };
}

const SECTION_ORDER_IDS: { key: HomeSectionKey; id: number }[] = [
  { key: 'hero', id: HOME_SECTION_IDS.hero },
  { key: 'companies', id: COMPANIES_CATEGORY_ID },
  { key: 'services', id: HOME_SECTION_IDS.services },
  { key: 'why', id: HOME_SECTION_IDS.why },
  { key: 'booking', id: HOME_SECTION_IDS.booking },
  { key: 'steps', id: HOME_SECTION_IDS.steps },
  { key: 'app', id: HOME_SECTION_IDS.app },
  { key: 'academy', id: HOME_SECTION_IDS.academy },
  { key: 'stats', id: HOME_SECTION_IDS.stats },
  { key: 'testimonial', id: HOME_SECTION_IDS.testimonial },
];

function buildSectionOrder(
  rootCategory: RecursiveArticleCategoryDto | null
): HomeSectionKey[] {
  const children = getVisibleChildren(rootCategory);
  return SECTION_ORDER_IDS.map(({ key, id }) => ({
    key,
    rank: children.find((c) => c.id === id)?.rank ?? 9999,
  }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ key }) => key);
}

function buildHomePageContent(
  rootCategory: RecursiveArticleCategoryDto,
  companiesCategory: RecursiveArticleCategoryDto | null,
  langId: number
): HomePageContent {
  return {
    hero: mapHeroContent(rootCategory, langId),
    companies: mapCompaniesContent(companiesCategory),
    services: mapServicesContent(rootCategory, langId),
    why: mapWhyContent(rootCategory, langId),
    booking: mapBookingContent(rootCategory, langId),
    steps: mapStepsContent(rootCategory, langId),
    app: mapAppContent(rootCategory, langId),
    academy: mapAcademyContent(rootCategory, langId),
    stats: mapStatsContent(rootCategory, langId),
    testimonial: mapTestimonialContent(rootCategory, langId),
    finalCta: mapFinalCtaContent(rootCategory, langId),
    sectionOrder: buildSectionOrder(rootCategory),
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
  async (): Promise<RecursiveArticleCategoryDto> => {
    const endpoint = new URL(
      '/api/General/ArticleCategory/GetRecursiveById',
      HOME_CONTENT_API_BASE_URL
    );

    endpoint.searchParams.set('Id', String(HOME_CONTENT_ROOT_CATEGORY_ID));

    const response = await fetchWithErrorHandling<
      RecursiveArticleCategoryResponse['value']
    >(endpoint.toString(), {
      cache: 'no-store',
    });

    return response;
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
