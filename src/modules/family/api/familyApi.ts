import { http } from '@/shared/lib/http';
import type {
  CreateFamilyMemberInput,
  FamilyLookupUser,
  FamilyOverview,
  RelatedUserStatus,
} from '../types/family.types';

export const familyApi = {
  get: () => http.get<FamilyOverview>('/api/family'),
  link: (username: string) => http.post<number>('/api/family', { username }),
  lookup: (username: string) =>
    http.get<FamilyLookupUser | null>(
      `/api/family/lookup?username=${encodeURIComponent(username)}`
    ),
  createMember: (input: CreateFamilyMemberInput) =>
    http.post<boolean>('/api/family/members', input),
  updateStatus: (relationId: number, status: RelatedUserStatus) =>
    http.put<boolean>(`/api/family/${relationId}`, { status }),
  remove: (relationId: number) => http.delete<boolean>(`/api/family/${relationId}`),
};

export const familyQueryKeys = {
  all: ['family'] as const,
  lookup: (username: string) => ['family', 'lookup', username] as const,
};
