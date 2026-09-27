'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyApi, familyQueryKeys } from '../api/familyApi';
import type {
  CreateFamilyMemberInput,
  RelatedUserStatus,
} from '../types/family.types';

export function useFamily(enabled = true) {
  return useQuery({
    queryKey: familyQueryKeys.all,
    queryFn: async () => (await familyApi.get()).data,
    enabled,
  });
}

/** Mutations that refresh the family lists on success. */
export function useFamilyMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () =>
    queryClient.invalidateQueries({ queryKey: familyQueryKeys.all });

  const link = useMutation({
    mutationFn: (username: string) => familyApi.link(username),
    onSuccess,
  });
  const createMember = useMutation({
    mutationFn: (input: CreateFamilyMemberInput) => familyApi.createMember(input),
    onSuccess,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: RelatedUserStatus }) =>
      familyApi.updateStatus(id, status),
    onSuccess,
  });
  const remove = useMutation({
    mutationFn: (id: number) => familyApi.remove(id),
    onSuccess,
  });

  return { link, createMember, updateStatus, remove };
}
