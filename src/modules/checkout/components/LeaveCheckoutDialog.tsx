'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { interpolate } from '@/shared/lib/interpolate';

interface LeaveCheckoutDialogProps {
  open: boolean;
  isGroup: boolean;
  serviceCount: number;
  onSave: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

/** Save for later (keeps the draft 24 h) / discard / keep going. */
export function LeaveCheckoutDialog({
  open,
  isGroup,
  serviceCount,
  onSave,
  onDiscard,
  onClose,
}: LeaveCheckoutDialogProps) {
  const t = useTranslations('checkout');
  const empty = !isGroup && serviceCount === 0;
  const message = empty
    ? t.leave.messageEmpty
    : isGroup
      ? t.leave.messageGroup
      : interpolate(t.leave.message, { count: serviceCount });

  return (
    <Modal open={open} onClose={onClose} size='sm'>
      <div role='alertdialog' aria-modal='true' aria-labelledby='leave-title'>
        <h2 id='leave-title' className='text-lg font-bold text-[#1e2364]'>
          {t.leave.title}
        </h2>
        <p className='mt-2 text-sm leading-6 text-[#6b7196]'>{message}</p>
        <div className='mt-6 flex flex-col gap-2'>
          {!empty && (
            <Button variant='brand' type='button' onClick={onSave}>
              {t.leave.save}
            </Button>
          )}
          <Button variant='danger' type='button' onClick={onDiscard}>
            {t.leave.discard}
          </Button>
          <Button variant='ghost' type='button' onClick={onClose} autoFocus>
            {t.leave.keepGoing}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
