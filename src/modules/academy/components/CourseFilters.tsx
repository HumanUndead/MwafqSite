'use client';

import { Search } from 'lucide-react';
import { useMemo, type FormEvent } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { getCategorySelectOptions } from '@/modules/auth/components/AcademyCategorySelect';
import type { CourseCategoryListItem } from '@/modules/auth/courseCategory.types';
import { Panel } from '@/shared/components/product';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

/** Select value for "no category filter" (Base UI items need a non-empty value). */
const ALL = 'all';

type CourseFiltersProps = {
  categories: readonly CourseCategoryListItem[];
  locale: Locale;
  query: string;
  categoryId: string;
  onQueryChange: (query: string) => void;
  /** Applies at once: picking a category is a complete action. */
  onCategoryChange: (categoryId: string) => void;
  onSubmit: () => void;
};

/** Catalog filter bar: name search + category, one row from `sm`. */
export function CourseFilters({
  categories,
  locale,
  query,
  categoryId,
  onQueryChange,
  onCategoryChange,
  onSubmit,
}: CourseFiltersProps) {
  const t = useTranslations('academyCourses');
  const items = useMemo(
    () => [
      { value: ALL, label: t.filter.allCategories },
      ...getCategorySelectOptions(categories, locale),
    ],
    [categories, locale, t.filter.allCategories]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Panel className='p-3 sm:p-4'>
      <form
        role='search'
        onSubmit={handleSubmit}
        className='grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,240px)_auto] sm:gap-3'
      >
        <div className='relative col-span-2 sm:col-span-1'>
          <label htmlFor='academy-course-search' className='sr-only'>
            {t.filter.searchLabel}
          </label>
          <Search
            className='pointer-events-none absolute start-3.5 top-1/2 z-10 size-[18px] -translate-y-1/2 text-[#6b7196]'
            aria-hidden
          />
          <Input
            id='academy-course-search'
            type='search'
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t.filter.searchPlaceholder}
            enterKeyHint='search'
            className='h-11 rounded-xl border-[#d9ddea] pe-3 ps-10 text-[15px] text-[#1e2364] placeholder:text-[#6b7196] focus:border-[#1e2364] focus:ring-[#1e2364]/15'
          />
        </div>

        <div className='min-w-0'>
          <label htmlFor='academy-course-category' className='sr-only'>
            {t.filter.sectionLabel}
          </label>
          <Select
            value={categoryId || ALL}
            onValueChange={(next) => onCategoryChange(!next || next === ALL ? '' : String(next))}
            items={items}
            modal={false}
          >
            <SelectTrigger
              id='academy-course-category'
              className='h-11 w-full rounded-xl border-[#d9ddea] bg-white px-3 text-[15px] text-[#1e2364] shadow-none transition-colors duration-150 hover:bg-[#f7f8fb] focus-visible:border-[#1e2364] focus-visible:ring-2 focus-visible:ring-[#1e2364]/15 data-[size=default]:h-11 [&_svg]:text-[#6b7196]'
            >
              <SelectValue className='min-w-0 text-start' />
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              align='start'
              sideOffset={4}
              className='max-h-72'
            >
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type='submit' variant='product' size='control'>
          <Search className='size-4' aria-hidden />
          {t.filter.searchBtn}
        </Button>
      </form>
    </Panel>
  );
}
