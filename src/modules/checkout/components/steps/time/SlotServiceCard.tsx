'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { formatSlotTime, type GroupedSlots } from '../../../checkout.shared';

interface SlotServiceCardProps {
  group: GroupedSlots;
  selectedSlotId: number | null;
  onToggle: (slotTimeId: number) => void;
}

/** One branch-service with its time chips; exactly one can be chosen. */
export function SlotServiceCard({ group, selectedSlotId, onToggle }: SlotServiceCardProps) {
  const t = useTranslations('checkout');
  return (
    <section
      className={cn(
        'rounded-[20px] border-2 bg-white p-4',
        selectedSlotId ? 'border-[#00a8f1]' : 'border-[#e5e7f0]'
      )}
      aria-label={group.label}
    >
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-[15px] font-extrabold text-[#1e2364]'>{group.label}</h3>
          <p className='text-xs text-[#6b7196]'>
            {interpolate(t.time.slotsCount, { count: group.slots.length })}
          </p>
        </div>
        <SarAmount amount={group.price} className='text-[15px] font-extrabold text-[#1e2364]' />
      </div>
      <div role='radiogroup' aria-label={group.label} className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
        {group.slots.map((slot) => {
          const active = slot.slotTimeId === selectedSlotId;
          return (
            <button
              key={slot.slotTimeId}
              type='button'
              role='radio'
              aria-checked={active}
              onClick={() => onToggle(slot.slotTimeId)}
              className={cn(
                'cursor-pointer rounded-[12px] border-2 px-2 py-2 text-[13px] font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]',
                active
                  ? 'border-[#1e2364] bg-[#1e2364] text-white'
                  : 'border-[#e5e7f0] bg-[#f3f4f8] text-[#1e2364] hover:border-[#00a8f1]'
              )}
            >
              <span dir='ltr'>
                {formatSlotTime(slot.from)} – {formatSlotTime(slot.to)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
