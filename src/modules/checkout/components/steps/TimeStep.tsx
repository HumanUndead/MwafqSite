'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { interpolate } from '@/shared/lib/interpolate';
import {
  firstBookableDate,
  fromIsoDate,
  groupSlotsByService,
  isDateBookable,
  slotsForDate,
  toIsoDate,
  utcOffsetLabel,
} from '../../checkout.shared';
import { useCheckoutSlots } from '../../hooks/useCheckoutData';
import type {
  CheckoutAppointment,
  CheckoutFacility,
  CheckoutSelectedSlot,
  CheckoutServiceSelection,
} from '../../types/checkout.types';
import { StepFooter } from '../StepFooter';
import { DateStrip, startOfWeek } from './time/DateStrip';
import { MonthCalendarDialog } from './time/MonthCalendarDialog';
import { SlotServiceCard } from './time/SlotServiceCard';

interface TimeStepProps {
  service: CheckoutServiceSelection;
  facility: CheckoutFacility;
  appointment: CheckoutAppointment;
  hasCourseStep: boolean;
  onChange: (appointment: CheckoutAppointment) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TimeStep({
  service,
  facility,
  appointment,
  hasCourseStep,
  onChange,
  onNext,
  onBack,
}: TimeStepProps) {
  const t = useTranslations('checkout');
  const { data: days, isLoading, isError, refetch } = useCheckoutSlots(
    facility.branchId,
    service
  );
  const [monthOpen, setMonthOpen] = useState(false);

  const selectedDate = appointment.dateChosen
    ? fromIsoDate(appointment.dateChosen)
    : null;
  // The strip follows the chosen date unless the user pages weeks.
  const [pagedWeek, setPagedWeek] = useState<Date | null>(null);
  const weekStart = pagedWeek ?? startOfWeek(selectedDate ?? new Date());

  const isBookable = useCallback(
    (date: Date) =>
      isDateBookable(date, {
        closingDays: facility.closingDays,
        scheduleOffs: facility.scheduleOffs,
        isClosedToday: facility.isClosedToday,
        days,
      }),
    [days, facility]
  );

  // Auto-pick the first bookable date once the week pattern is loaded.
  useEffect(() => {
    if (!days || appointment.dateChosen) return;
    const first = firstBookableDate({
      closingDays: facility.closingDays,
      scheduleOffs: facility.scheduleOffs,
      isClosedToday: facility.isClosedToday,
      days,
    });
    if (!first) return;
    onChange({ dateChosen: toIsoDate(first), selectedSlots: [] });
  }, [appointment.dateChosen, days, facility, onChange]);

  const dateChosen = appointment.dateChosen;
  const groups = useMemo(
    () =>
      dateChosen
        ? groupSlotsByService(slotsForDate(days, fromIsoDate(dateChosen)))
        : [],
    [days, dateChosen]
  );

  // Only slots that exist on the chosen weekday count.
  const available = new Set(groups.flatMap((g) => g.slots.map((s) => s.slotTimeId)));
  const chosen = appointment.selectedSlots.filter((slot) => available.has(slot.slotTimeId));
  const chosenFor = (branchServiceId: number) =>
    chosen.find((slot) => slot.serviceProviderBranchServiceId === branchServiceId);

  function selectDate(date: Date) {
    if (!isBookable(date)) return;
    const nextSlots = slotsForDate(days, date);
    const keep = new Set(nextSlots.map((slot) => slot.slotTimeId));
    onChange({
      dateChosen: toIsoDate(date),
      selectedSlots: appointment.selectedSlots.filter((slot) => keep.has(slot.slotTimeId)),
    });
    setPagedWeek(null);
  }

  function toggleSlot(branchServiceId: number, slotTimeId: number) {
    const group = groups.find((g) => g.serviceProviderBranchServiceId === branchServiceId);
    const slot = group?.slots.find((s) => s.slotTimeId === slotTimeId);
    if (!group || !slot) return;
    const others = chosen.filter((s) => s.serviceProviderBranchServiceId !== branchServiceId);
    const isSame = chosenFor(branchServiceId)?.slotTimeId === slotTimeId;
    const next: CheckoutSelectedSlot[] = isSame
      ? others
      : [
          ...others,
          {
            slotTimeId,
            serviceProviderBranchServiceId: branchServiceId,
            label: group.label,
            from: slot.from,
            to: slot.to,
            price: slot.price,
            taxPrice: slot.taxPrice,
          },
        ];
    onChange({ dateChosen: appointment.dateChosen, selectedSlots: next });
  }

  const missing = groups.length - groups.filter((g) => chosenFor(g.serviceProviderBranchServiceId)).length;
  const ready = groups.length > 0 && missing === 0;
  const hint =
    groups.length === 0
      ? t.time.chooseDate
      : !ready
        ? interpolate(t.time.stillNeed, { count: missing })
        : hasCourseStep
          ? t.time.nextCourse
          : t.time.nextConfirm;

  return (
    <div>
      {isLoading ? (
        <div className='flex flex-col items-center gap-3 py-16' aria-live='polite'>
          <Spinner />
          <p className='text-sm text-[#6b7196]'>{t.time.loading}</p>
        </div>
      ) : isError ? (
        <div className='flex flex-col items-center gap-3 rounded-[20px] border-2 border-dashed border-red-200 bg-white px-6 py-10 text-center' role='alert'>
          <p className='text-sm font-semibold text-red-600'>{t.time.loadError}</p>
          <Button variant='outline' type='button' onClick={() => void refetch()}>
            {t.facility.retry}
          </Button>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          <DateStrip
            weekStart={weekStart}
            selected={selectedDate}
            isBookable={isBookable}
            onSelect={selectDate}
            onWeekChange={setPagedWeek}
            onOpenMonth={() => setMonthOpen(true)}
          />
          <p className='text-xs font-medium text-[#6b7196]'>
            {interpolate(t.confirm.timesShownIn, { offset: utcOffsetLabel() })}
          </p>
          {groups.length === 0 ? (
            <div className='rounded-[20px] border-2 border-dashed border-[#e5e7f0] bg-white px-6 py-10 text-center'>
              <p className='text-[15px] font-bold text-[#1e2364]'>{t.time.noTimes}</p>
              <p className='mt-1 text-sm text-[#6b7196]'>{t.time.noTimesHint}</p>
            </div>
          ) : (
            <>
              {groups.length > 1 && (
                <p className='text-sm font-bold text-[#6b7196]' aria-live='polite'>
                  {interpolate(t.time.scheduled, {
                    done: groups.length - missing,
                    total: groups.length,
                  })}
                </p>
              )}
              {groups.map((group) => (
                <SlotServiceCard
                  key={group.serviceProviderBranchServiceId}
                  group={group}
                  selectedSlotId={chosenFor(group.serviceProviderBranchServiceId)?.slotTimeId ?? null}
                  onToggle={(slotTimeId) =>
                    toggleSlot(group.serviceProviderBranchServiceId, slotTimeId)
                  }
                />
              ))}
            </>
          )}
        </div>
      )}

      <StepFooter
        ready={ready}
        hint={hint}
        onBack={onBack}
        onNext={() => {
          onChange({ dateChosen: appointment.dateChosen, selectedSlots: chosen });
          onNext();
        }}
      />

      <MonthCalendarDialog
        open={monthOpen}
        selected={selectedDate}
        isBookable={isBookable}
        onSelect={selectDate}
        onClose={() => setMonthOpen(false)}
      />
    </div>
  );
}
