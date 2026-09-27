import { localeToLangId, type Locale } from '@/i18n/config';
import { stripHtmlTags } from '@/shared/lib/htmlText';
import type { CatalogTranslation } from './types/catalog.types';

/** Backend `Target` for B2C catalogue items. */
export const SERVICE_TARGET_B2C = 1;

/** Max favorites per kind (matches mobile). */
export const FAVORITES_LIMIT = 20;

export function pickTranslation<T extends CatalogTranslation>(
  translations: T[] | null | undefined,
  locale: Locale
): T | undefined {
  const langId = localeToLangId[locale];
  return (
    translations?.find((item) => item.langId === langId) ?? translations?.[0]
  );
}

export function catalogName(
  translations: CatalogTranslation[] | null | undefined,
  locale: Locale
): string {
  return pickTranslation(translations, locale)?.name?.trim() ?? '';
}

export function catalogDescription(
  translations: CatalogTranslation[] | null | undefined,
  locale: Locale
): string {
  return stripHtmlTags(pickTranslation(translations, locale)?.description) ?? '';
}
