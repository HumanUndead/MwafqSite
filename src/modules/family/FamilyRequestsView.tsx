'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';
import { FamilyActionDialog } from './components/FamilyActionDialog';
import {
  FamilyEmpty,
  FamilyListSkeleton,
  FamilyLoadError,
} from './components/FamilyStates';
import { MemberRow } from './components/MemberRow';
import { useFamily } from './hooks/useFamily';
import { useFamilyAction } from './hooks/useFamilyAction';
import { RelatedUserStatus } from './types/family.types';

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
    <section className='relative pt-2'>
      <Link
        href={getLocalizedRoute(locale, ROUTES.FAMILY)}
        className='mb-5 inline-flex items-center gap-2 text-[14.5px] font-bold text-[#1e2364] hover:text-[#00a8f1]'
      >
        <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
        {t.title}
      </Link>
      <ScrollReveal className='mb-7'>
        <h1 className='mb-2.5 text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
          {t.requests.title}
        </h1>
        <p className='max-w-150 text-base leading-relaxed text-[#6b7196]'>
          {t.requests.description}
        </p>
      </ScrollReveal>

      {isLoading ? (
        <FamilyListSkeleton />
      ) : isError ? (
        <FamilyLoadError onRetry={() => void refetch()} />
      ) : (
        <div className='flex flex-col gap-8'>
          <div>
            <h2 className='mb-3 text-[18px] font-extrabold text-[#1e2364]'>
              {t.requests.received}
            </h2>
            {received.length === 0 ? (
              <FamilyEmpty label={t.empty.received} />
            ) : (
              <ul className='flex flex-col gap-2'>
                {received.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    nameOf='owner'
                    actions={
                      <>
                        <Button
                          variant='brand'
                          size='sm'
                          type='button'
                          onClick={() => action.request('accept', member.id)}
                        >
                          {t.actions.accept}
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          type='button'
                          className='text-red-600'
                          onClick={() => action.request('reject', member.id)}
                        >
                          {t.actions.reject}
                        </Button>
                      </>
                    }
                  />
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className='mb-3 text-[18px] font-extrabold text-[#1e2364]'>
              {t.requests.sent}
            </h2>
            {sent.length === 0 ? (
              <FamilyEmpty label={t.empty.sent} />
            ) : (
              <ul className='flex flex-col gap-2'>
                {sent.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    actions={
                      <Button
                        variant='ghost'
                        size='sm'
                        type='button'
                        className='text-red-600'
                        onClick={() => action.request('cancelRequest', member.id)}
                      >
                        {t.actions.cancelRequest}
                      </Button>
                    }
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <FamilyActionDialog action={action} />
    </section>
  );
}
