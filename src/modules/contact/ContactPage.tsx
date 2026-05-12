'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'
import { ContactForm } from './components/ContactForm'

export function ContactPage() {
  const t = useTranslations('contact')

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-4 text-lg text-gray-600">{t.description}</p>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}
