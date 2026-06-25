'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DdlItem, UserSearchItem } from '../types/company.types';
import { useCompanyCreate } from '../hooks/useCompanyCreate';
import { RichTextEditor } from './RichTextEditor';

const triggerCn = cn(
  '!h-[52px] w-full rounded-[14px] border-[#d9ddea] bg-white px-3.5 text-[14px] text-[#1e2364] shadow-none',
  'transition-[border-color,box-shadow] duration-200',
  'focus-visible:border-[#00a8f1] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,168,241,0.20)]',
  'data-placeholder:text-[rgba(30,35,100,0.45)]'
);

const contentCn = cn(
  'max-h-60 rounded-lg border-[#e5e7f0] bg-white p-1 text-[#1e2364] shadow-lg ring-1 ring-[#e5e7f0]/80',
  '!duration-0 data-open:animate-none data-closed:animate-none',
  'data-open:zoom-in-100 data-closed:zoom-out-100'
);

const itemCn = cn(
  'rounded-md py-2 pl-2 pr-8 text-[14px] text-[#1e2364]',
  'focus:bg-[rgba(0,168,241,0.08)] focus:text-[#1e2364] data-highlighted:bg-[rgba(0,168,241,0.08)]'
);

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-[#a3a8c4]'>
      {children}
    </h3>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className='mb-1.5 block px-1 text-[13px] font-bold tracking-[-0.01em] text-[#1e2364]'>
      {children}
      {required ? <span className='ml-0.5 text-red-500'>*</span> : null}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className='mt-1 px-1 text-xs text-red-500'>{msg}</p>;
}

function TextField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex min-h-[52px] w-full rounded-[14px] border border-[#d9ddea] bg-white px-3.5',
          'text-sm text-[#1e2364] placeholder:text-[rgba(30,35,100,0.4)]',
          'transition-[border-color,box-shadow] duration-200 outline-none',
          'focus:border-[#00a8f1] focus:ring-[3px] focus:ring-[rgba(0,168,241,0.20)]',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-200/50',
          disabled && 'opacity-60 cursor-not-allowed bg-[#f8f9fc]'
        )}
      />
      <FieldError msg={error} />
    </div>
  );
}

function DdlSelect({
  label,
  required,
  items,
  value,
  onValueChange,
  placeholder,
  locale,
  loading,
  error,
  disabled,
}: {
  label: string;
  required?: boolean;
  items: DdlItem[];
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  locale: string;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading || items.length === 0;

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <Select
        value={value || null}
        onValueChange={(v) => onValueChange(v ?? '')}
        disabled={isDisabled}
        items={items.map((i) => ({ value: i.id, label: getTranslationName(i.translations, locale as 'en' | 'ar') }))}
        modal={false}
      >
        <SelectTrigger className={cn(triggerCn, error && 'border-red-400')}>
          <SelectValue placeholder={loading ? '…' : placeholder} />
        </SelectTrigger>
        <SelectContent
          className={contentCn}
          side='bottom'
          sideOffset={4}
          align='start'
          alignItemWithTrigger={false}
          collisionAvoidance={{ side: 'none' }}
          positionMethod='fixed'
          hideScrollButtons
        >
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id} className={itemCn}>
              {getTranslationName(item.translations, locale as 'en' | 'ar')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError msg={error} />
    </div>
  );
}

function UserSearchBox({
  label,
  placeholder,
  results,
  loading,
  onSearch,
  onSelect,
  selectedId,
  onClear,
  noResultsMessage,
  noResultsHint,
  searchingMessage,
}: {
  label: string;
  placeholder: string;
  results: UserSearchItem[];
  loading: boolean;
  onSearch: (term: string) => void;
  onSelect: (user: UserSearchItem) => void;
  selectedId: string;
  onClear: () => void;
  noResultsMessage: string;
  noResultsHint: string;
  searchingMessage: string;
}) {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTerm(v);
    if (selectedId) onClear();
    setOpen(v.length > 0);
    onSearch(v);
  };

  const handleSelect = (user: UserSearchItem) => {
    setTerm(`${user.firstName} ${user.lastName}`.trim());
    setOpen(false);
    onSelect(user);
  };

  const handleClear = () => {
    setTerm('');
    setOpen(false);
    onClear();
  };

  const showResultsDropdown =
    open && term.length > 0 && !selectedId && (loading || results.length > 0);
  const showNoResultsHint =
    open && term.length > 0 && !loading && !selectedId && results.length === 0;

  return (
    <div ref={ref} className='relative'>
      <FieldLabel>{label}</FieldLabel>
      <div className='relative'>
        <input
          value={term}
          onChange={handleChange}
          onFocus={() => term && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className={cn(
            'flex min-h-[52px] w-full rounded-[14px] border border-[#d9ddea] bg-white px-3.5 pr-10',
            'text-sm text-[#1e2364] placeholder:text-[rgba(30,35,100,0.4)] outline-none',
            'transition-[border-color,box-shadow] duration-200',
            'focus:border-[#00a8f1] focus:ring-[3px] focus:ring-[rgba(0,168,241,0.20)]'
          )}
        />
        {selectedId ? (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a8c4] hover:text-[#1e2364]'
            aria-label='Clear'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
        ) : null}
      </div>

      {showResultsDropdown ? (
        <div className='absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#e5e7f0] bg-white shadow-lg'>
          {loading ? (
            <p className='px-3.5 py-3 text-sm text-[#a3a8c4]'>{searchingMessage}</p>
          ) : (
            <ul>
              {results.map((u) => (
                <li key={u.id}>
                  <button
                    type='button'
                    onMouseDown={() => handleSelect(u)}
                    className='flex w-full flex-col px-3.5 py-2.5 text-left hover:bg-[rgba(0,168,241,0.06)]'
                  >
                    <span className='text-[14px] font-semibold text-[#1e2364]'>
                      {u.firstName} {u.lastName}
                    </span>
                    <span className='text-xs text-[#6b7196]'>{u.email} · {u.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {showNoResultsHint ? (
        <p className='mt-1.5 px-1 text-xs leading-relaxed text-[#6b7196]' role='status'>
          <span className='font-semibold text-[#1e2364]'>{noResultsMessage}</span>
          {' — '}
          {noResultsHint}
        </p>
      ) : null}
    </div>
  );
}

// Kept for classification section (currently commented out in the form)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TagsMultiSelect({
  label,
  items,
  selected,
  onToggle,
  locale,
  loading,
  placeholder,
}: {
  label: string;
  items: DdlItem[];
  selected: string[];
  onToggle: (id: string) => void;
  locale: string;
  loading?: boolean;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedNames = selected
    .map((id) => {
      const item = items.find((i) => i.id === id);
      return item ? getTranslationName(item.translations, locale as 'en' | 'ar') : id;
    })
    .filter(Boolean)
    .join(', ');

  return (
    <div className='relative'>
      <FieldLabel>{label}</FieldLabel>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        disabled={loading || items.length === 0}
        className={cn(
          'flex min-h-[52px] w-full items-center justify-between rounded-[14px] border border-[#d9ddea]',
          'bg-white px-3.5 text-left text-sm transition-[border-color,box-shadow] duration-200',
          'focus:border-[#00a8f1] focus:ring-[3px] focus:ring-[rgba(0,168,241,0.20)] outline-none',
          open && 'border-[#00a8f1] ring-[3px] ring-[rgba(0,168,241,0.20)]',
          (loading || items.length === 0) && 'opacity-60 cursor-not-allowed'
        )}
      >
        <span className={cn('flex-1 truncate', !selectedNames && 'text-[rgba(30,35,100,0.45)]')}>
          {loading ? '…' : selectedNames || placeholder}
        </span>
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='shrink-0 text-[#a3a8c4]' aria-hidden='true'>
          <polyline points='6 9 12 15 18 9' />
        </svg>
      </button>

      {open ? (
        <div className='absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#e5e7f0] bg-white shadow-lg'>
          <ul className='max-h-56 overflow-y-auto p-1'>
            {items.map((item) => {
              const name = getTranslationName(item.translations, locale as 'en' | 'ar');
              const checked = selected.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type='button'
                    onClick={() => onToggle(item.id)}
                    className='flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-[rgba(0,168,241,0.06)]'
                  >
                    <span className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                      checked ? 'border-[#00a8f1] bg-[#00a8f1]' : 'border-[#cfd5e6] bg-white'
                    )}>
                      {checked ? (
                        <svg width='10' height='10' viewBox='0 0 12 12' fill='none' stroke='white' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M2 6.5 4.7 9 10 3' />
                        </svg>
                      ) : null}
                    </span>
                    <span className='text-[14px] text-[#1e2364]'>{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className='border-t border-[#e5e7f0] px-2.5 py-2'>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='w-full rounded-lg bg-[#f0f2fa] py-1.5 text-xs font-semibold text-[#1e2364] hover:bg-[#e5e7f0]'
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LogoUpload({
  label,
  file,
  onChange,
  hintText,
  subHintText,
  uploadText,
  changeText,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  hintText: string;
  subHintText: string;
  uploadText: string;
  changeText: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className='flex flex-col gap-1.5'>
      <FieldLabel>{label}</FieldLabel>
      <div className='flex min-h-[52px] items-center justify-between gap-3 rounded-[14px] border border-[#d9ddea] bg-white px-3.5 py-2'>
        <div className='flex min-w-0 items-center gap-2.5'>
          {previewUrl ? (
            <img src={previewUrl} alt='Logo preview' className='size-9 rounded-lg object-cover' />
          ) : null}
          <div className='min-w-0'>
            <p className={cn('truncate text-sm font-medium', file ? 'text-[#1e2364]' : 'text-[#a3a8c4]')}>
              {file ? file.name : hintText}
            </p>
            <p className='mt-0.5 text-xs text-[#6b7196]'>{subHintText}</p>
          </div>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          shape='pill'
          className='shrink-0 border-[#1e2364] text-[#1e2364] hover:bg-[#1e2364] hover:text-white'
          onClick={() => fileRef.current?.click()}
        >
          {file ? changeText : uploadText}
        </Button>
      </div>
      <input
        ref={fileRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export function CompanyCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const company = useTranslations('company');

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(getLocalizedRoute(locale, ROUTES.HOME));
    }
  };

  const {
    form,
    errors,
    submitting,
    updateField,
    handleSubmit,
    searchUsers,
    selectContactUser,
    clearContactUser,
    userResults,
    usersLoading,
    ddl,
    loading,
  } = useCompanyCreate(handleSuccess);

  const [langTab, setLangTab] = useState<'en' | 'ar'>('en');

  const enLangErrors = !!(errors.nameEn || errors.addressEn);
  const arLangErrors = !!(errors.nameAr || errors.addressAr);
  const hiddenLangAlert =
    langTab === 'en' && arLangErrors
      ? company.validation.switchToArabicTab
      : langTab === 'ar' && enLangErrors
        ? company.validation.switchToEnglishTab
        : null;

  const onFormSubmit = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    if (result && !result.valid && result.focusLangTab) {
      setLangTab(result.focusLangTab);
    }
  };

  return (
    <form onSubmit={onFormSubmit} className='flex flex-col gap-6' noValidate>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-bold text-[#1e2364]'>{company.create.title}</h2>
        <p className='text-sm text-[#6b7196]'>{company.create.subtitle}</p>
      </div>

      {/* ── Language tabs ── */}
      <div>
        <div className='mb-4 flex gap-2 border-b border-[#e5e7f0]'>
          {(['en', 'ar'] as const).map((tab) => {
            const tabHasError = tab === 'en' ? enLangErrors : arLangErrors;
            return (
              <button
                key={tab}
                type='button'
                onClick={() => setLangTab(tab)}
                className={cn(
                  '-mb-px flex items-center gap-1.5 border-b-2 px-4 pb-2.5 text-[13px] font-semibold transition-colors',
                  langTab === tab
                    ? 'border-[#00a8f1] text-[#1e2364]'
                    : tabHasError
                      ? 'border-transparent text-red-600 hover:text-red-700'
                      : 'border-transparent text-[#a3a8c4] hover:text-[#1e2364]'
                )}
              >
                {tab === 'en' ? company.tabs.en : company.tabs.ar}
                {tabHasError ? (
                  <span
                    className='size-1.5 shrink-0 rounded-full bg-red-500'
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {hiddenLangAlert ? (
          <p
            role='alert'
            className='mb-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] leading-snug text-red-700'
          >
            {hiddenLangAlert}
          </p>
        ) : null}

        <div className={cn('flex flex-col gap-4', langTab !== 'en' && 'hidden')}>
          <TextField
            label={company.fields.nameEn}
            required
            value={form.nameEn}
            onChange={(v) => updateField('nameEn', v)}
            placeholder={company.placeholders.nameEn}
            error={errors.nameEn}
          />
          <RichTextEditor
            key='company-address-en'
            label={company.fields.addressEn}
            required
            value={form.addressEn}
            onChange={(v) => updateField('addressEn', v)}
            placeholder={company.placeholders.address}
            error={errors.addressEn}
          />
        </div>

        <div className={cn('flex flex-col gap-4', langTab !== 'ar' && 'hidden')}>
          <TextField
            label={company.fields.nameAr}
            required
            value={form.nameAr}
            onChange={(v) => updateField('nameAr', v)}
            placeholder={company.placeholders.nameAr}
            error={errors.nameAr}
          />
          <RichTextEditor
            key='company-address-ar'
            label={company.fields.addressAr}
            required
            value={form.addressAr}
            onChange={(v) => updateField('addressAr', v)}
            placeholder={company.placeholders.address}
            error={errors.addressAr}
          />
        </div>
      </div>

      {/* ── Company Info ── */}
      <div className='rounded-[14px] border border-[#e5e7f0] bg-[#fafbfd] p-4'>
        <SectionHeading>{company.sections.info}</SectionHeading>
        <div className='grid gap-4 sm:grid-cols-2'>
          <DdlSelect
            label={company.fields.companyType}
            required
            items={ddl.types}
            value={form.companyTypeId}
            onValueChange={(v) => updateField('companyTypeId', v)}
            placeholder={company.placeholders.selectType}
            locale={locale}
            loading={loading.typesLoading}
            error={errors.companyTypeId}
          />
          <TextField
            label={company.fields.rank}
            required
            value={form.rank}
            onChange={(v) => updateField('rank', v)}
            placeholder={company.placeholders.rank}
            type='number'
            error={errors.rank}
          />
          <TextField
            label={company.fields.companyPhone}
            value={form.companyPhone}
            onChange={(v) => updateField('companyPhone', v)}
            placeholder={company.placeholders.companyPhone}
            type='tel'
          />
          <TextField
            label={company.fields.companySize}
            value={form.companySize}
            onChange={(v) => updateField('companySize', v)}
            placeholder={company.placeholders.companySize}
            type='number'
          />
          <TextField
            label={company.fields.crNumber}
            required
            value={form.crNumber}
            onChange={(v) => updateField('crNumber', v)}
            placeholder={company.placeholders.crNumber}
            error={errors.crNumber}
          />
          <TextField
            label={company.fields.vatNumber}
            required
            value={form.vatNumber}
            onChange={(v) => updateField('vatNumber', v)}
            placeholder={company.placeholders.vatNumber}
            error={errors.vatNumber}
          />
          <TextField
            label={company.fields.ipan}
            value={form.ipan}
            onChange={(v) => updateField('ipan', v)}
            placeholder={company.placeholders.ipan}
          />
          <LogoUpload
            label={company.fields.logo}
            file={form.logo}
            onChange={(f) => updateField('logo', f)}
            hintText={company.placeholders.logoHint}
            subHintText={company.placeholders.logoSubHint}
            uploadText={company.placeholders.uploadLogo}
            changeText={company.placeholders.changeLogo}
          />
        </div>
      </div>

      {/* ── Location ── */}
      <div className='rounded-[14px] border border-[#e5e7f0] bg-[#fafbfd] p-4'>
        <SectionHeading>{company.sections.location}</SectionHeading>
        <div className='grid gap-4 sm:grid-cols-2'>
          <DdlSelect
            label={company.fields.country}
            required
            items={ddl.countries}
            value={form.countryId}
            onValueChange={(v) => updateField('countryId', v)}
            placeholder={company.placeholders.selectCountry}
            locale={locale}
            loading={loading.countriesLoading}
            error={errors.countryId}
          />
          <DdlSelect
            label={company.fields.city}
            required
            items={ddl.cities}
            value={form.cityId}
            onValueChange={(v) => updateField('cityId', v)}
            placeholder={form.countryId ? company.placeholders.selectCity : company.ddl.selectCountryFirst}
            locale={locale}
            loading={loading.citiesLoading}
            error={errors.cityId}
            disabled={!form.countryId}
          />
        </div>
      </div>

      {/* ── Contact ── */}
      <div className='rounded-[14px] border border-[#e5e7f0] bg-[#fafbfd] p-4'>
        <SectionHeading>{company.sections.contact}</SectionHeading>
        <div className='flex flex-col gap-4'>
          <UserSearchBox
            label={company.fields.contactUser}
            placeholder={company.placeholders.contactSearch}
            results={userResults}
            loading={usersLoading}
            onSearch={searchUsers}
            onSelect={selectContactUser}
            selectedId={form.selectedContactUserId}
            onClear={clearContactUser}
            noResultsMessage={company.contact.noResults}
            noResultsHint={company.contact.noResultsHint}
            searchingMessage={company.contact.searching}
          />
          <div className='grid gap-4 sm:grid-cols-2'>
            <TextField
              label={company.fields.contactFirstName}
              required
              value={form.contactFirstName}
              onChange={(v) => updateField('contactFirstName', v)}
              error={errors.contactFirstName}
            />
            <TextField
              label={company.fields.contactLastName}
              required
              value={form.contactLastName}
              onChange={(v) => updateField('contactLastName', v)}
              error={errors.contactLastName}
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <TextField
              label={company.fields.contactEmail}
              required
              value={form.contactEmail}
              onChange={(v) => updateField('contactEmail', v)}
              type='email'
              error={errors.contactEmail}
            />
            <TextField
              label={company.fields.contactPhone}
              required
              value={form.contactPhone}
              onChange={(v) => updateField('contactPhone', v)}
              type='tel'
              error={errors.contactPhone}
            />
          </div>
        </div>
      </div>

      {/* ── Classification (tags) — hidden for now
      <div className='rounded-[14px] border border-[#e5e7f0] bg-[#fafbfd] p-4'>
        <SectionHeading>{company.sections.classification}</SectionHeading>
        <div className='flex flex-col gap-4'>
          <TagsMultiSelect
            label={company.fields.tags}
            items={ddl.tags}
            selected={form.tagIds}
            onToggle={toggleTag}
            locale={locale}
            loading={loading.tagsLoading}
            placeholder={company.placeholders.selectTags}
          />
        </div>
      </div>
      */}

      <Button
        type='submit'
        loading={submitting}
        variant='brand'
        size='lg'
        className='mt-2 w-full rounded-[14px] py-3 text-[15px]'
      >
        {company.create.submit}
      </Button>
    </form>
  );
}
