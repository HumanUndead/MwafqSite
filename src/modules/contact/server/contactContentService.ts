import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import type { ContactPageContent } from '@/modules/contact/types/contactContent';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import {
  CONTACT_ARTICLE_RANKS,
  CONTACT_CONTENT_CACHE_TAG,
  CONTACT_CONTENT_REVALIDATE_SECONDS,
  CONTACT_CONTENT_ROOT_CATEGORY_ID,
} from './contactContent.config';

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
  translations: ArticleTranslationDto[];
}

interface CategoryDto {
  id: number;
  rank: number;
  articles: ArticleDto[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const localeToLangId: Record<Locale, number> = { en: 1, ar: 2 };

function getPreferredTranslation(
  translations: ArticleTranslationDto[],
  langId: number
): ArticleTranslationDto | null {
  return (
    translations.find((t) => t.langId === langId) ??
    translations.find((t) => t.langId === localeToLangId.en) ??
    translations[0] ??
    null
  );
}

function getArticleByRank(
  articles: ArticleDto[],
  rank: number
): ArticleDto | null {
  return articles.find((a) => a.rank === rank) ?? null;
}

function tr(
  article: ArticleDto | null,
  langId: number
): { name: string; shortDescription: string | null; extraInfo: string | null } {
  if (!article) return { name: '', shortDescription: null, extraInfo: null };
  const t = getPreferredTranslation(article.translations, langId);
  return {
    name: t?.name?.trim() ?? '',
    shortDescription: t?.shortDescription?.trim() ?? null,
    extraInfo: t?.extraInfo?.trim() ?? null,
  };
}

// ─── Build ────────────────────────────────────────────────────────────────────

function buildContactContent(
  category: CategoryDto | null,
  langId: number
): ContactPageContent {
  const articles = category?.articles ?? [];

  const hero = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.hero), langId);
  const emailInfo = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.infoEmail), langId);
  const phoneInfo = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.infoPhone), langId);
  const officeInfo = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.infoOffice), langId);
  const formName = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.formName), langId);
  const formEmail = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.formEmail), langId);
  const formPhone = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.formPhone), langId);
  const formMessage = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.formMessage), langId);
  const formSubmit = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.formSubmit), langId);
  const success = tr(getArticleByRank(articles, CONTACT_ARTICLE_RANKS.success), langId);

  return {
    title: hero.name,
    description: hero.shortDescription ?? '',
    info: {
      email: { label: emailInfo.name, value: emailInfo.shortDescription ?? '' },
      phone: { label: phoneInfo.name, value: phoneInfo.shortDescription ?? '' },
      address: { label: officeInfo.name, value: officeInfo.shortDescription ?? '' },
    },
    form: {
      name: { label: formName.name, placeholder: formName.extraInfo ?? '' },
      email: { label: formEmail.name, placeholder: formEmail.extraInfo ?? '' },
      phone: { label: formPhone.name, placeholder: formPhone.extraInfo ?? '' },
      message: { label: formMessage.name, placeholder: formMessage.extraInfo ?? '' },
      submit: formSubmit.name,
      success: {
        title: success.name,
        description: success.extraInfo ?? '',
      },
    },
  };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchContactContentTree = cache(async (): Promise<CategoryDto | null> => {
  try {
    return await fetchWithErrorHandling<CategoryDto | null>(
      `/api/General/ArticleCategory/GetRecursiveById?Id=${CONTACT_CONTENT_ROOT_CATEGORY_ID}`,
      {
        cache: 'no-store',
      }
    );
  } catch (error) {
    return null;
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

export const getContactPageContent = cache(
  async (locale: Locale): Promise<ContactPageContent> => {
    const langId = localeToLangId[locale];
    const category = await fetchContactContentTree();
    return buildContactContent(category, langId);
  }
);
