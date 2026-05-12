'use client'

import { useState } from 'react'
import { useTranslations } from '@/i18n/DictionaryProvider'
import { toast } from '@/shared/components/feedback/Toast'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { contactApi } from '../api/contactApi'

interface ContactFormState {
  name: string
  email: string
  message: string
}

export function ContactForm() {
  const t = useTranslations('contact')
  const [form, setForm] = useState<ContactFormState>({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await contactApi.send(form)
      setSent(true)
      toast.success(t.success.toast)
    } catch {
      toast.error(t.errors.submit)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-green-50 p-8 text-center">
        <p className="text-3xl">✓</p>
        <p className="mt-2 font-semibold text-green-800">{t.success.title}</p>
        <p className="text-sm text-green-600">{t.success.description}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t.form.nameLabel}
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder={t.form.namePlaceholder}
        required
      />
      <Input
        label={t.form.emailLabel}
        type="email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder={t.form.emailPlaceholder}
        required
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{t.form.messageLabel}</label>
        <textarea
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder={t.form.messagePlaceholder}
          rows={5}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        {t.form.submit}
      </Button>
    </form>
  )
}
