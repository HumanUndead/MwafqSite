'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useLocale } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { config } from '@/shared/constants/config'
import { ROUTES } from '@/shared/constants/routes'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const locale = useLocale()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8 flex w-full max-w-md items-center justify-between">
        <Link href={getLocalizedRoute(locale, ROUTES.HOME)} className="text-2xl font-bold text-gray-900">
          {config.appName}
        </Link>
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        {children}
      </div>
    </div>
  )
}
