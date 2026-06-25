import { http } from '@/shared/lib/http';
import { buildCompanyCreateUpstreamForm } from '../companyCreatePayload.shared';
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
    const form = buildCompanyCreateUpstreamForm(dto);
    return http.post<CompanyCreateResponse>('/api/company/create', form);
  },
};
