'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { ROUTES } from '@/shared/constants/routes'

export function CtaSection() {
  const locale = useLocale()
  const t = useTranslations('landing').cta

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-blue-600 px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">{t.description}</p>
        <Link
          href={getLocalizedRoute(locale, ROUTES.REGISTER)}
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
        >
          {t.button}
        </Link>
      </div>
    </section>
  )
}
