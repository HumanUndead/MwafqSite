'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/shared/lib/cn';
import { inputVariants, labelVariants } from '@/shared/lib/variants';
import { contactApi } from '../api/contactApi';

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function ContactForm() {
  const t = useTranslations('contact');
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update =
    (key: keyof ContactFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.send(form);
      setSent(true);
      toast.success(t.success.toast);
    } catch {
      toast.error(t.errors.submit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode='wait'>
      {sent ? (
        <motion.div
          key='success'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className='flex flex-col items-center gap-4 rounded-[24px] bg-[#f0fdf4] px-8 py-14 text-center'
        >
          <span className='flex h-16 w-16 items-center justify-center rounded-full bg-[#00a8f1]/10 text-3xl'>
            ✓
          </span>
          <p className='text-xl font-bold text-[#1e2364]'>{t.success.title}</p>
          <p className='text-sm text-[#6b7196]'>{t.success.description}</p>
        </motion.div>
      ) : (
        <motion.form
          key='form'
          onSubmit={handleSubmit}
          className='flex flex-col gap-5'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease }}
        >
          <ScrollReveal transitionDelay={0.05}>
            <Input
              label={t.form.nameLabel}
              value={form.name}
              onChange={update('name')}
              placeholder={t.form.namePlaceholder}
              autoComplete='name'
              required
            />
          </ScrollReveal>

          <div className='grid gap-5 sm:grid-cols-2'>
            <ScrollReveal transitionDelay={0.1}>
              <Input
                label={t.form.emailLabel}
                type='email'
                value={form.email}
                onChange={update('email')}
                placeholder={t.form.emailPlaceholder}
                autoComplete='email'
                required
              />
            </ScrollReveal>

            <ScrollReveal transitionDelay={0.15}>
              <Input
                label={t.form.phoneLabel}
                type='tel'
                value={form.phone}
                onChange={update('phone')}
                placeholder={t.form.phonePlaceholder}
                autoComplete='tel'
              />
            </ScrollReveal>
          </div>

          <ScrollReveal transitionDelay={0.2}>
            <div className='flex flex-col gap-1'>
              <label className={labelVariants()}>{t.form.messageLabel}</label>
              <textarea
                value={form.message}
                onChange={update('message')}
                placeholder={t.form.messagePlaceholder}
                rows={5}
                required
                className={cn(inputVariants(), 'resize-none leading-relaxed')}
              />
            </div>
          </ScrollReveal>

          <ScrollReveal transitionDelay={0.25}>
            <Button
              type='submit'
              loading={loading}
              variant='brand'
              size='lg'
              className='w-full rounded-[14px]'
            >
              {t.form.submit}
            </Button>
          </ScrollReveal>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
