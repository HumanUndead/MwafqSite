import { notFound } from 'next/navigation'
import { hasLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { RegisterForm } from '@/modules/auth'
import { AuthSplitShell } from '@/modules/auth/components/AuthSplitShell'
import { getRegisterPageContent } from '@/modules/auth/server/registerPageContentService'

interface RegisterPageProps {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
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
      title={dictionary.auth.register.title}
      subtitle={dictionary.auth.register.description}
    >
      <RegisterForm />
    </AuthSplitShell>
  )
}
