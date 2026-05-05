'use client'

import type { Locale } from '@/i18n/config'
import { localeCookieName } from '@/i18n/config'

interface LocaleToggleProps {
  locale: Locale
}

export function LocaleToggle({ locale }: LocaleToggleProps) {
  const toggleLocale = () => {
    const nextLocale: Locale = locale === 'en' ? 'ar' : 'en'
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex h-11 items-center rounded-full border border-[#d9deee] bg-white px-4 text-sm font-semibold text-[#1e2364] transition hover:border-[#1e2364] hover:bg-[#1e2364] hover:text-white"
    >
      {locale === 'en' ? 'AR' : 'EN'}
    </button>
  )
}
