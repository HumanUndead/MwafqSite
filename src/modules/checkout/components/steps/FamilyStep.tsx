'use client';

import { CheckCircle2, Circle, Link2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import {
  CreateMemberDialog,
  LinkMemberDialog,
  MemberAvatar,
  RelatedUserStatus,
  useFamilySelectionStore,
} from '@/modules/family';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { OwnerOption } from '../../hooks/useOwnerOptions';
import { ServiceChips } from '../BookingSummary';
import { StepFooter } from '../StepFooter';

interface FamilyStepProps {
  serviceNames: string[];
  options: OwnerOption[];
  ownerId: string | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (id: string) => void;
  onNext: () => void;
}

export function FamilyStep({
  serviceNames,
  options,
  ownerId,
  isLoading,
  isError,
  onRetry,
  onSelect,
  onNext,
}: FamilyStepProps) {
  const t = useTranslations('checkout');
  const familyT = useTranslations('family');
  const setSelectedMemberId = useFamilySelectionStore(
    (state) => state.setSelectedMemberId
  );
  const [dialog, setDialog] = useState<'link' | 'create' | null>(null);

  const selected = options.find((option) => option.id === ownerId);
  const ready = !!selected?.selectable;

  function choose(option: OwnerOption) {
    if (!option.selectable) return;
    onSelect(option.id);
    setSelectedMemberId(option.isSelf ? null : option.id);
  }

  return (
    <div>
      <div className='mb-6 rounded-[20px] border-2 border-[#e5e7f0] bg-white p-4'>
        <p className='mb-2 text-[12px] font-bold uppercase tracking-wide text-[#6b7196]'>
          {t.youAreBooking}
        </p>
        <ServiceChips names={serviceNames} />
      </div>

      <div role='radiogroup' aria-label={t.steps.family} className='flex flex-col gap-2'>
        {options.map((option) => {
          const active = option.id === ownerId;
          return (
            <button
              key={option.id}
              type='button'
              role='radio'
              aria-checked={active}
              aria-disabled={!option.selectable}
              onClick={() => choose(option)}
              className={cn(
                'flex w-full items-center gap-3 rounded-[16px] border-2 bg-white px-4 py-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]',
                active ? 'border-[#00a8f1] bg-[#f5fbff]' : 'border-[#e5e7f0]',
                option.selectable
                  ? 'cursor-pointer hover:border-[#00a8f1]/60'
                  : 'cursor-not-allowed opacity-60'
              )}
            >
              <MemberAvatar name={option.name} image={option.image} />
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[15px] font-bold text-[#1e2364]'>
                  {option.isSelf ? `${option.name} (${t.family.you})` : option.name}
                </span>
                {option.status === RelatedUserStatus.Pending && (
                  <span className='text-xs font-semibold text-amber-600'>
                    {t.family.pending}
                  </span>
                )}
                {option.status === RelatedUserStatus.Rejected && (
                  <span className='text-xs font-semibold text-red-600'>
                    {t.family.rejected}
                  </span>
                )}
              </span>
              {active ? (
                <CheckCircle2 className='size-5 shrink-0 text-[#00a8f1]' aria-hidden />
              ) : (
                <Circle className='size-5 shrink-0 text-[#c7cbe0]' aria-hidden />
              )}
            </button>
          );
        })}

        {isLoading && (
          <div className='h-[68px] animate-pulse rounded-[16px] bg-[#e5e7f0]' aria-hidden />
        )}
        {isError && (
          <div className='flex items-center justify-between gap-3 rounded-[16px] border-2 border-dashed border-red-200 bg-white px-4 py-3'>
            <p className='text-sm font-semibold text-red-600'>{t.family.loadError}</p>
            <Button variant='outline' size='sm' type='button' onClick={onRetry}>
              {familyT.retry}
            </Button>
          </div>
        )}
      </div>

      <div className='mt-4 grid grid-cols-1 gap-2 rounded-[16px] border-2 border-dashed border-[#c7cbe0] p-3 sm:grid-cols-2'>
        <p className='text-sm font-bold text-[#1e2364] sm:col-span-2'>{t.family.add}</p>
        <Button variant='outline' type='button' onClick={() => setDialog('link')}>
          <Link2 className='size-4' aria-hidden />
          {t.family.linkExisting}
        </Button>
        <Button variant='outline' type='button' onClick={() => setDialog('create')}>
          <UserPlus className='size-4' aria-hidden />
          {t.family.createNew}
        </Button>
      </div>

      <StepFooter ready={ready} hint={ready ? t.family.next : t.family.hint} onNext={onNext} />

      <LinkMemberDialog open={dialog === 'link'} onClose={() => setDialog(null)} />
      <CreateMemberDialog open={dialog === 'create'} onClose={() => setDialog(null)} />
    </div>
  );
}
