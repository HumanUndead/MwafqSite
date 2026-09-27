'use client';

import { CheckCircle2 } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { catalogName } from '../../catalog.shared';
import { useServiceGroupDetail } from '../../hooks/useServiceGroupDetail';

interface GroupServicesDialogProps {
  groupId: number | null;
  selected: boolean;
  onToggleSelect: (serviceCount: number) => void;
  onClose: () => void;
}

/** Lists a group's included services; lets the user select the group. */
export function GroupServicesDialog({
  groupId,
  selected,
  onToggleSelect,
  onClose,
}: GroupServicesDialogProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useServiceGroupDetail(groupId);
  const services = data?.serviceGroupServices ?? [];
  const title = data
    ? catalogName(data.translations, locale)
    : t.groupServicesTitle;

  return (
    <Modal open={groupId !== null} onClose={onClose} size='md'>
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='group-services-title'
      >
        <h2
          id='group-services-title'
          className='text-lg font-bold text-[#1e2364]'
        >
          {title}
        </h2>
        <p className='mt-1 text-sm text-[#6b7196]'>{t.groupServicesTitle}</p>

        <div className='mt-4 max-h-[50vh] overflow-y-auto'>
          {isLoading && (
            <div className='flex justify-center py-8'>
              <Spinner />
            </div>
          )}
          {isError && (
            <div className='flex flex-col items-center gap-3 py-6 text-center'>
              <p className='text-sm text-red-600'>{t.loadError}</p>
              <Button
                variant='outline'
                size='sm'
                type='button'
                onClick={() => refetch()}
              >
                {t.retry}
              </Button>
            </div>
          )}
          {data && services.length === 0 && (
            <p className='py-6 text-center text-sm text-[#6b7196]'>
              {t.noGroupServices}
            </p>
          )}
          {services.length > 0 && (
            <ul className='flex flex-col gap-2'>
              {services.map((service) => (
                <li
                  key={service.id}
                  className='flex items-center gap-2 rounded-[12px] bg-[#f3f4f8] px-3 py-2.5 text-sm font-semibold text-[#1e2364]'
                >
                  <CheckCircle2
                    className='size-4 shrink-0 text-[#00a8f1]'
                    aria-hidden
                  />
                  {service.serviceName?.trim()}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button variant='outline' type='button' onClick={onClose}>
            {t.close}
          </Button>
          <Button
            variant={selected ? 'outline' : 'brand'}
            type='button'
            disabled={!data || services.length === 0}
            onClick={() => onToggleSelect(services.length)}
          >
            {selected ? t.deselectGroup : t.selectGroup}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
