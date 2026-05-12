'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'

export function TeamSection() {
  const t = useTranslations('about').team

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">{t.title}</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {t.members.map(member => (
            <div key={member.name} className="flex flex-col items-center text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                {member.initials}
              </div>
              <p className="mt-4 font-semibold text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
