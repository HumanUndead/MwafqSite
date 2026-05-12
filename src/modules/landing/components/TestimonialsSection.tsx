'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'

export function TestimonialsSection() {
  const t = useTranslations('landing').testimonials

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{t.title}</h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {t.items.map(item => (
            <div
              key={item.name}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <p className="italic text-gray-700">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.role}, {item.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
