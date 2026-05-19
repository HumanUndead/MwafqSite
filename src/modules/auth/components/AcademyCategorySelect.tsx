'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import type { CourseCategoryListItem } from '../courseCategory.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/shared/lib/cn';

export type CategorySelectOption = {
  value: string;
  label: string;
};

const selectTriggerClassName = cn(
  '!h-[42px] w-full rounded-lg border-[#e5e7f0] bg-white px-3.5 py-1.5 text-[13.5px] text-[#1e2364] shadow-none',
  'transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
  'focus-visible:border-[#00a8f1] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,168,241,0.20)]',
  'data-placeholder:text-[rgba(30,35,100,0.45)]'
);

const selectContentClassName = cn(
  'max-h-60 rounded-lg border-[#e5e7f0] bg-white p-1 text-[#1e2364] shadow-lg ring-1 ring-[#e5e7f0]/80',
  '!duration-0 data-open:animate-none data-closed:animate-none',
  'data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0',
  'data-open:zoom-in-100 data-closed:zoom-out-100'
);

const selectItemClassName = cn(
  'rounded-md py-2 pl-2 pr-8 text-[14px] text-[#1e2364]',
  'focus:bg-[rgba(0,168,241,0.08)] focus:text-[#1e2364] data-highlighted:bg-[rgba(0,168,241,0.08)]'
);

export function getCategorySelectOptions(
  categories: readonly CourseCategoryListItem[],
  langId: number
): CategorySelectOption[] {
  return categories
    .filter((category) => category.translations.length > 0)
    .map((category) => ({
      value: category.id.toString(),
      label:
        category.translations.find((t) => t.langId === langId)?.name ??
        category.translations.at(0)?.name ??
        '',
    }));
}

export type AcademyCategorySelectProps = {
  categories: readonly CourseCategoryListItem[];
  langId: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (categoryId: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const CategorySelectItem = memo(function CategorySelectItem({
  option,
}: {
  option: CategorySelectOption;
}) {
  return (
    <SelectItem value={option.value} className={selectItemClassName}>
      {option.label}
    </SelectItem>
  );
});

function AcademyCategorySelectInner({
  categories,
  langId,
  value: controlledValue,
  defaultValue,
  onValueChange,
  id = 'academy-category-select',
  label = 'Section',
  placeholder = 'Select category',
  disabled,
  className,
}: AcademyCategorySelectProps) {
  const options = useMemo(
    () => getCategorySelectOptions(categories, langId),
    [categories, langId]
  );

  const [uncontrolledValue, setUncontrolledValue] = useState(
    () => defaultValue ?? options[0]?.value ?? ''
  );

  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback(
    (nextValue: string | null) => {
      const categoryId = nextValue ?? '';

      if (!isControlled) {
        setUncontrolledValue(categoryId);
      }

      onValueChange?.(categoryId);
    },
    [isControlled, onValueChange]
  );

  const optionItems = useMemo(
    () =>
      options.map((option) => (
        <CategorySelectItem key={option.value} option={option} />
      )),
    [options]
  );

  const isDisabled = disabled ?? options.length === 0;

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={id}
          className='mb-2 ml-1.5 block text-[13px] font-bold tracking-[-0.1px] text-[#1e2364]'
        >
          {label}
        </label>
      ) : null}

      <Select
        value={selectedValue || null}
        onValueChange={handleValueChange}
        disabled={isDisabled}
        items={options}
        modal={false}
      >
        <SelectTrigger id={id} className={selectTriggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={selectContentClassName}
          side='bottom'
          sideOffset={4}
          align='start'
          alignItemWithTrigger={false}
          collisionAvoidance={{ side: 'none' }}
          positionMethod='fixed'
          hideScrollButtons
        >
          {optionItems}
        </SelectContent>
      </Select>
    </div>
  );
}

export const AcademyCategorySelect = memo(AcademyCategorySelectInner);
