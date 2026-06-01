'use client';

import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBookingTimeSlots } from '@/modules/services/hooks/useBookingTimeSlots';
import type { BookingTimeSlot } from '@/modules/services/types/booking.types';

type TimeStepLabels = {
  pickDate: string;
  loadingSlots: string;
  noSlots: string;
  loadError: string;
  slotsAriaLabel: string;
};

type TimeStepProps = {
  serviceGroupId: number;
  serviceIds: number[];
  branchId: number;
  selectedDate: string | null;
  selectedSlots: BookingTimeSlot[];
  onDateChange: (date: string) => void;
  onSlotsChange: (slots: BookingTimeSlot[]) => void;
  labels: TimeStepLabels;
};

export function TimeStep({
  serviceGroupId,
  serviceIds,
  branchId,
  selectedDate,
  selectedSlots,
  onDateChange,
  onSlotsChange,
  labels,
}: TimeStepProps) {
  const { slots, loading, error } = useBookingTimeSlots({
    branchId,
    serviceGroupId,
    serviceIds,
    selectedDate,
  });

  const today = new Date().toISOString().split('T')[0];

  function toggleSlot(slot: BookingTimeSlot) {
    const already = selectedSlots.some((s) => s.slotTimeId === slot.slotTimeId);
    onSlotsChange(already ? [] : [slot]);
  }

  return (
    <div className='mb-6'>
      <label className='mb-1.5 block text-[13.5px] font-semibold text-[#1e2364]'>
        {labels.pickDate}
      </label>
      <input
        type='date'
        min={today}
        value={selectedDate ?? ''}
        onChange={(e) => onDateChange(e.target.value)}
        className='mb-6 rounded-xl border-2 border-[#e5e7f0] bg-white px-4 py-3 text-[14.5px] text-[#1e2364] focus:border-[#00a8f1] focus:outline-none'
      />

      {selectedDate && (
        <>
          {loading ? (
            <>
              <p className='mb-3 text-[13px] text-[#6b7196]' role='status'>
                {labels.loadingSlots}
              </p>
              <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='h-11 animate-pulse rounded-xl bg-[#f0f2f8]' />
                ))}
              </div>
            </>
          ) : error ? (
            <p className='rounded-lg bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-600'>
              {labels.loadError}
            </p>
          ) : !slots.length ? (
            <p className='text-[14px] text-[#6b7196]'>{labels.noSlots}</p>
          ) : (
            <ul
              className='grid grid-cols-2 gap-2.5 sm:grid-cols-3'
              aria-label={labels.slotsAriaLabel}
            >
              {slots.map((slot) => {
                const isSelected = selectedSlots.some(
                  (s) => s.slotTimeId === slot.slotTimeId
                );
                return (
                  <li key={slot.slotTimeId}>
                    <button
                      type='button'
                      onClick={() => toggleSlot(slot)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-[13px] font-semibold transition-colors duration-200',
                        isSelected
                          ? 'border-[#00a8f1] bg-[#00a8f1] text-white'
                          : 'border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1]/40'
                      )}
                    >
                      <Clock className='size-3.5 shrink-0' aria-hidden />
                      {slot.from} – {slot.to}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
