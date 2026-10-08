'use client';

import type { ReactNode } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { MemberAvatar } from '@/modules/family/components/MemberAvatar';
import {
  RelatedUserStatus,
  type RelatedUser,
} from '@/modules/family/types/family.types';
import { StatusBadge, type StatusTone } from '@/shared/components/product';

interface MemberRowProps {
  member: RelatedUser;
  /** Which name to show: the related person, or the one who added me. */
  nameOf?: 'member' | 'owner';
  /** Show the relation status next to the name. */
  showStatus?: boolean;
  actions?: ReactNode;
}

export function memberName(
  member: RelatedUser,
  nameOf: 'member' | 'owner' = 'member'
): string {
  if (nameOf === 'owner') return member.fullNameRelatedTo?.trim() || '';
  return (
    member.fullName?.trim() ||
    `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()
  );
}

const STATUS_TONE: Record<RelatedUserStatus, StatusTone> = {
  [RelatedUserStatus.Pending]: 'warning',
  [RelatedUserStatus.Accepted]: 'success',
  [RelatedUserStatus.Rejected]: 'danger',
};

export function MemberStatusBadge({ status }: { status: RelatedUserStatus }) {
  const t = useTranslations('family');
  const label =
    status === RelatedUserStatus.Accepted
      ? t.status.accepted
      : status === RelatedUserStatus.Rejected
        ? t.status.rejected
        : t.status.pending;
  return <StatusBadge tone={STATUS_TONE[status]}>{label}</StatusBadge>;
}

/** One person in a flush Panel list. Actions stack under the name on mobile. */
export function MemberRow({
  member,
  nameOf = 'member',
  showStatus = false,
  actions,
}: MemberRowProps) {
  const name = memberName(member, nameOf);
  return (
    <li className='flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <MemberAvatar
          name={name}
          image={nameOf === 'member' ? member.image : null}
        />
        <div className='flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1'>
          <p className='min-w-0 break-words text-[15px] font-bold leading-6 text-[#1e2364]'>
            {name}
          </p>
          {showStatus ? <MemberStatusBadge status={member.status} /> : null}
        </div>
      </div>
      {actions ? (
        <div className='flex shrink-0 flex-wrap gap-2 max-sm:[&>*]:flex-1'>
          {actions}
        </div>
      ) : null}
    </li>
  );
}
