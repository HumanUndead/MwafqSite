import { SarIcon } from '@/shared/components/icons/booking/SarIcon';
import { cn } from '@/shared/lib/cn';
import { formatSar } from '@/shared/lib/money';

interface SarAmountProps {
  amount: number | null | undefined;
  className?: string;
  iconClassName?: string;
  /** Accessible currency name, e.g. "SAR" / "ريال". */
  currencyLabel?: string;
}

/** Amount followed by the riyal symbol. Always LTR so digits never flip. */
export function SarAmount({
  amount,
  className,
  iconClassName,
  currencyLabel = 'SAR',
}: SarAmountProps) {
  return (
    <span
      dir='ltr'
      className={cn('inline-flex items-center gap-1 tabular-nums', className)}
    >
      {formatSar(amount)}
      <SarIcon className={cn('size-[0.9em] shrink-0', iconClassName)} />
      <span className='sr-only'>{currencyLabel}</span>
    </span>
  );
}
