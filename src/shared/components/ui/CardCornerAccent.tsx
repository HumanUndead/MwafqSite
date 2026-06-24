import { cn } from '@/shared/lib/cn';

/** Arm depth 10 in a 30×30 viewBox — used on larger marketing cards */
const CORNER_SVG = `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`;

/** Arm depth 3 in a 30×30 viewBox — service cards (matches 2px stroke at 20px) */
const CORNER_SVG_HAIRLINE = `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 3 L 3 3 L 3 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`;

/** 20px corner × (3/30) arm = 2px */
export const CARD_HAIRLINE_STROKE = '2px';

interface Props {
  rtl?: boolean;
  className?: string;
  variant?: 'default' | 'hairline';
}

export function CardCornerAccent({
  rtl = false,
  className,
  variant = 'default',
}: Props) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute top-0 z-[2]',
        variant === 'hairline' ? 'h-5 w-5' : 'h-6 w-6',
        rtl ? 'right-0 scale-x-[-1]' : 'left-0',
        className
      )}
      style={{
        backgroundImage: variant === 'hairline' ? CORNER_SVG_HAIRLINE : CORNER_SVG,
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
