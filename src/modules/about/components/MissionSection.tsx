'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'

export function MissionSection() {
  const t = useTranslations('about').mission

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">{t.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">{t.description}</p>
      </div>
    </section>
  )
}
