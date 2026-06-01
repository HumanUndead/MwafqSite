'use client';

import { useFormik } from 'formik';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/modules/auth/store/authStore';
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

export function EditPersonalInfoDialog({
  open,
  onOpenChange,
  user,
  labels,
}: Props) {
  const setUser = useAuthStore((s) => s.setUser);
  const locale = useLocale();

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
    onSuccess(updated: User) {
      setUser(updated);
      onOpenChange(false);
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

  const close = () => {
    if (formik.isSubmitting || updateMutation.isPending) return;
    onOpenChange(false);
    formik.resetForm();
    updateMutation.reset();
  };

  const isPending = updateMutation.isPending;
  const submitError = updateMutation.isError
    ? updateMutation.error instanceof Error
      ? updateMutation.error.message
      : labels.submitError
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='text-[18px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
            {labels.title}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className='flex flex-col gap-4 pt-1'
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Field
              label={labels.fields.firstName}
              error={
                formik.touched.firstName ? formik.errors.firstName : undefined
              }
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
                aria-invalid={Boolean(
                  formik.touched.firstName && formik.errors.firstName
                )}
                className='h-10 w-full rounded-xl border-2 border-[#e5e7f0] bg-[#f5f8ff] px-4 text-[14.5px] font-medium text-[#1e2364] placeholder:text-[#9ca3c8] focus-visible:border-[#00a8f1] aria-invalid:border-red-400'
              />
            </Field>

            <Field
              label={labels.fields.lastName}
              error={
                formik.touched.lastName ? formik.errors.lastName : undefined
              }
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
                aria-invalid={Boolean(
                  formik.touched.lastName && formik.errors.lastName
                )}
                className='h-10 w-full rounded-xl border-2 border-[#e5e7f0] bg-[#f5f8ff] px-4 text-[14.5px] font-medium text-[#1e2364] placeholder:text-[#9ca3c8] focus-visible:border-[#00a8f1] aria-invalid:border-red-400'
              />
            </Field>
          </div>

          <Field
            label={labels.fields.email}
            error={formik.touched.email ? formik.errors.email : undefined}
          >
            <Input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              placeholder={labels.placeholders.email}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(
                formik.touched.email && formik.errors.email
              )}
              className='h-10 w-full rounded-xl border-2 border-[#e5e7f0] bg-[#f5f8ff] px-4 text-[14.5px] font-medium text-[#1e2364] placeholder:text-[#9ca3c8] focus-visible:border-[#00a8f1] aria-invalid:border-red-400'
            />
          </Field>

          <Field
            label={labels.fields.phone}
            error={formik.touched.phoneNo ? formik.errors.phoneNo : undefined}
          >
            <Input
              id='phoneNo'
              name='phoneNo'
              type='tel'
              autoComplete='tel'
              placeholder={labels.placeholders.phone}
              value={formik.values.phoneNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(
                formik.touched.phoneNo && formik.errors.phoneNo
              )}
              className='h-10 w-full rounded-xl border-2 border-[#e5e7f0] bg-[#f5f8ff] px-4 text-[14.5px] font-medium text-[#1e2364] placeholder:text-[#9ca3c8] focus-visible:border-[#00a8f1] aria-invalid:border-red-400'
            />
          </Field>

          <Field
            label={labels.fields.city}
            error={
              citiesQuery.isError
                ? labels.cityLoadError
                : formik.touched.cityId
                  ? formik.errors.cityId
                  : undefined
            }
          >
            <Select
              value={
                formik.values.cityId > 0 ? String(formik.values.cityId) : ''
              }
              onValueChange={(val) => {
                formik.setFieldValue('cityId', Number(val));
                formik.setFieldTouched('cityId', true);
              }}
              disabled={citiesQuery.isLoading}
            >
              <SelectTrigger
                className={cn(
                  'h-10 w-full rounded-xl border-2 border-[#e5e7f0] bg-[#f5f8ff] px-4 text-[14.5px] font-medium text-[#1e2364]',
                  formik.touched.cityId &&
                    formik.errors.cityId &&
                    'border-red-400'
                )}
              >
                <SelectValue placeholder={labels.placeholders.city}>
                  {formik.values.cityId > 0
                    ? getTranslationName(
                        citiesQuery.data?.find(
                          (c) => c.id === formik.values.cityId
                        )?.translations ?? [],
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
            <p className='rounded-lg bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600'>
              {submitError}
            </p>
          ) : null}

          <DialogFooter className='mt-1'>
            <Button
              type='button'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className='rounded-xl border-2 border-[#e5e7f0] bg-transparent px-5 py-2.5 text-[14px] font-bold text-[#6b7196] hover:border-[#00a8f1] hover:bg-transparent hover:text-[#00a8f1]'
            >
              {labels.cancel}
            </Button>
            <Button
              type='submit'
              loading={isPending}
              className='rounded-xl px-5 py-2.5 text-[14px] font-bold'
            >
              {labels.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-[13px] font-bold uppercase tracking-widest text-[#6b7196]'>
        {label}
      </label>
      {children}
      {error ? (
        <p className='text-[12.5px] font-medium text-red-500'>{error}</p>
      ) : null}
    </div>
  );
}
