'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';

interface Props {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeactivateDialog({ open, loading, onConfirm, onClose }: Props) {
  const auth = useTranslations('auth');

  return (
    <Modal open={open} onClose={onClose} title={auth.deactivateAccount.confirmTitle}>
      <div className='flex flex-col gap-5'>
        <p className='text-center text-sm text-gray-600'>
          {auth.deactivateAccount.confirmDescription}
        </p>

        <div className='flex flex-col gap-3 sm:flex-row-reverse'>
          <Button
            onClick={onConfirm}
            loading={loading}
            variant='danger'
            className='w-full'
          >
            {auth.deactivateAccount.confirmAction}
          </Button>
          <Button onClick={onClose} variant='outline' disabled={loading} className='w-full'>
            {auth.deactivateAccount.cancelAction}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
