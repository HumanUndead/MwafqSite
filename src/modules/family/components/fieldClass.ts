import { cn } from '@/shared/lib/cn';

/** Product sizing for the shared `Input` in family dialogs. Keeps the red border on error. */
export function fieldClass(invalid?: boolean) {
  return cn(
    'h-11 rounded-xl px-3.5 text-[15px] text-[#1e2364] placeholder:text-[#8a8fae]',
    !invalid &&
      'border-[#d9ddea] focus:border-[#1e2364] focus:ring-[#1e2364]/15'
  );
}
