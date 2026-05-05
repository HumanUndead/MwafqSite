'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'

export default function DashboardPage() {
  const t = useTranslations('dashboard')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
      <p className="mt-2 text-gray-600">{t.welcome}</p>
    </div>
  )
}
