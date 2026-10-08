'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onChoose: (mode: 'link' | 'create') => void;
}

/** First step of "Add family member": link an existing account or create one. */
export function AddMemberDialog({
  open,
  onClose,
  onChoose,
}: AddMemberDialogProps) {
  const t = useTranslations('family');
  const options = [
    {
      mode: 'link',
      title: t.actions.linkExisting,
      description: t.add.linkDescription,
    },
    {
      mode: 'create',
      title: t.add.createTitle,
      description: t.add.createDescription,
    },
  ] as const;

  return (
    <Modal open={open} onClose={onClose} size='md' className='max-sm:p-5'>
      <div
        role='group'
        aria-labelledby='add-member-title'
        className='flex flex-col gap-5'
      >
        <div>
          <h2
            id='add-member-title'
            className='text-[18px] font-bold text-[#1e2364]'
          >
            {t.add.title}
          </h2>
          <p className='mt-1 text-[14px] leading-6 text-[#6b7196]'>
            {t.add.description}
          </p>
        </div>

        <ul className='flex flex-col gap-3'>
          {options.map((option) => (
            <li key={option.mode}>
              <Button
                type='button'
                variant='productSecondary'
                onClick={() => onChoose(option.mode)}
                className='h-auto w-full justify-between gap-4 rounded-xl px-4 py-3.5 text-start'
              >
                <span className='flex min-w-0 flex-col gap-0.5'>
                  <span className='text-[15px] font-bold text-[#1e2364]'>
                    {option.title}
                  </span>
                  <span className='text-[13.5px] font-normal leading-5 text-[#6b7196]'>
                    {option.description}
                  </span>
                </span>
                <ChevronRight
                  className='size-5 shrink-0 text-[#6b7196] rtl:rotate-180'
                  aria-hidden
                />
              </Button>
            </li>
          ))}
        </ul>

        <Button
          type='button'
          variant='productSecondary'
          size='control'
          onClick={onClose}
          className='max-sm:w-full sm:self-end'
        >
          {t.cancel}
        </Button>
      </div>
    </Modal>
  );
}
