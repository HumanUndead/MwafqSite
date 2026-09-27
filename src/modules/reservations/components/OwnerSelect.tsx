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
    <div className='flex items-center gap-2'>
      <label htmlFor='reservations-owner' className='text-sm font-semibold text-[#6b7196]'>
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
          className='h-10 min-w-44 rounded-full border-2 border-[#e5e7f0] bg-white px-4 text-sm font-bold text-[#1e2364]'
        >
          <SelectValue />
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
