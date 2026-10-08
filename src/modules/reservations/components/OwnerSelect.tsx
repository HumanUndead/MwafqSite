'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/i18n/DictionaryProvider';

export interface OwnerSelectOption {
  value: string;
  label: string;
}

interface OwnerSelectProps {
  value: string;
  options: OwnerSelectOption[];
  onChange: (value: string) => void;
}

/** Whose reservations to show: the user or an accepted family member. */
export function OwnerSelect({ value, options, onChange }: OwnerSelectProps) {
  const t = useTranslations('reservations');
  if (options.length <= 1) return null;

  return (
    <div className='flex min-w-0 items-center gap-2 max-sm:w-full'>
      <label
        htmlFor='reservations-owner'
        className='shrink-0 text-[13px] font-semibold text-[#6b7196]'
      >
        {t.ownerLabel}
      </label>
      <Select
        value={value}
        onValueChange={(next) => next && onChange(next)}
        items={options}
        modal={false}
      >
        <SelectTrigger
          id='reservations-owner'
          className='h-11 min-w-0 rounded-xl border-[#d9ddea] bg-white px-3.5 text-[14px] font-semibold text-[#1e2364] hover:border-[#1e2364]/40 focus-visible:border-[#1e2364] focus-visible:ring-2 focus-visible:ring-[#1e2364]/20 data-[size=default]:h-11 max-sm:flex-1 sm:min-w-48'
        >
          <SelectValue className='text-start' />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} sideOffset={4}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
