import 'server-only'
import type { Dictionary } from '@/locales/types'
import type { Locale } from './config'

// Adding a new language = add one line here + create src/locales/<code>.ts
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('@/locales/en').then(m => m.default),
  ar: () => import('@/locales/ar').then(m => m.default),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}
