import { http } from '@/shared/lib/http';
import type { DdlItem, UserSearchItem, CompanyCreateDto, CompanyCreateResponse } from '../types/company.types';

interface DdlResponse {
  id: string;
  langId: number;
  name: string;
}

function toDdlItem(items: DdlResponse[]): DdlItem[] {
  const ids = [...new Set(items.map((i) => i.id))];
  return ids.map((id) => {
    const group = items.filter((i) => i.id === id);
    return {
      id,
      translations: group.map((i) => ({
        id: 0,
        langId: i.langId,
        name: i.name,
      })),
    };
  });
}

export const companyApi = {
  getTypes: async () => {
    const res = await http.get<DdlResponse[]>('/api/company/types');
    return toDdlItem(res.data ?? []);
  },

  getParents: async () => {
    const res = await http.get<DdlResponse[]>('/api/company/parents');
    return toDdlItem(res.data ?? []);
  },

  getCities: async (countryId: string) => {
    const res = await http.get<DdlResponse[]>(
      `/api/general/cities?countryId=${encodeURIComponent(countryId)}`
    );
    return toDdlItem(res.data ?? []);
  },

  getTags: async (type: 0 | 1) => {
    const res = await http.get<DdlResponse[]>(`/api/general/tags?type=${type}`);
    return toDdlItem(res.data ?? []);
  },

  searchUsers: async (search: string) => {
    const res = await http.get<UserSearchItem[]>(
      `/api/users/search?search=${encodeURIComponent(search)}`
    );
    return res.data ?? [];
  },

  create: (dto: CompanyCreateDto) => {
    const form = new FormData();

    const en = dto.translations.find((t) => t.langId === 1);
    const ar = dto.translations.find((t) => t.langId === 2);

    if (en?.name) form.set('NameEn', en.name);
    if (ar?.name) form.set('NameAr', ar.name);
    if (en?.address) form.set('AddressEn', en.address);
    if (ar?.address) form.set('AddressAr', ar.address);

    form.set('Rank', String(dto.rank));
    form.set('CountryId', dto.countryId);
    form.set('CityId', dto.cityId);
    form.set('CompanyTypeId', dto.companyTypeId);
    form.set('Status', dto.status ? 'true' : 'false');

    if (dto.parentCompanyId) form.set('ParentCompanyId', dto.parentCompanyId);
    if (dto.companyPhone) form.set('CompanyPhone', dto.companyPhone);
    if (dto.companySize != null) form.set('CompanySize', String(dto.companySize));
    if (dto.crNumber) form.set('CrNumber', dto.crNumber);
    if (dto.vatNumber) form.set('VatNumber', dto.vatNumber);
    if (dto.ipan) form.set('Ipan', dto.ipan);
    if (dto.logo) form.set('Logo', dto.logo);

    if (dto.contact.userId) form.set('ContactUserId', dto.contact.userId);
    if (dto.contact.firstName) form.set('ContactFirstName', dto.contact.firstName);
    if (dto.contact.lastName) form.set('ContactLastName', dto.contact.lastName);
    if (dto.contact.email) form.set('ContactEmail', dto.contact.email);
    if (dto.contact.phone) form.set('ContactPhone', dto.contact.phone);

    for (const tagId of dto.tagIds) {
      form.append('Tags', tagId);
    }

    return http.post<CompanyCreateResponse>('/api/company/create', form);
  },
};
