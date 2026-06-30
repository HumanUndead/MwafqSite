'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { localeToLangId } from '@/i18n/config';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { toast } from '@/shared/components/feedback/Toast';
import { ApiError } from '@/shared/lib/http';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { companyApi } from '../api/companyApi';
import { getLangTabWithErrors, isRichTextEmpty } from '../companyForm.shared';
import type { DdlItem, CompanyCreateDto } from '../types/company.types';

const DEFAULT_COMPANY_RANK = 1;

export interface CompanyFormState {
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  companyPhone: string;
  companySize: string;
  crNumber: string;
  vatNumber: string;
  ipan: string;
  logo: File | null;
  countryId: string;
  cityId: string;
  companyTypeId: string;
  tagIds: string[];
}

export interface CompanyFormErrors {
  nameEn?: string;
  nameAr?: string;
  addressEn?: string;
  addressAr?: string;
  countryId?: string;
  cityId?: string;
  companyTypeId?: string;
  crNumber?: string;
  vatNumber?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

const DEFAULT_COUNTRY_ID = '14';

const INITIAL_FORM: CompanyFormState = {
  nameEn: '',
  nameAr: '',
  addressEn: '',
  addressAr: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  companyPhone: '',
  companySize: '',
  crNumber: '',
  vatNumber: '',
  ipan: '',
  logo: null,
  countryId: DEFAULT_COUNTRY_ID,
  cityId: '',
  companyTypeId: '',
  tagIds: [],
};

export function useCompanyCreate(onSuccess?: () => void) {
  const locale = useLocale();
  const company = useTranslations('company');
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState<CompanyFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<CompanyFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [types, setTypes] = useState<DdlItem[]>([]);
  const [countries, setCountries] = useState<DdlItem[]>([]);
  const [cities, setCities] = useState<DdlItem[]>([]);
  const [tags] = useState<DdlItem[]>([]);

  const [typesLoading, setTypesLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [tagsLoading] = useState(false);

  const tagsType: 0 | 1 = user?.role === 'admin' ? 1 : 0;

  useEffect(() => {
    companyApi
      .getTypes()
      .then(setTypes)
      .catch(console.error)
      .finally(() => setTypesLoading(false));
    // Tags section hidden — skip fetch until classification is re-enabled
    // companyApi.getTags(tagsType).then(setTags).catch(console.error).finally(() => setTagsLoading(false));
  }, [tagsType]);

  useEffect(() => {
    companyApi
      .getCities('')
      .then(() => {})
      .catch(() => {});

    fetch(`/api/general/countries?culture=${locale}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCountries(
            (res.data as Array<{ id: number; name: string }>).map((c) => ({
              id: String(c.id),
              translations: [
                { id: 0, langId: localeToLangId[locale], name: c.name },
              ],
            }))
          );
        }
      })
      .catch(console.error)
      .finally(() => setCountriesLoading(false));
  }, [locale]);

  useEffect(() => {
    const countryId = form.countryId;
    if (!countryId) return;

    let cancelled = false;

    void Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setCitiesLoading(true);
        return companyApi.getCities(countryId);
      })
      .then((data) => {
        if (!data || cancelled) return;
        setCities(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setCitiesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.countryId]);

  const updateField = useCallback(
    <K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) => {
      if (key === 'countryId') {
        setCities([]);
        setCitiesLoading(false);
      }
      setForm((f) => {
        const next = { ...f, [key]: value };
        if (key === 'countryId') next.cityId = '';
        return next;
      });
      setErrors((e) => {
        if (!(key in e)) return e;
        const next = { ...e };
        delete next[key as keyof CompanyFormErrors];
        return next;
      });
    },
    []
  );

  const toggleTag = useCallback((id: string) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(id)
        ? f.tagIds.filter((t) => t !== id)
        : [...f.tagIds, id],
    }));
  }, []);

  const validateForm = (): { valid: boolean; focusLangTab?: 'en' | 'ar' } => {
    const next: CompanyFormErrors = {};
    if (!form.nameEn.trim()) next.nameEn = company.validation.nameEnRequired;
    if (!form.nameAr.trim()) next.nameAr = company.validation.nameArRequired;
    if (isRichTextEmpty(form.addressEn)) {
      next.addressEn = company.validation.addressEnRequired;
    }
    if (isRichTextEmpty(form.addressAr)) {
      next.addressAr = company.validation.addressArRequired;
    }
    if (!form.countryId) next.countryId = company.validation.countryRequired;
    if (!form.cityId) next.cityId = company.validation.cityRequired;
    if (!form.companyTypeId)
      next.companyTypeId = company.validation.typeRequired;
    if (!form.crNumber.trim())
      next.crNumber = company.validation.crNumberRequired;
    if (!form.vatNumber.trim())
      next.vatNumber = company.validation.vatNumberRequired;
    if (!form.contactFirstName.trim()) {
      next.contactFirstName = company.validation.contactFirstNameRequired;
    }
    if (!form.contactLastName.trim()) {
      next.contactLastName = company.validation.contactLastNameRequired;
    }
    if (!form.contactEmail.trim()) {
      next.contactEmail = company.validation.contactEmailRequired;
    }
    if (!form.contactPhone.trim()) {
      next.contactPhone = company.validation.contactPhoneRequired;
    }

    setErrors(next);
    const focusLangTab = getLangTabWithErrors(next);
    return {
      valid: Object.keys(next).length === 0,
      focusLangTab,
    };
  };

  const submitCompany = async () => {
    setSubmitting(true);
    try {
      const dto: CompanyCreateDto = {
        translations: [
          { langId: 1, name: form.nameEn.trim(), address: form.addressEn },
          { langId: 2, name: form.nameAr.trim(), address: form.addressAr },
        ],
        contact: {
          firstName: form.contactFirstName.trim(),
          lastName: form.contactLastName.trim(),
          email: form.contactEmail.trim(),
          phone: form.contactPhone.trim(),
        },
        rank: DEFAULT_COMPANY_RANK,
        companyPhone: form.companyPhone || undefined,
        companySize: form.companySize ? Number(form.companySize) : undefined,
        crNumber: form.crNumber.trim(),
        vatNumber: form.vatNumber.trim(),
        ipan: form.ipan || undefined,
        logo: form.logo,
        countryId: form.countryId,
        cityId: form.cityId,
        companyTypeId: form.companyTypeId,
        tagIds: form.tagIds,
        status: false,
      };
      await companyApi.create(dto);
      toast.success(company.create.success);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : company.create.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, focusLangTab } = validateForm();
    if (!valid) return { valid: false as const, focusLangTab };
    await submitCompany();
    return { valid: true as const };
  };

  const getDdlName = useCallback(
    (items: DdlItem[], id: string) => {
      const item = items.find((i) => i.id === id);
      return item ? getTranslationName(item.translations, locale) : '';
    },
    [locale]
  );

  return {
    form,
    errors,
    submitting,
    updateField,
    toggleTag,
    handleSubmit,
    getDdlName,
    ddl: { types, countries, cities: form.countryId ? cities : [], tags },
    loading: {
      typesLoading,
      countriesLoading,
      citiesLoading: form.countryId ? citiesLoading : false,
      tagsLoading,
    },
  };
}
