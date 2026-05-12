import { notFound } from 'next/navigation'
import { getDictionary } from '@/i18n/dictionaries'
import { hasLocale } from '@/i18n/config'
import { LoginForm } from '@/modules/auth'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params

  if (!hasLocale(locale)) {
    notFound()
  }

  const { auth } = await getDictionary(locale)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{auth.login.title}</h1>
      <LoginForm />
    </div>
  )
}
