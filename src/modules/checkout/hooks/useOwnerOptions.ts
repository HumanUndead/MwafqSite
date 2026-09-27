'use client';

import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  memberName,
  RelatedUserStatus,
  useFamily,
} from '@/modules/family';

export interface OwnerOption {
  id: string;
  name: string;
  image: string | null;
  isSelf: boolean;
  status: RelatedUserStatus;
  /** Only the user and accepted relations can be booked for. */
  selectable: boolean;
}

/** "You" + the people I added (relatedToUsers). */
export function useOwnerOptions() {
  const user = useAuthStore((state) => state.user);
  const family = useFamily(!!user);

  const self: OwnerOption | null = user
    ? {
        id: user.id,
        name: user.name || `${user.firstName} ${user.lastName}`.trim(),
        image: user.img || null,
        isSelf: true,
        status: RelatedUserStatus.Accepted,
        selectable: true,
      }
    : null;

  const related: OwnerOption[] = (family.data?.relatedToUsers ?? []).map(
    (member) => ({
      id: member.userId,
      name: memberName(member),
      image: member.image,
      isSelf: false,
      status: member.status,
      selectable: member.status === RelatedUserStatus.Accepted,
    })
  );

  return {
    options: self ? [self, ...related] : related,
    selfId: user?.id ?? null,
    isLoading: family.isLoading,
    isError: family.isError,
    refetch: family.refetch,
  };
}
