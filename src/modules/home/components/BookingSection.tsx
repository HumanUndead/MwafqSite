'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { CountryItem } from '@/app/api/general/countries/route';
import type { HomeBookingContent } from '../home.types';
import { CmsLink } from './CmsLink';
import { BookingMascot } from './BookingMascot';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

interface DateVal {
  y: number;
  m: number;
  d: number;
}

function DatePicker({
  value,
  placeholder,
  onChange,
}: {
  value: DateVal | null;
  placeholder: string;
  onChange: (nextValue: DateVal) => void;
}) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewM, setViewM] = useState(today.getMonth());
  const [viewY, setViewY] = useState(today.getFullYear());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function onClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const firstDay = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

  const cells: Array<{
    d: number;
    out?: boolean;
    isToday?: boolean;
    isSelected?: boolean;
  }> = [];
  const prevDays = new Date(viewY, viewM, 0).getDate();
  for (let index = firstDay - 1; index >= 0; index -= 1) {
    cells.push({ d: prevDays - index, out: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isToday =
      day === today.getDate() &&
      viewM === today.getMonth() &&
      viewY === today.getFullYear();
    const isSelected = value
      ? value.d === day && value.m === viewM && value.y === viewY
      : false;
    cells.push({ d: day, isToday, isSelected });
  }

  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day += 1) {
      cells.push({ d: day, out: true });
    }
  }

  const displayValue = value
    ? `${pad(value.d)} / ${pad(value.m + 1)} / ${value.y}`
    : null;

  return (
    <div ref={wrapRef} className='relative w-full'>
      <button
        type='button'
        aria-haspopup='dialog'
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          'flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm font-[inherit] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-[border-color,box-shadow]',
          open
            ? 'border-[#00a8f1] shadow-[0_0_0_3px_rgba(0,168,241,0.20)]'
            : 'border-[#e5e7f0]',
        ].join(' ')}
      >
        <span
          className={
            displayValue ? 'text-[#1e2364]' : 'text-[rgba(30,35,100,0.45)]'
          }
        >
          {displayValue ?? placeholder}
        </span>
        <svg
          className='flex-shrink-0 text-[rgba(30,35,100,0.55)]'
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
          <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
          <line x1='16' y1='2' x2='16' y2='6' />
          <line x1='8' y1='2' x2='8' y2='6' />
          <line x1='3' y1='10' x2='21' y2='10' />
        </svg>
      </button>
      {open ? (
        <div
          role='dialog'
          className='absolute left-0 top-[calc(100%+4px)] z-[100] w-[232px] rounded-lg border border-[#e5e7f0] bg-white p-2.5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)]'
        >
          <div className='mb-1.5 flex items-center justify-between px-0.5'>
            <button
              type='button'
              onClick={() => {
                if (viewM === 0) {
                  setViewM(11);
                  setViewY((year) => year - 1);
                } else setViewM((month) => month - 1);
              }}
              className='flex h-6 w-6 items-center justify-center rounded border border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:bg-[rgba(0,168,241,0.08)]'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polyline points='15 18 9 12 15 6' />
              </svg>
            </button>
            <span className='text-[13px] font-semibold tracking-[-0.2px] text-[#1e2364]'>
              {MONTHS[viewM]} {viewY}
            </span>
            <button
              type='button'
              onClick={() => {
                if (viewM === 11) {
                  setViewM(0);
                  setViewY((year) => year + 1);
                } else setViewM((month) => month + 1);
              }}
              className='flex h-6 w-6 items-center justify-center rounded border border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:bg-[rgba(0,168,241,0.08)]'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polyline points='9 18 15 12 9 6' />
              </svg>
            </button>
          </div>
          <div className='mb-0.5 grid grid-cols-7 gap-0.5'>
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className='py-1 text-center text-[10px] font-semibold uppercase tracking-[0.04em] text-[rgba(30,35,100,0.45)]'
              >
                {day}
              </span>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-0.5'>
            {cells.map((cell, index) => (
              <button
                key={index}
                type='button'
                disabled={cell.out}
                onClick={() => {
                  if (!cell.out) {
                    onChange({ y: viewY, m: viewM, d: cell.d });
                    setOpen(false);
                  }
                }}
                className={[
                  'flex h-[26px] items-center justify-center rounded border-none bg-transparent text-[12px] font-[inherit] text-[#1e2364]',
                  cell.out
                    ? 'cursor-default text-[rgba(30,35,100,0.25)]'
                    : 'cursor-pointer hover:bg-[rgba(0,168,241,0.10)]',
                  cell.isToday
                    ? 'underline decoration-[#00a8f1] decoration-2 underline-offset-[3px]'
                    : '',
                  cell.isSelected
                    ? '!bg-transparent !font-bold !text-[#00a8f1]'
                    : '',
                ].join(' ')}
              >
                {cell.d}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExamSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function onClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div ref={wrapRef} className='relative w-full'>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          'flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm font-[inherit] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-[border-color,box-shadow]',
          open
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
          className={`flex-shrink-0 text-[rgba(30,35,100,0.55)] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
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
      {open ? (
        <ul
          role='listbox'
          className='absolute left-0 top-[calc(100%+4px)] z-[100] max-h-96 w-full list-none overflow-y-auto rounded-lg border border-[#e5e7f0] bg-white p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]'
        >
          {options.map((option) => (
            <li
              key={option}
              role='option'
              aria-selected={value === option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className='relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-[#1e2364] transition-colors hover:bg-[rgba(0,168,241,0.08)]'
            >
              {value === option ? (
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
              {option}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CountrySelect({
  locale,
  value,
  onChange,
  placeholder,
}: {
  locale: Locale;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/general/countries?culture=${locale}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setCountries(payload.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    function onClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = query.trim()
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : countries;

  return (
    <div ref={wrapRef} className='relative w-full'>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          'flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm font-[inherit] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-[border-color,box-shadow]',
          open
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
          className={`flex-shrink-0 text-[rgba(30,35,100,0.55)] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
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
      {open ? (
        <div
          role='listbox'
          className='absolute left-0 top-[calc(100%+4px)] z-[100] w-full rounded-lg border border-[#e5e7f0] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]'
        >
          <div className='border-b border-[#e5e7f0] p-1.5'>
            <input
              ref={searchRef}
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='h-8 w-full rounded-md bg-[rgba(30,35,100,0.04)] px-2.5 text-sm text-[#1e2364] outline-none placeholder:text-[rgba(30,35,100,0.35)] focus:ring-1 focus:ring-[#00a8f1]'
              placeholder='Search…'
            />
          </div>
          <ul className='max-h-60 list-none overflow-y-auto p-1'>
            {loading ? (
              <li className='py-3 text-center text-[13px] text-[rgba(30,35,100,0.45)]'>
                Loading…
              </li>
            ) : filtered.length === 0 ? (
              <li className='py-3 text-center text-[13px] text-[rgba(30,35,100,0.45)]'>
                No results
              </li>
            ) : (
              filtered.map((country) => (
                <li
                  key={country.id}
                  role='option'
                  aria-selected={value === country.name}
                  onClick={() => {
                    onChange(country.name);
                    setOpen(false);
                  }}
                  className='relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-[#1e2364] transition-colors hover:bg-[rgba(0,168,241,0.08)]'
                >
                  {value === country.name ? (
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
                  {country.name}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

interface BookingSectionProps {
  locale: Locale;
  content: HomeBookingContent;
}

export function BookingSection({ locale, content }: BookingSectionProps) {
  const [exam, setExam] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState<DateVal | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id='booking'
      className='relative z-50 px-4 pb-10 pt-12 md:pb-16 md:pt-20 md:px-7'
    >
      <BookingMascot locale={locale} cardRef={cardRef} label={content.title} />

      <div className='relative mx-auto max-w-[1100px]'>
        <div
          ref={cardRef}
          className='relative overflow-visible rounded-[32px] border-2 border-[#1e2364] bg-white px-14 pb-[90px] pt-[46px] text-center'
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

          <h2 className='relative z-10 mx-auto mb-9 text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364]'>
            {content.title}
          </h2>

          <form
            onSubmit={(event) => event.preventDefault()}
            className='relative z-[5] grid items-end gap-[18px] text-left md:grid-cols-[1.2fr_1.2fr_1fr_auto]'
          >
            <div>
              <label className='mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]'>
                {content.fields.exam.label}
              </label>
              <ExamSelect
                value={exam}
                onChange={setExam}
                options={content.examOptions}
                placeholder={content.fields.exam.placeholder}
              />
            </div>
            <div>
              <label className='mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]'>
                {content.fields.city.label}
              </label>
              <CountrySelect
                locale={locale}
                value={city}
                onChange={setCity}
                placeholder={content.fields.city.placeholder}
              />
            </div>
            <div>
              <label className='mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]'>
                {content.fields.date.label}
              </label>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder={content.fields.date.placeholder}
              />
            </div>
            <CmsLink
              locale={locale}
              href={content.fields.search.path}
              className='inline-flex h-12 items-center gap-2 rounded-full bg-[#1e2364] px-[22px] text-[14px] font-semibold text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition hover:bg-[#233567]'
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
            </CmsLink>
          </form>

          <div className='absolute bottom-10 left-14 right-14 z-[2] flex items-start gap-1'>
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
