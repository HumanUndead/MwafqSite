'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'

export function StatsSection() {
  const stats = useTranslations('about').stats

  return (
    <section className="bg-blue-600 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
