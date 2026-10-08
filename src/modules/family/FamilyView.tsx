'use client';

import { Inbox, Link2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import {
  profileTabListClass,
  profileTabTriggerClass,
} from '@/modules/profile/tabStyles';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { Button, buttonVariants } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { CreateMemberDialog } from './components/CreateMemberDialog';
import { FamilyActionDialog } from './components/FamilyActionDialog';
import {
  FamilyEmpty,
  FamilyListSkeleton,
  FamilyLoadError,
} from './components/FamilyStates';
import { LinkMemberDialog } from './components/LinkMemberDialog';
import { MemberRow } from './components/MemberRow';
import { useFamily } from './hooks/useFamily';
import { useFamilyAction } from './hooks/useFamilyAction';
import { useFamilySelectionStore } from './store/familySelectionStore';
import { RelatedUserStatus, type RelatedUser } from './types/family.types';

function bySection(list: RelatedUser[]) {
  return {
    accepted: list.filter((item) => item.status === RelatedUserStatus.Accepted),
    rejected: list.filter((item) => item.status === RelatedUserStatus.Rejected),
  };
}

export function FamilyView() {
  const t = useTranslations('family');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useFamily();
  const action = useFamilyAction();
  const [dialog, setDialog] = useState<'link' | 'create' | null>(null);
  const setSelectedMemberId = useFamilySelectionStore(
    (state) => state.setSelectedMemberId
  );

  const pendingCount =
    (data?.relatedToUsers ?? []).filter(
      (item) => item.status === RelatedUserStatus.Pending
    ).length +
    (data?.belongToUsers ?? []).filter(
      (item) => item.status === RelatedUserStatus.Pending
    ).length;

  function renderList(
    list: RelatedUser[],
    nameOf: 'member' | 'owner',
    emptyLabel: string
  ) {
    const sections = bySection(list);
    if (sections.accepted.length + sections.rejected.length === 0) {
      return <FamilyEmpty label={emptyLabel} />;
    }
    return (
      <div className='flex flex-col gap-6'>
        {(['accepted', 'rejected'] as const).map((key) =>
          sections[key].length > 0 ? (
            <div key={key}>
              <h3 className='mb-2 text-[13px] font-bold uppercase tracking-wide text-[#6b7196]'>
                {t.sections[key]}
              </h3>
              <ul className='flex flex-col gap-2'>
                {sections[key].map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    nameOf={nameOf}
                    actions={
                      <>
                        {key === 'accepted' && nameOf === 'member' && (
                          <>
                            <Link
                              href={getLocalizedRoute(
                                locale,
                                ROUTES.MY_RESERVATIONS
                              )}
                              onClick={() => setSelectedMemberId(member.userId)}
                              className={buttonVariants({
                                variant: 'outline',
                                size: 'sm',
                              })}
                            >
                              {t.actions.viewReservations}
                            </Link>
                            <Link
                              href={`${getLocalizedRoute(locale, ROUTES.ACADEMY_COURSES)}?userId=${encodeURIComponent(member.userId)}`}
                              className={buttonVariants({
                                variant: 'outline',
                                size: 'sm',
                              })}
                            >
                              {t.actions.viewCourses}
                            </Link>
                          </>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          type='button'
                          className='text-red-600'
                          onClick={() => action.request('remove', member.id)}
                        >
                          {t.actions.remove}
                        </Button>
                      </>
                    }
                  />
                ))}
              </ul>
            </div>
          ) : null
        )}
      </div>
    );
  }

  return (
    <section className='relative pt-2'>
      <ScrollReveal className='mb-7'>
        <h1 className='mb-2.5 text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
          {t.title}
        </h1>
        <p className='max-w-150 text-base leading-relaxed text-[#6b7196]'>
          {t.subtitle}
        </p>
      </ScrollReveal>

      <div className='mb-6 flex flex-wrap items-center gap-2'>
        <Button variant='brand' type='button' onClick={() => setDialog('link')}>
          <Link2 className='size-4' aria-hidden />
          {t.actions.linkExisting}
        </Button>
        <Button
          variant='outline'
          type='button'
          onClick={() => setDialog('create')}
        >
          <UserPlus className='size-4' aria-hidden />
          {t.actions.createNew}
        </Button>
        <Link
          href={getLocalizedRoute(locale, ROUTES.FAMILY_REQUESTS)}
          className={cn(buttonVariants({ variant: 'ghost' }), 'ms-auto')}
        >
          <Inbox className='size-4' aria-hidden />
          {t.requests.link}
          {pendingCount > 0 && (
            <span className='inline-flex min-w-5 items-center justify-center rounded-full bg-[#00a8f1] px-1.5 text-[11px] font-bold text-white'>
              {pendingCount}
            </span>
          )}
        </Link>
      </div>

      <Tabs defaultValue='related'>
        <TabsList
          variant='line'
          aria-label={t.tabsAriaLabel}
          className={profileTabListClass}
        >
          <TabsTrigger
            value='related'
            className={cn(profileTabTriggerClass, 'flex-initial')}
          >
            {t.tabs.related}
          </TabsTrigger>
        </TabsList>

        <div className='mt-4'>
          {isLoading ? (
            <FamilyListSkeleton />
          ) : isError ? (
            <FamilyLoadError onRetry={() => void refetch()} />
          ) : (
            <>
              <TabsContent value='related' className='outline-none'>
                {renderList(
                  data?.relatedToUsers ?? [],
                  'member',
                  t.empty.related
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      <LinkMemberDialog
        open={dialog === 'link'}
        onClose={() => setDialog(null)}
      />
      <CreateMemberDialog
        open={dialog === 'create'}
        onClose={() => setDialog(null)}
      />
      <FamilyActionDialog action={action} />
    </section>
  );
}
