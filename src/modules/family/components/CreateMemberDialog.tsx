'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { ROUTES } from '@/shared/constants/routes';
import { ApiError } from '@/shared/lib/http';
import { isEmailOrSaudiMobile } from '../family.shared';
import { useFamilyMutations } from '../hooks/useFamily';
import type { CreateFamilyMemberInput } from '../types/family.types';

interface CreateMemberDialogProps {
  open: boolean;
  onClose: () => void;
}

type Field = keyof CreateFamilyMemberInput | 'terms';
type Errors = Partial<Record<Field, string>>;

const EMPTY: CreateFamilyMemberInput = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  identityNumber: '',
  dateOfBirth: '',
};

/** Create an account for a family member and link it (no OTP). */
export function CreateMemberDialog({ open, onClose }: CreateMemberDialogProps) {
  const t = useTranslations('family');
  const locale = useLocale();
  const { createMember } = useFamilyMutations();
  const [form, setForm] = useState<CreateFamilyMemberInput>(EMPTY);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const update =
    (field: keyof CreateFamilyMemberInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  function validate(): Errors {
    const next: Errors = {};
    if (!form.firstName.trim()) next.firstName = t.errors.required;
    if (!form.lastName.trim()) next.lastName = t.errors.required;
    if (!form.identityNumber.trim()) next.identityNumber = t.errors.required;
    if (!form.phoneNumber.trim()) next.phoneNumber = t.errors.required;
    else if (!isEmailOrSaudiMobile(form.phoneNumber)) {
      next.phoneNumber = t.errors.phone;
    }
    if (!form.dateOfBirth) next.dateOfBirth = t.errors.required;
    else if (
      Number.isNaN(Date.parse(form.dateOfBirth)) ||
      new Date(form.dateOfBirth) > new Date()
    ) {
      next.dateOfBirth = t.errors.date;
    }
    if (!terms) next.terms = t.errors.terms;
    return next;
  }

  function close() {
    setForm(EMPTY);
    setTerms(false);
    setErrors({});
    onClose();
  }

  async function submit() {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      await createMember.mutateAsync(form);
      toast.success(t.create.success);
      close();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t.errors.generic);
    }
  }

  return (
    <Modal open={open} onClose={close} size='lg'>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        aria-labelledby='create-member-title'
        className='flex max-h-[80vh] flex-col gap-4 overflow-y-auto'
      >
        <div>
          <h2
            id='create-member-title'
            className='text-lg font-bold text-[#1e2364]'
          >
            {t.create.title}
          </h2>
          <p className='mt-1 text-sm text-[#6b7196]'>{t.create.description}</p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Input
            id='family-first-name'
            label={t.create.firstName}
            value={form.firstName}
            onChange={update('firstName')}
            error={errors.firstName}
            autoComplete='off'
            aria-required
            aria-invalid={!!errors.firstName}
          />
          <Input
            id='family-last-name'
            label={t.create.lastName}
            value={form.lastName}
            onChange={update('lastName')}
            error={errors.lastName}
            autoComplete='off'
            aria-required
            aria-invalid={!!errors.lastName}
          />
          <Input
            id='family-identity'
            label={t.create.identityNumber}
            value={form.identityNumber}
            onChange={update('identityNumber')}
            error={errors.identityNumber}
            inputMode='numeric'
            autoComplete='off'
            aria-required
            aria-invalid={!!errors.identityNumber}
          />
          <Input
            id='family-phone'
            label={t.create.phoneNumber}
            placeholder={t.create.phonePlaceholder}
            value={form.phoneNumber}
            onChange={update('phoneNumber')}
            error={errors.phoneNumber}
            dir='ltr'
            autoComplete='off'
            aria-required
            aria-invalid={!!errors.phoneNumber}
          />
          <Input
            id='family-dob'
            type='date'
            label={t.create.dateOfBirth}
            value={form.dateOfBirth}
            onChange={update('dateOfBirth')}
            error={errors.dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            aria-required
            aria-invalid={!!errors.dateOfBirth}
          />
        </div>

        <div>
          <label className='flex cursor-pointer items-start gap-2 text-sm text-[#1e2364]'>
            <Checkbox
              checked={terms}
              onCheckedChange={(checked) => {
                setTerms(checked === true);
                setErrors((prev) => ({ ...prev, terms: undefined }));
              }}
              className='mt-0.5'
              aria-invalid={!!errors.terms}
            />
            <span>
              {t.create.terms}{' '}
              <Link
                href={getLocalizedRoute(locale, ROUTES.PRIVACY_POLICY)}
                target='_blank'
                className='font-semibold text-[#00a8f1] underline'
              >
                {t.create.termsLink}
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className='mt-1 text-xs text-red-600' role='alert'>
              {errors.terms}
            </p>
          )}
        </div>

        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button variant='outline' type='button' onClick={close}>
            {t.cancel}
          </Button>
          <Button variant='brand' type='submit' loading={createMember.isPending}>
            {t.create.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
