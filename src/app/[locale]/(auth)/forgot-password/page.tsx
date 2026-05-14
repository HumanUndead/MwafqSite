import { notFound } from 'next/navigation'
import { hasLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { ForgotPasswordView } from '@/modules/auth'
import { AuthSplitShell } from '@/modules/auth/components/AuthSplitShell'
import { getRegisterPageContent } from '@/modules/auth/server/registerPageContentService'

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params

  if (!hasLocale(locale)) {
    notFound()
  }

  const dictionary = await getDictionary(locale)
  const content = await getRegisterPageContent(locale, dictionary)

  return (
    <AuthSplitShell
      locale={locale}
      aside={content}
      title={dictionary.auth.forgotPassword.title}
      subtitle={dictionary.auth.forgotPassword.description}
      cardClassName="max-w-[420px]"
    >
      <ForgotPasswordView />
    </AuthSplitShell>
  )
}
