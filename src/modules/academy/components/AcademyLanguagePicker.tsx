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

/** Academy content language (en, ar, ur, ne, bn, hi). */
export function AcademyLanguagePicker() {
  const t = useTranslations('academyCourses');
  const academy = useAcademyLanguage();
  if (!academy) return null;

  return (
    <div className='flex items-center gap-2'>
      <Languages className='size-4 text-[#6b7196]' aria-hidden />
      <label htmlFor='academy-language' className='text-sm font-semibold text-[#6b7196]'>
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
          className='h-10 min-w-32 rounded-full border-2 border-[#e5e7f0] bg-white px-4 text-sm font-bold text-[#1e2364]'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} sideOffset={4}>
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
