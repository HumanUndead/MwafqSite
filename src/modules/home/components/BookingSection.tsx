'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { ServiceGroupItem } from '@/app/api/services/service-groups/route';
import type { CityItem } from '@/app/api/general/cities/route';
import { getServiceGroupBuyPath } from '@/modules/services/booking.shared';
import type { HomeBookingContent } from '../home.types';
import { BookingMascot } from './BookingMascot';

const KSA_COUNTRY_ID = 14;

interface Option {
  id: number | string;
  name: string;
}

function useDismiss(close: () => void) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    function onClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [close]);

  return wrapRef;
}

function SearchSelect({
  value,
  onSelect,
  placeholder,
  options,
  loading,
  query,
  onQueryChange,
  disabled = false,
}: {
  value: string;
  onSelect: (option: Option) => void;
  placeholder: string;
  options: Option[];
  loading: boolean;
  query: string;
  onQueryChange: (next: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const wrapRef = useDismiss(() => setOpen(false));
  const effectiveOpen = open && !disabled;

  useEffect(() => {
    if (effectiveOpen) setTimeout(() => searchRef.current?.focus(), 0);
  }, [effectiveOpen]);

  return (
    <div ref={wrapRef} className='relative w-full'>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={effectiveOpen}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={[
          'flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm font-[inherit] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-[border-color,box-shadow]',
          disabled
            ? 'cursor-not-allowed border-[#e5e7f0] opacity-55'
            : effectiveOpen
              ? 'border-[#00a8f1] shadow-[0_0_0_3px_rgba(0,168,241,0.20)]'
              : 'border-[#e5e7f0]',
        ].join(' ')}
      >
        <span
          className={`flex-1 truncate text-left ${value ? 'text-[#1e2364]' : 'text-[rgba(30,35,100,0.45)]'}`}
        >
          {value || placeholder}
        </span>
        <svg
          className={`flex-shrink-0 text-[rgba(30,35,100,0.55)] transition-transform duration-150 ${effectiveOpen ? 'rotate-180' : ''}`}
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <polyline points='6 9 12 15 18 9' />
        </svg>
      </button>
      {effectiveOpen ? (
        <div
          role='listbox'
          className='absolute left-0 top-[calc(100%+4px)] z-[100] w-full rounded-lg border border-[#e5e7f0] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]'
        >
          <div className='border-b border-[#e5e7f0] p-1.5'>
            <input
              ref={searchRef}
              type='text'
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className='h-8 w-full rounded-md bg-[rgba(30,35,100,0.04)] px-2.5 text-sm text-[#1e2364] outline-none placeholder:text-[rgba(30,35,100,0.35)] focus:ring-1 focus:ring-[#00a8f1]'
              placeholder='Search…'
            />
          </div>
          <ul className='max-h-60 list-none overflow-y-auto p-1'>
            {loading ? (
              <li className='py-3 text-center text-[13px] text-[rgba(30,35,100,0.45)]'>
                Loading…
              </li>
            ) : options.length === 0 ? (
              <li className='py-3 text-center text-[13px] text-[rgba(30,35,100,0.45)]'>
                No results
              </li>
            ) : (
              options.map((option) => (
                <li
                  key={option.id}
                  role='option'
                  aria-selected={value === option.name}
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  className='relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-[#1e2364] transition-colors hover:bg-[rgba(0,168,241,0.08)]'
                >
                  {value === option.name ? (
                    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-[#1e2364]'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='h-3.5 w-3.5'
                      >
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    </span>
                  ) : null}
                  {option.name}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ServiceSelect({
  locale,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  locale: Locale;
  value: string;
  onChange: (option: Option) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<ServiceGroupItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ culture: locale });
      if (query.trim()) params.set('search', query.trim());

      fetch(`/api/services/service-groups?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((payload) => {
          if (payload.success) setOptions(payload.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [locale, query, disabled]);

  return (
    <SearchSelect
      value={value}
      onSelect={onChange}
      placeholder={placeholder}
      options={options}
      loading={loading}
      query={query}
      onQueryChange={setQuery}
      disabled={disabled}
    />
  );
}

function CitySelect({
  locale,
  value,
  onChange,
  placeholder,
}: {
  locale: Locale;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(
        `/api/general/cities?countryId=${KSA_COUNTRY_ID}&culture=${locale}`,
        {
          signal: controller.signal,
        }
      )
        .then((res) => res.json())
        .then((payload) => {
          if (payload.success) setCities(payload.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 0);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [locale]);

  const term = query.trim().toLowerCase();
  const options: Option[] = cities
    .filter((city) => city.name.trim().length > 0)
    .filter((city) => (term ? city.name.toLowerCase().includes(term) : true))
    .map((city) => ({ id: `${city.id}-${city.langId}`, name: city.name }));

  return (
    <SearchSelect
      value={value}
      onSelect={(option) => onChange(option.name)}
      placeholder={placeholder}
      options={options}
      loading={loading}
      query={query}
      onQueryChange={setQuery}
    />
  );
}

interface BookingSectionProps {
  locale: Locale;
  content: HomeBookingContent;
}

export function BookingSection({ locale, content }: BookingSectionProps) {
  const router = useRouter();
  const [service, setService] = useState<Option | null>(null);
  const [city, setCity] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const hasCity = city.trim().length > 0;
  const canSearch = hasCity && service !== null;

  const handleSearch = () => {
    if (!service) return;
    router.push(getServiceGroupBuyPath(locale, Number(service.id)));
  };

  return (
    <section
      id='booking'
      className='relative z-50 px-4 pb-2 pt-4 md:pb-4 md:pt-6 md:px-7'
    >
      <BookingMascot locale={locale} cardRef={cardRef} label={content.title} />

      <div className='relative mx-auto max-w-275'>
        <div
          ref={cardRef}
          className='relative overflow-visible rounded-[32px] border-2 border-[#1e2364] bg-white px-5 pb-16 pt-8 text-center sm:px-10 sm:pb-17.5 sm:pt-10 md:px-14 md:pb-22.5 md:pt-11.5'
        >
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -inset-px right-0 top-0 h-[120px] w-[120px]'
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpolygon points='7.1 14.8 0 14.8 0 0 15.1 0 15.1 7.1 7.1 7.1 7.1 14.8' fill='%2300a8f1' fill-opacity='0.18'/%3E%3Cpolygon points='15.5 23.1 8.4 23.1 8.4 8.3 23.5 8.3 23.5 15.4 15.5 15.4 15.5 23.1' fill='%231e2364' fill-opacity='0.18'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
              backgroundRepeat: 'repeat',
              maskImage:
                'radial-gradient(circle at top right, #000, transparent 70%)',
              WebkitMaskImage:
                'radial-gradient(circle at top right, #000, transparent 70%)',
            }}
          />

          <span className="relative left-1/2 mb-3.5 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(0,222,201,0.16)] px-3.5 py-[5px] text-[12px] font-bold uppercase tracking-[2px] text-[#007a6e] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#00dec9] before:shadow-[0_0_8px_#00dec9] before:content-['']">
            {content.eyebrow}
          </span>

          <h2 className='relative z-10 mx-auto mb-6 text-[clamp(24px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364] md:mb-9'>
            {content.title}
          </h2>

          <form
            onSubmit={(event) => event.preventDefault()}
            className='relative z-[5] grid items-end gap-[18px] text-left md:grid-cols-[1.4fr_1.4fr_auto]'
          >
            <div>
              <label className='mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]'>
                {content.fields.city.label}
              </label>
              <CitySelect
                locale={locale}
                value={city}
                onChange={setCity}
                placeholder={content.fields.city.placeholder}
              />
            </div>
            <div>
              <label className='mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]'>
                {content.fields.exam.label}
              </label>
              <ServiceSelect
                locale={locale}
                value={service?.name ?? ''}
                onChange={setService}
                placeholder={content.fields.exam.placeholder}
                disabled={!hasCity}
              />
            </div>
            <button
              type='button'
              onClick={handleSearch}
              disabled={!canSearch}
              className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1e2364] px-5.5 text-[14px] font-semibold text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition hover:bg-[#233567] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-[#1e2364] md:w-auto'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.4'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <circle cx='11' cy='11' r='8' />
                <line x1='21' y1='21' x2='16.65' y2='16.65' />
              </svg>
              {content.fields.search.label}
            </button>
          </form>

          <div className='absolute bottom-5 left-5 right-5 z-2 flex items-start gap-1 sm:bottom-7 sm:left-10 sm:right-10 md:bottom-10 md:left-14 md:right-14'>
            <div
              aria-hidden='true'
              className='mt-[3px] h-2.5 w-2.5 flex-shrink-0'
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
              }}
            />
            <p className='text-[11.5px] font-medium leading-[1.45] text-[#6b7196]'>
              {content.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
