'use client';

import { useId } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Two-button confirmation. Dismissing counts as cancel. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  return (
    <Modal open={open} onClose={onCancel} size='sm' ariaLabelledBy={titleId} className='max-w-[420px] p-6'>
      <div>
        <h2 id={titleId} className='text-[18px] font-bold leading-7 text-[#1e2364]'>
          {title}
        </h2>
        {message && (
          <p className='mt-2 text-[14px] leading-6 text-[#6b7196]'>
            {message}
          </p>
        )}
        <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button variant='productSecondary' size='control' type='button' onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'product'}
            size='control'
            type='button'
            loading={loading}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
