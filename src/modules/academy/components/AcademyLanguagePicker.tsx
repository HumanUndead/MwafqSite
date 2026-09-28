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
  /** `dark` on the navy stage, `light` (default) on the mist page. */
  tone?: 'light' | 'dark';
  className?: string;
};

/** Academy content language (en, ar, ur, ne, bn, hi) as a glass pill. */
export function AcademyLanguagePicker({
  tone = 'light',
  className,
}: AcademyLanguagePickerProps = {}) {
  const t = useTranslations('academyCourses');
  const academy = useAcademyLanguage();
  if (!academy) return null;

  const dark = tone === 'dark';

  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full py-1 pe-1 ps-3.5 backdrop-blur-xl',
        dark
          ? 'bg-white/10 ring-1 ring-white/20'
          : 'bg-white/70 shadow-[0_4px_16px_-8px_rgba(30,35,100,0.2)] ring-1 ring-white/70',
        className
      )}
    >
      <Languages
        className={cn('size-4 shrink-0', dark ? 'text-[#00a8f1]' : 'text-[#6b7196]')}
        aria-hidden
      />
      <label
        htmlFor='academy-language'
        className={cn(
          'truncate text-sm font-semibold',
          dark ? 'text-white/80' : 'text-[#6b7196]'
        )}
      >
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
          className={cn(
            'min-w-28 rounded-full border-0 px-3.5 text-sm font-bold data-[size=default]:h-9',
            'focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2',
            dark
              ? 'bg-white/15 text-white hover:bg-white/25 focus-visible:ring-offset-[#141848] [&_svg]:text-white/70'
              : 'bg-white text-[#1e2364] ring-1 ring-[#e5e7f0] hover:bg-[#f7f8fc] focus-visible:ring-offset-white [&_svg]:text-[#6b7196]'
          )}
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
