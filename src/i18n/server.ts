import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import type { Dictionary } from '@/locales/types'
import { defaultLocale, hasLocale, localeCookieName, type Locale } from './config'
import { getDictionary } from './dictionaries'

export const GetLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies()
  const localeValue = cookieStore.get(localeCookieName)?.value

  return localeValue && hasLocale(localeValue) ? localeValue : defaultLocale
})

export const getTranslations = cache(async <K extends keyof Dictionary>(namespace: K): Promise<Dictionary[K]> => {
  const locale = await GetLocale()
  const dictionary = await getDictionary(locale)

  return dictionary[namespace]
})
