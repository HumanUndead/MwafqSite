'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { ROUTES } from '@/shared/constants/routes'

export function HeroSection() {
  const locale = useLocale()
  const t = useTranslations('landing').hero

  return (
    <section className="px-4 py-24 text-center sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          {t.titlePrefix} <span className="text-blue-600">{t.titleHighlight}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">{t.description}</p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={getLocalizedRoute(locale, ROUTES.REGISTER)}
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            {t.primaryCta}
          </Link>
          <Link
            href={getLocalizedRoute(locale, ROUTES.ABOUT)}
            className="rounded-xl border border-gray-300 px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  )
}
