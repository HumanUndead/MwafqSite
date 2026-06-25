'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { localeToLangId } from '@/i18n/config';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { toast } from '@/shared/components/feedback/Toast';
import { ApiError } from '@/shared/lib/http';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { companyApi } from '../api/companyApi';
import { getLangTabWithErrors, isRichTextEmpty } from '../companyForm.shared';
import type { DdlItem, UserSearchItem, CompanyCreateDto } from '../types/company.types';

export interface CompanyFormState {
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  selectedContactUserId: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  rank: string;
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
  rank?: string;
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

const CONTACT_MANUAL_FIELDS = new Set<keyof CompanyFormState>([
  'contactFirstName',
  'contactLastName',
  'contactEmail',
  'contactPhone',
]);

const INITIAL_FORM: CompanyFormState = {
  nameEn: '',
  nameAr: '',
  addressEn: '',
  addressAr: '',
  selectedContactUserId: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  rank: '',
  companyPhone: '',
  companySize: '',
  crNumber: '',
  vatNumber: '',
  ipan: '',
  logo: null,
  countryId: '',
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
  const [userResults, setUserResults] = useState<UserSearchItem[]>([]);

  const [typesLoading, setTypesLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [tagsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tagsType: 0 | 1 = user?.role === 'admin' ? 1 : 0;

  useEffect(() => {
    companyApi.getTypes().then(setTypes).catch(console.error).finally(() => setTypesLoading(false));
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
              translations: [{ id: 0, langId: localeToLangId[locale], name: c.name }],
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

  const searchUsers = useCallback((term: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!term.trim()) {
      setUserResults([]);
      return;
    }
    setUsersLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await companyApi.searchUsers(term);
        setUserResults(results);
      } catch {
        setUserResults([]);
      } finally {
        setUsersLoading(false);
      }
    }, 300);
  }, []);

  const selectContactUser = useCallback((user: UserSearchItem) => {
    setForm((f) => ({
      ...f,
      selectedContactUserId: user.id,
      contactFirstName: user.firstName,
      contactLastName: user.lastName,
      contactEmail: user.email,
      contactPhone: user.phone,
    }));
    setUserResults([]);
  }, []);

  const clearContactUser = useCallback(() => {
    setForm((f) => ({
      ...f,
      selectedContactUserId: '',
    }));
  }, []);

  const updateField = useCallback(
    <K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) => {
      if (key === 'countryId') {
        setCities([]);
        setCitiesLoading(false);
      }
      setForm((f) => {
        const next = { ...f, [key]: value };
        if (key === 'countryId') next.cityId = '';
        if (CONTACT_MANUAL_FIELDS.has(key)) next.selectedContactUserId = '';
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
    if (!form.rank.trim()) {
      next.rank = company.validation.rankRequired;
    } else if (isNaN(Number(form.rank)) || Number(form.rank) <= 0) {
      next.rank = company.validation.rankPositive;
    }
    if (!form.countryId) next.countryId = company.validation.countryRequired;
    if (!form.cityId) next.cityId = company.validation.cityRequired;
    if (!form.companyTypeId) next.companyTypeId = company.validation.typeRequired;
    if (!form.crNumber.trim()) next.crNumber = company.validation.crNumberRequired;
    if (!form.vatNumber.trim()) next.vatNumber = company.validation.vatNumberRequired;
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
          userId: form.selectedContactUserId || undefined,
          firstName: form.contactFirstName.trim(),
          lastName: form.contactLastName.trim(),
          email: form.contactEmail.trim(),
          phone: form.contactPhone.trim(),
        },
        rank: Number(form.rank),
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
      toast.error(
        err instanceof ApiError ? err.message : company.create.error
      );
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
    searchUsers,
    selectContactUser,
    clearContactUser,
    userResults,
    usersLoading,
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
