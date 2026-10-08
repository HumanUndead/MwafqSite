'use client';

import { useRef, type ReactNode } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { toast } from '@/shared/components/feedback/Toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { authApi } from '@/modules/auth/api/authApi';
import type { User } from '@/shared/types/user.types';
import { useLocale } from '@/i18n/DictionaryProvider';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { fetchCities, updateUserInfo } from '../api/personalInfoApi';

type Labels = {
  title: string;
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
  };
  placeholders: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
  };
  validation: {
    firstNameRequired: string;
    lastNameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    phoneRequired: string;
    cityRequired: string;
  };
  submit: string;
  cancel: string;
  submitting: string;
  submitError: string;
  cityLoadError: string;
  saved: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  labels: Labels;
};

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  cityId: number;
}

function buildSchema(v: Labels['validation']) {
  return z.object({
    firstName: z.string().min(1, v.firstNameRequired),
    lastName: z.string().min(1, v.lastNameRequired),
    email: z.string().min(1, v.emailRequired).email(v.emailInvalid),
    phoneNo: z.string().min(1, v.phoneRequired),
    cityId: z.number().min(1, v.cityRequired),
  });
}

const controlClass =
  'h-11 rounded-xl border-[#d9ddea] bg-white px-3.5 text-[15px] text-[#1e2364] placeholder:text-[#8a8fae] focus:border-[#00a8f1] focus:ring-[#00a8f1]/30';

export function EditPersonalInfoDialog({
  open,
  onOpenChange,
  user,
  labels,
}: Props) {
  const setUser = useAuthStore((s) => s.setUser);
  const locale = useLocale();
  // Esc inside the open city list should close the list, not the dialog.
  const cityListOpen = useRef(false);

  const countryId = user?.countryId ?? 0;

  const citiesQuery = useQuery({
    queryKey: ['cities', countryId],
    queryFn: ({ signal }) => fetchCities(countryId, signal),
    select: (data) => data.data ?? [],
    enabled: open && countryId > 0,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: updateUserInfo,
    async onSuccess() {
      const userResponse = await authApi.getUserByToken();
      setUser(userResponse.data);
      onOpenChange(false);
      toast.success(labels.saved);
    },
  });

  const schema = buildSchema(labels.validation);

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phoneNo: user?.phoneNo ?? '',
      cityId: user?.cityId ?? 0,
    },
    validate(values) {
      const result = schema.safeParse(values);
      if (result.success) return {};
      const errors: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!errors[key]) errors[key] = issue.message;
      }
      return errors;
    },
    onSubmit(values) {
      updateMutation.reset();
      updateMutation.mutate({ ...values, id: user?.id ?? '' });
    },
  });

  const isPending = updateMutation.isPending;

  const close = () => {
    if (isPending || cityListOpen.current) return;
    onOpenChange(false);
    formik.resetForm();
    updateMutation.reset();
  };

  const submitError = updateMutation.isError
    ? updateMutation.error instanceof Error
      ? updateMutation.error.message
      : labels.submitError
    : null;

  const fieldError = (key: keyof FormValues) =>
    formik.touched[key] ? formik.errors[key] : undefined;

  const cityError = citiesQuery.isError
    ? labels.cityLoadError
    : fieldError('cityId');

  return (
    <Modal
      open={open}
      onClose={close}
      title={labels.title}
      className='max-h-[calc(100dvh-2rem)] max-w-[520px] overflow-y-auto p-5 sm:p-6'
    >
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className='flex flex-col gap-4'
      >
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field
            id='firstName'
            label={labels.fields.firstName}
            error={fieldError('firstName')}
          >
            <Input
              id='firstName'
              name='firstName'
              type='text'
              autoComplete='given-name'
              placeholder={labels.placeholders.firstName}
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(fieldError('firstName'))}
              aria-describedby={fieldError('firstName') ? 'firstName-error' : undefined}
              className={cn(controlClass, fieldError('firstName') && 'border-red-500')}
            />
          </Field>

          <Field
            id='lastName'
            label={labels.fields.lastName}
            error={fieldError('lastName')}
          >
            <Input
              id='lastName'
              name='lastName'
              type='text'
              autoComplete='family-name'
              placeholder={labels.placeholders.lastName}
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(fieldError('lastName'))}
              aria-describedby={fieldError('lastName') ? 'lastName-error' : undefined}
              className={cn(controlClass, fieldError('lastName') && 'border-red-500')}
            />
          </Field>
        </div>

        <Field id='email' label={labels.fields.email} error={fieldError('email')}>
          <Input
            id='email'
            name='email'
            type='email'
            dir='ltr'
            autoComplete='email'
            placeholder={labels.placeholders.email}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={Boolean(fieldError('email'))}
            aria-describedby={fieldError('email') ? 'email-error' : undefined}
            className={cn(controlClass, fieldError('email') && 'border-red-500')}
          />
        </Field>

        <Field id='phoneNo' label={labels.fields.phone} error={fieldError('phoneNo')}>
          <Input
            id='phoneNo'
            name='phoneNo'
            type='tel'
            dir='ltr'
            autoComplete='tel'
            placeholder={labels.placeholders.phone}
            value={formik.values.phoneNo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={Boolean(fieldError('phoneNo'))}
            aria-describedby={fieldError('phoneNo') ? 'phoneNo-error' : undefined}
            className={cn(controlClass, fieldError('phoneNo') && 'border-red-500')}
          />
        </Field>

        <Field id='cityId' label={labels.fields.city} error={cityError}>
          <Select
            modal={false}
            value={formik.values.cityId > 0 ? String(formik.values.cityId) : ''}
            onValueChange={(val) => {
              formik.setFieldValue('cityId', Number(val));
              formik.setFieldTouched('cityId', true);
            }}
            onOpenChange={(next) => {
              // Cleared after this keypress so the dialog's Esc handler skips it.
              if (next) cityListOpen.current = true;
              else setTimeout(() => (cityListOpen.current = false), 0);
            }}
            disabled={citiesQuery.isLoading}
          >
            <SelectTrigger
              id='cityId'
              aria-invalid={Boolean(cityError)}
              aria-describedby={cityError ? 'cityId-error' : undefined}
              className={cn(
                'w-full border bg-white px-3.5 text-[15px] text-[#1e2364] data-[size=default]:h-11 rounded-xl border-[#d9ddea] focus-visible:border-[#00a8f1] focus-visible:ring-[#00a8f1]/30',
                cityError && 'border-red-500'
              )}
            >
              <SelectValue
                placeholder={labels.placeholders.city}
                className='text-start'
              >
                {formik.values.cityId > 0
                  ? getTranslationName(
                      citiesQuery.data?.find((c) => c.id === formik.values.cityId)
                        ?.translations ?? [],
                      locale
                    )
                  : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {citiesQuery.data?.map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {getTranslationName(city.translations, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {submitError ? (
          <p
            role='alert'
            className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700'
          >
            {submitError}
          </p>
        ) : null}

        <div className='mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='productSecondary'
            size='control'
            onClick={close}
            disabled={isPending}
          >
            {labels.cancel}
          </Button>
          <Button type='submit' variant='product' size='control' loading={isPending}>
            {labels.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor={id} className='text-[13px] font-semibold text-[#4a5078]'>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className='text-[13px] font-semibold text-red-700'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
