'use client';

import { Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { AddMemberDialog } from '@/modules/family/components/AddMemberDialog';
import { CreateMemberDialog } from '@/modules/family/components/CreateMemberDialog';
import { FamilyActionDialog } from '@/modules/family/components/FamilyActionDialog';
import {
  FamilyListSkeleton,
  FamilyLoadError,
} from '@/modules/family/components/FamilyStates';
import { LinkMemberDialog } from '@/modules/family/components/LinkMemberDialog';
import { MemberRow } from '@/modules/family/components/MemberRow';
import { useFamily } from '@/modules/family/hooks/useFamily';
import { useFamilyAction } from '@/modules/family/hooks/useFamilyAction';
import { useFamilySelectionStore } from '@/modules/family/store/familySelectionStore';
import {
  RelatedUserStatus,
  type RelatedUser,
} from '@/modules/family/types/family.types';
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  productCountClass,
} from '@/shared/components/product';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';

type DialogKind = 'add' | 'link' | 'create' | null;

const isPending = (item: RelatedUser) =>
  item.status === RelatedUserStatus.Pending;

export function FamilyView() {
  const t = useTranslations('family');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useFamily();
  const action = useFamilyAction();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const setSelectedMemberId = useFamilySelectionStore(
    (state) => state.setSelectedMemberId
  );

  const related = data?.relatedToUsers ?? [];
  // Accepted first, then rejected; pending ones live on the requests page.
  const members = [
    ...related.filter((item) => item.status === RelatedUserStatus.Accepted),
    ...related.filter((item) => item.status === RelatedUserStatus.Rejected),
  ];
  const pendingCount =
    related.filter(isPending).length +
    (data?.belongToUsers ?? []).filter(isPending).length;

  const reservationsHref = getLocalizedRoute(locale, ROUTES.MY_RESERVATIONS);
  const coursesHref = getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES);
  const rowAction = buttonVariants({ variant: 'productText', size: 'compact' });

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={
          <>
            <Link
              href={getLocalizedRoute(locale, ROUTES.FAMILY_REQUESTS)}
              className={buttonVariants({
                variant: 'productSecondary',
                size: 'control',
              })}
            >
              {t.requests.link}
              {pendingCount > 0 ? (
                <span className={productCountClass}>{pendingCount}</span>
              ) : null}
            </Link>
            <Button
              type='button'
              variant='product'
              size='control'
              onClick={() => setDialog('add')}
            >
              {t.actions.add}
            </Button>
          </>
        }
      />

      <Panel flush aria-labelledby='family-members-title'>
        <PanelHeader
          id='family-members-title'
          title={t.list.title}
          description={t.list.description}
          className='border-b border-[#eef0f7] px-5 py-4 sm:px-6'
        />
        {isLoading ? (
          <FamilyListSkeleton />
        ) : isError ? (
          <FamilyLoadError onRetry={() => void refetch()} />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users aria-hidden />}
            title={t.empty.related}
            description={t.empty.relatedDescription}
            action={
              <Button
                type='button'
                variant='productSecondary'
                size='control'
                onClick={() => setDialog('add')}
              >
                {t.actions.add}
              </Button>
            }
          />
        ) : (
          <ul className='divide-y divide-[#eef0f7]'>
            {members.map((member) => {
              const accepted = member.status === RelatedUserStatus.Accepted;
              return (
                <MemberRow
                  key={member.id}
                  member={member}
                  showStatus={!accepted}
                  actions={
                    <>
                      {accepted ? (
                        <>
                          <Link
                            href={reservationsHref}
                            onClick={() => setSelectedMemberId(member.userId)}
                            className={rowAction}
                          >
                            {t.actions.viewReservations}
                          </Link>
                          <Link
                            href={`${coursesHref}?userId=${encodeURIComponent(member.userId)}`}
                            className={rowAction}
                          >
                            {t.actions.viewCourses}
                          </Link>
                        </>
                      ) : null}
                      <Button
                        type='button'
                        variant='productDanger'
                        size='compact'
                        onClick={() => action.request('remove', member.id)}
                      >
                        {t.actions.remove}
                      </Button>
                    </>
                  }
                />
              );
            })}
          </ul>
        )}
      </Panel>

      <AddMemberDialog
        open={dialog === 'add'}
        onClose={() => setDialog(null)}
        onChoose={(mode) => setDialog(mode)}
      />
      <LinkMemberDialog
        open={dialog === 'link'}
        onClose={() => setDialog(null)}
      />
      <CreateMemberDialog
        open={dialog === 'create'}
        onClose={() => setDialog(null)}
      />
      <FamilyActionDialog action={action} />
    </div>
  );
}
