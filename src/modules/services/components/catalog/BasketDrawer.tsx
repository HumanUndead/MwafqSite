'use client';

import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { interpolate } from '@/shared/lib/interpolate';
import { useBasketStore } from '../../store/basketStore';

interface BasketDrawerProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

/** Individual services in the basket: review, remove, clear, continue. */
export function BasketDrawer({ open, onClose, onContinue }: BasketDrawerProps) {
  const t = useTranslations('catalog');
  const services = useBasketStore((state) => state.services);
  const removeService = useBasketStore((state) => state.removeService);
  const clearServices = useBasketStore((state) => state.clearServices);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <>
      <Modal open={open && !confirmClear} onClose={onClose} size='md'>
        <div role='dialog' aria-modal='true' aria-labelledby='basket-title'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h2
                id='basket-title'
                className='text-lg font-bold text-[#1e2364]'
              >
                {t.basket.title}
              </h2>
              <p className='text-sm text-[#6b7196]'>
                {interpolate(t.basket.selectedCount, {
                  count: services.length,
                })}
              </p>
            </div>
            <button
              type='button'
              onClick={onClose}
              aria-label={t.close}
              className='inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-[#6b7196] hover:bg-[#f3f4f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
            >
              <X className='size-5' aria-hidden />
            </button>
          </div>

          {services.length === 0 ? (
            <p className='py-10 text-center text-sm text-[#6b7196]'>
              {t.basket.empty}
            </p>
          ) : (
            <ul className='mt-4 flex max-h-[50vh] flex-col gap-2 overflow-y-auto'>
              {services.map((service) => (
                <li
                  key={service.id}
                  className='flex items-center justify-between gap-3 rounded-[12px] bg-[#f3f4f8] px-3 py-2.5'
                >
                  <span className='min-w-0 text-sm font-semibold text-[#1e2364]'>
                    {service.name}
                  </span>
                  <button
                    type='button'
                    onClick={() => removeService(service.id)}
                    aria-label={interpolate(t.basket.remove, {
                      name: service.name,
                    })}
                    className='inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
                  >
                    <Trash2 className='size-4' aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between'>
            <Button
              variant='ghost'
              type='button'
              disabled={services.length === 0}
              onClick={() => setConfirmClear(true)}
              className='text-red-600'
            >
              {t.basket.clear}
            </Button>
            <Button
              variant='brand'
              type='button'
              disabled={services.length === 0}
              onClick={onContinue}
            >
              {t.basket.continue}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmClear}
        title={t.basket.clearTitle}
        message={t.basket.clearMessage}
        confirmLabel={t.basket.clear}
        cancelLabel={t.replace.keep}
        destructive
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearServices();
          setConfirmClear(false);
          onClose();
          toast.success(t.basket.cleared);
        }}
      />
    </>
  );
}
