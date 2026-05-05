'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'

export function FeaturesSection() {
  const t = useTranslations('landing').features

  return (
    <section className="bg-gray-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600">{t.description}</p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map(feature => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
