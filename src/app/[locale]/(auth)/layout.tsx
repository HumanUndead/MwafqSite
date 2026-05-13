import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { withAuthenticatedHeaderState } from '@/modules/auth/server/headerAuth'
import { getCurrentUser } from '@/modules/auth/server/authSession'
import { FooterSection } from '@/modules/home/components/FooterSection'
import { getHomePageContent } from '@/modules/home/server/homeContentService'
import { Header } from '@/shared/components/layout/Header'

interface AuthLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params

  if (!hasLocale(locale)) {
    notFound()
  }

  const dictionary = await getDictionary(locale)
  const currentUser = await getCurrentUser()
  const content = await getHomePageContent(locale as Locale, dictionary)
  const headerContent = withAuthenticatedHeaderState(content.header, currentUser, locale as Locale)

  return (
    <div className="flex min-h-screen flex-col bg-[#eeeeef] text-[#1e2364]">
      <Header locale={locale as Locale} content={headerContent} />
      <main className="flex-1">{children}</main>
      <FooterSection locale={locale as Locale} content={content.footer} />
    </div>
  )
}
