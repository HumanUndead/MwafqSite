'use client';

import type { FormEvent } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

interface Props {
  identifier: string;
  onIdentifierChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  isEmail: boolean;
  loading: boolean;
  fieldError: string | null;
  onSubmit: () => void;
}

export function IdentifyForm({
  identifier,
  onIdentifierChange,
  password,
  onPasswordChange,
  isEmail,
  loading,
  fieldError,
  onSubmit,
}: Props) {
  const auth = useTranslations('auth');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const isMissingFields =
    !identifier.trim() || (isEmail && !password);

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <Input
        label={auth.deactivateAccount.identifierLabel}
        value={identifier}
        onChange={(e) => onIdentifierChange(e.target.value)}
        placeholder={auth.fields.identityNumberPlaceholder}
        autoComplete='username'
        error={!isEmail ? (fieldError ?? undefined) : undefined}
      />

      {isEmail ? (
        <Input
          label={auth.fields.password}
          type='password'
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={auth.fields.passwordPlaceholder}
          autoComplete='current-password'
          error={fieldError ?? undefined}
        />
      ) : null}

      <Button
        type='submit'
        loading={loading}
        disabled={isMissingFields}
        variant='brand'
        className='w-full'
      >
        {auth.deactivateAccount.continue}
      </Button>
    </form>
  );
}
