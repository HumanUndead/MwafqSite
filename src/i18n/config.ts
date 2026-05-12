export const localeMetadata = {
  en: {
    label: 'EN',
    direction: 'ltr',
  },
  ar: {
    label: 'AR',
    direction: 'rtl',
  },
} as const

export type Locale = keyof typeof localeMetadata
export const locales = Object.keys(localeMetadata) as Locale[]

export const defaultLocale: Locale = 'en'
export const localeCookieName = 'mwafq-locale'

export const localeLabels: Record<Locale, string> = Object.fromEntries(
  locales.map(locale => [locale, localeMetadata[locale].label]),
) as Record<Locale, string>

export function isRtl(locale: Locale): boolean {
  return localeMetadata[locale].direction === 'rtl'
}

export function hasLocale(value: string): value is Locale {
  return value in localeMetadata
}
