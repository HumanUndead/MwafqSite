'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { fieldClass } from '@/modules/family/components/fieldClass';
import { isEmailOrSaudiMobile } from '@/modules/family/family.shared';
import { useFamilyMutations } from '@/modules/family/hooks/useFamily';
import type { CreateFamilyMemberInput } from '@/modules/family/types/family.types';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { ROUTES } from '@/shared/constants/routes';
import { ApiError } from '@/shared/lib/http';

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

/** Field order, used to focus the first invalid field on submit. */
const FIELD_IDS: Record<Field, string> = {
  firstName: 'family-first-name',
  lastName: 'family-last-name',
  identityNumber: 'family-identity',
  phoneNumber: 'family-phone',
  dateOfBirth: 'family-dob',
  terms: 'family-terms',
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
    const firstInvalid = (Object.keys(FIELD_IDS) as Field[]).find(
      (key) => next[key]
    );
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }
    try {
      await createMember.mutateAsync(form);
      toast.success(t.create.success);
      close();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t.errors.generic);
    }
  }

  const field = (key: keyof CreateFamilyMemberInput) => ({
    id: FIELD_IDS[key],
    value: form[key],
    onChange: update(key),
    error: errors[key],
    className: fieldClass(!!errors[key]),
    'aria-required': true,
    'aria-invalid': !!errors[key],
  });

  return (
    <Modal open={open} onClose={close} size='lg' className='max-sm:p-5'>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        aria-labelledby='create-member-title'
        className='flex max-h-[80vh] flex-col gap-5 overflow-y-auto'
      >
        <div>
          <h2
            id='create-member-title'
            className='text-[18px] font-bold text-[#1e2364]'
          >
            {t.create.title}
          </h2>
          <p className='mt-1 text-[14px] leading-6 text-[#6b7196]'>
            {t.create.description}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Input
            label={t.create.firstName}
            autoComplete='off'
            {...field('firstName')}
          />
          <Input
            label={t.create.lastName}
            autoComplete='off'
            {...field('lastName')}
          />
          <Input
            label={t.create.identityNumber}
            inputMode='numeric'
            dir='ltr'
            autoComplete='off'
            {...field('identityNumber')}
          />
          <Input
            label={t.create.phoneNumber}
            placeholder={t.create.phonePlaceholder}
            dir='ltr'
            autoComplete='off'
            {...field('phoneNumber')}
          />
          <Input
            type='date'
            label={t.create.dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            {...field('dateOfBirth')}
          />
        </div>

        <div>
          <label className='flex cursor-pointer items-start gap-2.5 text-[14px] leading-6 text-[#1e2364]'>
            <Checkbox
              id={FIELD_IDS.terms}
              checked={terms}
              onCheckedChange={(checked) => {
                setTerms(checked === true);
                setErrors((prev) => ({ ...prev, terms: undefined }));
              }}
              className='mt-[3px] size-[18px] rounded-[5px] border-[#b9bed3] bg-white focus-visible:ring-2 focus-visible:ring-[#00a8f1]/40 data-checked:border-[#1e2364] data-checked:bg-[#1e2364] data-checked:text-white'
              aria-invalid={!!errors.terms}
            />
            <span>
              {t.create.terms}{' '}
              <Link
                href={getLocalizedRoute(locale, ROUTES.PRIVACY_POLICY)}
                target='_blank'
                className='font-semibold text-[#0077ad] underline underline-offset-4'
              >
                {t.create.termsLink}
              </Link>
            </span>
          </label>
          {errors.terms ? (
            <p className='mt-1 text-[13px] text-red-600' role='alert'>
              {errors.terms}
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
            loading={createMember.isPending}
          >
            {t.create.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
