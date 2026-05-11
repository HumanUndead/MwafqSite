import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { FooterSection } from '@/modules/home/components/FooterSection'
import { getHomePageContent } from '@/modules/home/server/homeContentService'
import { Header } from '@/shared/components/layout/Header'

interface MarketingLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  const { locale } = await params

  if (!hasLocale(locale)) {
    notFound()
  }

  const dictionary = await getDictionary(locale)
  const content = await getHomePageContent(locale as Locale, dictionary)

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale as Locale} content={content.header} />
      <main className="flex-1">{children}</main>
      <FooterSection locale={locale as Locale} content={content.footer} />
    </div>
  )
}
