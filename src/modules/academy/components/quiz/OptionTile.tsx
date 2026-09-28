import { Check, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Full-width selectable answer. A visually hidden native radio/checkbox keeps
 * the group semantics and keyboard behaviour; the tile is its label.
 */
export function OptionTile({
  type,
  name,
  checked,
  onChange,
  marker,
  children,
}: {
  type: 'radio' | 'checkbox';
  name: string;
  checked: boolean;
  onChange: () => void;
  /** Letter shown in the radio marker. */
  marker?: ReactNode;
  children: ReactNode;
}) {
  const isCheckbox = type === 'checkbox';
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors motion-reduce:transition-none sm:gap-4 sm:px-5 sm:py-4',
        'has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-[#00a8f1] has-[input:focus-visible]:ring-offset-2',
        checked
          ? 'border-[#00a8f1] bg-[#00a8f1]/[0.06] ring-1 ring-[#00a8f1]'
          : 'border-[#e5e7f0] bg-white/80 hover:border-[#00a8f1]/60 hover:bg-white'
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className='sr-only'
      />
      <span
        aria-hidden
        className={cn(
          'flex size-9 shrink-0 items-center justify-center text-sm font-bold transition-colors motion-reduce:transition-none',
          isCheckbox ? 'rounded-lg' : 'rounded-full',
          checked
            ? 'bg-[#00a8f1] text-white'
            : 'bg-[#f3f4f8] text-[#6b7196] ring-1 ring-[#e5e7f0]'
        )}
      >
        {isCheckbox ? (
          checked ? (
            <Check className='size-5' strokeWidth={3} />
          ) : null
        ) : (
          marker
        )}
      </span>
      <span className='min-w-0 flex-1 break-words text-base font-semibold text-[#1e2364]'>
        {children}
      </span>
      {!isCheckbox && (
        <CheckCircle2
          aria-hidden
          className={cn(
            'size-5 shrink-0 text-[#00a8f1] transition-opacity motion-reduce:transition-none',
            checked ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </label>
  );
}
