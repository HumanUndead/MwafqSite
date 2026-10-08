'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { fieldClass } from '@/modules/family/components/fieldClass';
import { MemberAvatar } from '@/modules/family/components/MemberAvatar';
import { getFamilyErrorMessage } from '@/modules/family/familyError';
import { useFamilyMutations } from '@/modules/family/hooks/useFamily';
import { useFamilyLookup } from '@/modules/family/hooks/useFamilyLookup';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';

interface LinkMemberDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Look up an existing account and send it a relation request. */
export function LinkMemberDialog({ open, onClose }: LinkMemberDialogProps) {
  const t = useTranslations('family');
  const [username, setUsername] = useState('');
  const lookup = useFamilyLookup(username);
  const { link } = useFamilyMutations();
  const found = lookup.data;
  const canSubmit = !!(found?.email || found?.userName) && !lookup.isSettling;
  const searching = lookup.searched && (lookup.isLoading || lookup.isSettling);
  const settled = lookup.searched && !lookup.isSettling && !lookup.isLoading;
  const notFound = settled && !found;

  function close() {
    setUsername('');
    link.reset();
    onClose();
  }

  async function submit() {
    if (!canSubmit) return;
    try {
      await link.mutateAsync(username.trim());
      toast.success(t.link.success);
      close();
    } catch (error) {
      toast.error(getFamilyErrorMessage(error, t));
    }
  }

  const fullName = found ? `${found.firstName} ${found.lastName}`.trim() : '';

  return (
    <Modal open={open} onClose={close} size='md' className='max-sm:p-5'>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        aria-labelledby='link-member-title'
        className='flex flex-col gap-5'
      >
        <h2
          id='link-member-title'
          className='text-[18px] font-bold text-[#1e2364]'
        >
          {t.link.title}
        </h2>

        <Input
          id='family-link-username'
          label={t.link.usernameLabel}
          placeholder={t.link.usernamePlaceholder}
          hint={t.link.helper}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className={fieldClass(notFound)}
          autoComplete='off'
          aria-required
          aria-invalid={notFound}
          aria-describedby='family-link-result'
          autoFocus
        />

        <div
          id='family-link-result'
          aria-live='polite'
          className='empty:hidden'
        >
          {searching ? (
            <p className='flex items-center gap-2 text-[14px] text-[#6b7196]'>
              <Spinner size='sm' />
              {t.link.searching}
            </p>
          ) : settled && found ? (
            <div className='flex items-center gap-3 rounded-xl border border-[#e5e7f0] bg-[#f7f8fb] px-4 py-3'>
              <MemberAvatar name={fullName} image={found.img} />
              <div className='min-w-0'>
                <p className='break-words text-[15px] font-bold text-[#1e2364]'>
                  {fullName}
                </p>
                {found.email || found.userName ? (
                  <p className='break-all text-[13px] text-[#6b7196]'>
                    <bdi dir='ltr'>{found.email ?? found.userName}</bdi>
                  </p>
                ) : null}
              </div>
            </div>
          ) : notFound ? (
            <p className='text-[14px] font-semibold text-red-700'>
              {t.link.notFound}
            </p>
          ) : null}
        </div>

        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button
            variant='productSecondary'
            size='control'
            type='button'
            onClick={close}
          >
            {t.cancel}
          </Button>
          <Button
            variant='product'
            size='control'
            type='submit'
            disabled={!canSubmit}
            loading={link.isPending}
          >
            {t.link.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
