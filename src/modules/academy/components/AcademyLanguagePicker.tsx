'use client';

import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import {
  ACADEMY_LANGUAGES,
  ACADEMY_LANGUAGE_LABELS,
  isAcademyLanguage,
} from '../academyLanguage.shared';
import { useAcademyLanguage } from './AcademyLanguageProvider';

const ITEMS = ACADEMY_LANGUAGES.map((value) => ({
  value,
  label: ACADEMY_LANGUAGE_LABELS[value],
}));

type AcademyLanguagePickerProps = {
  /** Kept for call-site compatibility; there is one (light) style. */
  tone?: 'light' | 'dark';
  className?: string;
};

/** Academy content language (en, ar, ur, ne, bn, hi): label + select. */
export function AcademyLanguagePicker({ className }: AcademyLanguagePickerProps = {}) {
  const t = useTranslations('academyCourses');
  const academy = useAcademyLanguage();
  if (!academy) return null;

  return (
    <div className={cn('inline-flex max-w-full items-center gap-2', className)}>
      <label
        htmlFor='academy-language'
        className='inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#6b7196]'
      >
        <Languages className='size-4' aria-hidden />
        {t.language}
      </label>
      <Select
        value={academy.language}
        onValueChange={(next) => isAcademyLanguage(next) && academy.setLanguage(next)}
        items={ITEMS}
        modal={false}
      >
        <SelectTrigger
          id='academy-language'
          className='min-w-32 rounded-xl border-[#d9ddea] bg-white px-3 text-[14px] font-semibold text-[#1e2364] shadow-none transition-colors duration-150 hover:bg-[#f7f8fb] focus-visible:border-[#1e2364] focus-visible:ring-2 focus-visible:ring-[#1e2364]/20 data-[size=default]:h-9 [&_svg]:text-[#6b7196]'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} sideOffset={6}>
          {ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value} lang={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
