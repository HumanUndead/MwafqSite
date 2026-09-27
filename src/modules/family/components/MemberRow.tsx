'use client';

import type { ReactNode } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import { RelatedUserStatus, type RelatedUser } from '../types/family.types';
import { MemberAvatar } from './MemberAvatar';

interface MemberRowProps {
  member: RelatedUser;
  /** Which name to show: the related person, or the one who added me. */
  nameOf?: 'member' | 'owner';
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

export function StatusBadge({ status }: { status: RelatedUserStatus }) {
  const t = useTranslations('family');
  const label =
    status === RelatedUserStatus.Accepted
      ? t.status.accepted
      : status === RelatedUserStatus.Rejected
        ? t.status.rejected
        : t.status.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-bold',
        status === RelatedUserStatus.Accepted && 'bg-green-50 text-green-700',
        status === RelatedUserStatus.Rejected && 'bg-red-50 text-red-700',
        status === RelatedUserStatus.Pending && 'bg-amber-50 text-amber-700'
      )}
    >
      {label}
    </span>
  );
}

export function MemberRow({ member, nameOf = 'member', actions }: MemberRowProps) {
  const name = memberName(member, nameOf);
  return (
    <li className='flex flex-wrap items-center gap-3 rounded-[16px] border-2 border-[#e5e7f0] bg-white px-4 py-3'>
      <MemberAvatar name={name} image={nameOf === 'member' ? member.image : null} />
      <div className='min-w-0 flex-1'>
        <p className='truncate text-[14.5px] font-bold text-[#1e2364]'>{name}</p>
        <StatusBadge status={member.status} />
      </div>
      {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}
    </li>
  );
}
