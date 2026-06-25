import type { EntityTranslation } from '@/shared/types/entity-translation.types';

export interface CompanyTranslationInput {
  langId: number;
  name: string;
  address: string;
}

export interface CompanyContactInput {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface CompanyCreateDto {
  translations: CompanyTranslationInput[];
  contact: CompanyContactInput;
  parentCompanyId?: string;
  rank: number;
  companyPhone?: string;
  companySize?: number;
  crNumber: string;
  vatNumber: string;
  ipan?: string;
  logo?: File | null;
  countryId: string;
  cityId: string;
  companyTypeId: string;
  tagIds: string[];
  status: boolean;
}

export interface DdlItem {
  id: string;
  translations: EntityTranslation[];
}

export interface UserSearchItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CompanyCreateResponse {
  id: string;
}
