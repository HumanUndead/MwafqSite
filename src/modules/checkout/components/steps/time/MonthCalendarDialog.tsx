'use client';

import { ar } from 'date-fns/locale/ar';
import { enUS } from 'date-fns/locale/en-US';
import { Calendar } from '@/components/ui/calendar';
import { isRtl } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { BOOKING_HORIZON_DAYS, addDays, startOfToday } from '../../../checkout.shared';

interface MonthCalendarDialogProps {
  open: boolean;
  selected: Date | null;
  isBookable: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export function MonthCalendarDialog({
  open,
  selected,
  isBookable,
  onSelect,
  onClose,
}: MonthCalendarDialogProps) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const today = startOfToday();

  return (
    <Modal open={open} onClose={onClose} size='md'>
      <div role='dialog' aria-modal='true' aria-labelledby='month-title'>
        <h2 id='month-title' className='mb-3 text-lg font-bold text-[#1e2364]'>
          {t.time.monthTitle}
        </h2>
        <div className='flex justify-center'>
          <Calendar
            mode='single'
            selected={selected ?? undefined}
            defaultMonth={selected ?? today}
            startMonth={today}
            endMonth={addDays(today, BOOKING_HORIZON_DAYS)}
            disabled={(date) => !isBookable(date)}
            onSelect={(date) => {
              if (!date) return;
              onSelect(date);
              onClose();
            }}
            locale={locale === 'ar' ? ar : enUS}
            dir={isRtl(locale) ? 'rtl' : 'ltr'}
            className='rounded-[16px] border-2 border-[#e5e7f0] [--cell-size:--spacing(10)]'
          />
        </div>
        <div className='mt-4 flex justify-end'>
          <Button variant='outline' type='button' onClick={onClose}>
            {t.time.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
