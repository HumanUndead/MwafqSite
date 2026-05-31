'use client';

import type { KeyboardEventHandler, ReactNode } from 'react';

const inputClassName =
  'h-[42px] w-full rounded-lg border border-[#e5e7f0] bg-white px-3.5 py-1.5 text-[13.5px] text-[#1e2364] font-inherit transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-[rgba(30,35,100,0.45)] focus:border-[#00a8f1] focus:shadow-[0_0_0_3px_rgba(0,168,241,0.20)] focus:outline-none';

const labelClassName =
  'mb-2 ml-1.5 block text-[13px] font-bold tracking-[-0.1px] text-[#1e2364] rtl:ml-0 rtl:mr-1.5';

export type PageFilterSearchFieldProps = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  className?: string;
};

export function PageFilterSearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  onKeyDown,
  className,
}: PageFilterSearchFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={typeof label === 'string' ? label : undefined}
        className={inputClassName}
      />
    </div>
  );
}
