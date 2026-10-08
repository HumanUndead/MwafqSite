'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { FamilyActionDialog } from '@/modules/family/components/FamilyActionDialog';
import {
  FamilyListSkeleton,
  FamilyLoadError,
} from '@/modules/family/components/FamilyStates';
import { MemberRow } from '@/modules/family/components/MemberRow';
import { useFamily } from '@/modules/family/hooks/useFamily';
import { useFamilyAction } from '@/modules/family/hooks/useFamilyAction';
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

interface RequestsPanelProps {
  id: string;
  title: string;
  emptyLabel: string;
  items: RelatedUser[];
  loading: boolean;
  renderRow: (item: RelatedUser) => ReactNode;
}

function RequestsPanel({
  id,
  title,
  emptyLabel,
  items,
  loading,
  renderRow,
}: RequestsPanelProps) {
  return (
    <Panel flush aria-labelledby={id}>
      <PanelHeader
        id={id}
        title={
          <>
            {title}
            {!loading && items.length > 0 ? (
              <span className={productCountClass}>{items.length}</span>
            ) : null}
          </>
        }
        className='border-b border-[#eef0f7] px-5 py-4 sm:px-6'
      />
      {loading ? (
        <FamilyListSkeleton rows={2} />
      ) : items.length === 0 ? (
        <EmptyState title={emptyLabel} className='py-8' />
      ) : (
        <ul className='divide-y divide-[#eef0f7]'>{items.map(renderRow)}</ul>
      )}
    </Panel>
  );
}

/** Pending relation requests: sent by me (cancel) / received (accept, reject). */
export function FamilyRequestsView() {
  const t = useTranslations('family');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useFamily();
  const action = useFamilyAction();

  const sent = (data?.relatedToUsers ?? []).filter(
    (item) => item.status === RelatedUserStatus.Pending
  );
  const received = (data?.belongToUsers ?? []).filter(
    (item) => item.status === RelatedUserStatus.Pending
  );

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3'>
        <Link
          href={getLocalizedRoute(locale, ROUTES.FAMILY)}
          className={buttonVariants({
            variant: 'productText',
            size: 'compact',
            className: '-ms-3.5 w-fit',
          })}
        >
          <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
          {t.title}
        </Link>
        <PageHeader
          title={t.requests.title}
          description={t.requests.description}
        />
      </div>

      {isError ? (
        <Panel>
          <FamilyLoadError onRetry={() => void refetch()} />
        </Panel>
      ) : (
        <>
          <RequestsPanel
            id='family-received-title'
            title={t.requests.received}
            emptyLabel={t.empty.received}
            items={received}
            loading={isLoading}
            renderRow={(member) => (
              <MemberRow
                key={member.id}
                member={member}
                nameOf='owner'
                actions={
                  <>
                    <Button
                      type='button'
                      variant='productDanger'
                      size='compact'
                      onClick={() => action.request('reject', member.id)}
                    >
                      {t.actions.reject}
                    </Button>
                    <Button
                      type='button'
                      variant='productSecondary'
                      size='compact'
                      onClick={() => action.request('accept', member.id)}
                    >
                      {t.actions.accept}
                    </Button>
                  </>
                }
              />
            )}
          />

          <RequestsPanel
            id='family-sent-title'
            title={t.requests.sent}
            emptyLabel={t.empty.sent}
            items={sent}
            loading={isLoading}
            renderRow={(member) => (
              <MemberRow
                key={member.id}
                member={member}
                actions={
                  <Button
                    type='button'
                    variant='productDanger'
                    size='compact'
                    onClick={() => action.request('cancelRequest', member.id)}
                  >
                    {t.actions.cancelRequest}
                  </Button>
                }
              />
            )}
          />
        </>
      )}

      <FamilyActionDialog action={action} />
    </div>
  );
}
