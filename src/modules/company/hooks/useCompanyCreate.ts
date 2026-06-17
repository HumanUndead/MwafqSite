'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { localeToLangId } from '@/i18n/config';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { toast } from '@/shared/components/feedback/Toast';
import { getTranslationName } from '@/shared/lib/getTranslationName';
import { companyApi } from '../api/companyApi';
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
  parentCompanyId: string;
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
  status: boolean;
}

export interface CompanyFormErrors {
  nameEn?: string;
  rank?: string;
  countryId?: string;
  cityId?: string;
  companyTypeId?: string;
}

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
  parentCompanyId: '',
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
  status: true,
};

export function useCompanyCreate(onSuccess?: () => void) {
  const locale = useLocale();
  const company = useTranslations('company');
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState<CompanyFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<CompanyFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [types, setTypes] = useState<DdlItem[]>([]);
  const [parents, setParents] = useState<DdlItem[]>([]);
  const [countries, setCountries] = useState<DdlItem[]>([]);
  const [cities, setCities] = useState<DdlItem[]>([]);
  const [tags, setTags] = useState<DdlItem[]>([]);
  const [userResults, setUserResults] = useState<UserSearchItem[]>([]);

  const [typesLoading, setTypesLoading] = useState(true);
  const [parentsLoading, setParentsLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tagsType: 0 | 1 = user?.role === 'admin' ? 1 : 0;

  useEffect(() => {
    companyApi.getTypes().then(setTypes).catch(console.error).finally(() => setTypesLoading(false));
    companyApi.getParents().then(setParents).catch(console.error).finally(() => setParentsLoading(false));
    companyApi.getTags(tagsType).then(setTags).catch(console.error).finally(() => setTagsLoading(false));
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
    if (!form.countryId) {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    companyApi
      .getCities(form.countryId)
      .then(setCities)
      .catch(console.error)
      .finally(() => setCitiesLoading(false));
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
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '',
    }));
  }, []);

  const updateField = useCallback(
    <K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) => {
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

  const validate = (): boolean => {
    const next: CompanyFormErrors = {};
    if (!form.nameEn.trim()) next.nameEn = company.validation.nameEnRequired;
    if (!form.rank.trim()) {
      next.rank = company.validation.rankRequired;
    } else if (isNaN(Number(form.rank)) || Number(form.rank) <= 0) {
      next.rank = company.validation.rankPositive;
    }
    if (!form.countryId) next.countryId = company.validation.countryRequired;
    if (!form.cityId) next.cityId = company.validation.cityRequired;
    if (!form.companyTypeId) next.companyTypeId = company.validation.typeRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const dto: CompanyCreateDto = {
        translations: [
          { langId: 1, name: form.nameEn.trim(), address: form.addressEn },
          { langId: 2, name: form.nameAr.trim(), address: form.addressAr },
        ],
        contact: {
          userId: form.selectedContactUserId || undefined,
          firstName: form.contactFirstName || undefined,
          lastName: form.contactLastName || undefined,
          email: form.contactEmail || undefined,
          phone: form.contactPhone || undefined,
        },
        parentCompanyId: form.parentCompanyId || undefined,
        rank: Number(form.rank),
        companyPhone: form.companyPhone || undefined,
        companySize: form.companySize ? Number(form.companySize) : undefined,
        crNumber: form.crNumber || undefined,
        vatNumber: form.vatNumber || undefined,
        ipan: form.ipan || undefined,
        logo: form.logo,
        countryId: form.countryId,
        cityId: form.cityId,
        companyTypeId: form.companyTypeId,
        tagIds: form.tagIds,
        status: form.status,
      };
      await companyApi.create(dto);
      toast.success(company.create.success);
      onSuccess?.();
    } catch {
      toast.error(company.create.error);
    } finally {
      setSubmitting(false);
    }
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
    ddl: { types, parents, countries, cities, tags },
    loading: { typesLoading, parentsLoading, countriesLoading, citiesLoading, tagsLoading },
  };
}
