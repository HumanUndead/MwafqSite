import { localeToLangId, type Locale } from '@/i18n/config';
import type { EntityTranslation } from '@/shared/types/entity-translation.types';

function resolveLangId(localeOrLangId: Locale | number): number {
  return typeof localeOrLangId === 'number'
    ? localeOrLangId
    : localeToLangId[localeOrLangId];
}

export function getTranslation<T extends EntityTranslation>(
  translations: readonly T[],
  localeOrLangId: Locale | number
): T | undefined {
  if (translations.length === 0) return undefined;
  if (translations.length === 1) return translations[0];

  const langId = resolveLangId(localeOrLangId);
  return (
    translations.find((t) => t.langId === langId) ??
    translations.find((t) => t.langId === localeToLangId.en) ??
    translations[0]
  );
}

export function getTranslationName(
  translations: readonly EntityTranslation[],
  localeOrLangId: Locale | number
): string {
  return getTranslation(translations, localeOrLangId)?.name?.trim() ?? '';
}
