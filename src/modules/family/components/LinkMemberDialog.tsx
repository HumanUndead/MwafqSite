'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useFamilyMutations } from '../hooks/useFamily';
import { useFamilyLookup } from '../hooks/useFamilyLookup';
import { MemberAvatar } from './MemberAvatar';
import { getFamilyErrorMessage } from '../familyError';

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
    <Modal open={open} onClose={close} size='md'>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        aria-labelledby='link-member-title'
        className='flex flex-col gap-4'
      >
        <h2 id='link-member-title' className='text-lg font-bold text-[#1e2364]'>
          {t.link.title}
        </h2>
        <Input
          id='family-link-username'
          label={t.link.usernameLabel}
          placeholder={t.link.usernamePlaceholder}
          hint={t.link.helper}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete='off'
          aria-required
          autoFocus
        />

        <div aria-live='polite'>
          {lookup.searched && (lookup.isLoading || lookup.isSettling) && (
            <div className='flex items-center justify-center gap-2 rounded-[14px] bg-[#f3f4f8] px-4 py-3 text-sm text-[#6b7196]'>
              <Spinner size='sm' />
              {t.link.searching}
            </div>
          )}
          {lookup.searched &&
            !lookup.isSettling &&
            !lookup.isLoading &&
            found && (
              <div className='flex items-center gap-3 rounded-[14px] border-2 border-[#00a8f1] bg-[#f3f4f8] px-4 py-3'>
                <MemberAvatar name={fullName} image={found.img} />
                <div className='min-w-0'>
                  <p className='truncate text-sm font-bold text-[#1e2364]'>
                    {fullName}
                  </p>
                  {(found.email || found.userName) && (
                    <p className='truncate text-xs text-[#6b7196]'>
                      {found.email ?? found.userName}
                    </p>
                  )}
                </div>
              </div>
            )}
          {lookup.searched &&
            !lookup.isSettling &&
            !lookup.isLoading &&
            !found && (
              <p className='rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700'>
                {t.link.notFound}
              </p>
            )}
        </div>

        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button variant='outline' type='button' onClick={close}>
            {t.cancel}
          </Button>
          <Button
            variant='brand'
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
