import type { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/shared/lib/cn';

const tileClass =
  'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-150 motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#00a8f1] has-[:focus-visible]:ring-offset-2';

const controlClass =
  'size-5 border-2 border-[#9aa0bd] bg-white after:hidden focus-visible:border-[#1e2364] focus-visible:ring-0 data-checked:border-[#1e2364] data-checked:bg-[#1e2364] data-checked:text-white';

/**
 * Full-width answer. The whole tile is the label of a real radio (inside a
 * `RadioGroup`) or checkbox, so keyboard and screen-reader behaviour come
 * from the primitive.
 */
export function OptionTile(
  props: { checked: boolean; children: ReactNode } & (
    | { type: 'radio'; value: number }
    | { type: 'checkbox'; onToggle: () => void }
  )
) {
  const { checked, children } = props;
  return (
    <label
      className={cn(
        tileClass,
        checked
          ? 'border-[#1e2364] bg-[#f5f6fb] shadow-[inset_0_0_0_1px_#1e2364]'
          : 'border-[#d9ddea] bg-white hover:border-[#1e2364]/40 hover:bg-[#f7f8fb]'
      )}
    >
      {props.type === 'radio' ? (
        <RadioGroupItem
          value={props.value}
          className={cn(controlClass, '[&_[data-slot=radio-group-indicator]_span]:bg-white')}
        />
      ) : (
        <Checkbox
          checked={checked}
          onCheckedChange={props.onToggle}
          className={cn(controlClass, 'rounded-[5px]')}
        />
      )}
      <span className='min-w-0 flex-1 break-words text-[15px] font-semibold leading-6 text-[#1e2364]'>
        {children}
      </span>
    </label>
  );
}
