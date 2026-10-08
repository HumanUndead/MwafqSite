'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/modules/auth/store/authStore';
import type { User } from '@/shared/types/user.types';
import { getUserMemberSinceDate } from '@/shared/lib/user';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { PageHeader, Panel, PanelHeader } from '@/shared/components/product';
import { Button } from '@/shared/components/ui/Button';
import type { PersonalInfoStats } from '@/modules/profile-personal/personalStats.shared';
import type { PersonalInfoContact } from '@/modules/profile-personal/types/personalInfo.types';
import { ContactDetails } from './components/ContactDetails';
import { EditPersonalInfoDialog } from './components/EditPersonalInfoDialog';
import { PersonalStatsSummary } from './components/PersonalStatsSummary';

function contactFromUser(user: User | null): Partial<PersonalInfoContact> {
  if (!user) {
    return {};
  }

  const next: Partial<PersonalInfoContact> = {};
  const name = user.name?.trim();
  const email = user.email?.trim();
  const phone = user.phoneNo?.trim() || user.userName?.trim();
  const city = user.cityName?.trim();
  const country = user.countryName?.trim();
  const mailingAddress = user.address?.trim();

  if (name) {
    next.name = name;
  }
  if (email) {
    next.email = email;
  }
  if (phone) {
    next.phone = phone;
  }
  if (city) {
    next.city = city;
  }
  if (country) {
    next.country = country;
  }
  if (mailingAddress) {
    next.mailingAddress = mailingAddress;
  }

  return next;
}

function formatMemberSince(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export type { PersonalInfoContact, PersonalInfoStats };

export type PersonalInfoViewProps = {
  /** User from session cookie (RSC). Client store wins after rehydrate. */
  sessionUser?: User | null;
  contact?: Partial<PersonalInfoContact>;
  /** Undefined when the statistics request failed. */
  stats?: Partial<PersonalInfoStats>;
};

/** Contact details (view + edit) and a compact activity summary. */
export function PersonalInfoView({
  sessionUser = null,
  contact: contactProp,
  stats,
}: PersonalInfoViewProps) {
  const t = useTranslations('profilePersonal');
  const locale = useLocale();
  const storeUser = useAuthStore((s) => s.user);
  const resolvedUser = storeUser ?? sessionUser ?? null;
  const [editOpen, setEditOpen] = useState(false);

  const contact = useMemo(
    () => ({ ...contactFromUser(resolvedUser), ...contactProp }),
    [contactProp, resolvedUser]
  );

  const memberSince = resolvedUser
    ? getUserMemberSinceDate(resolvedUser)
    : undefined;

  return (
    <>
      <PageHeader
        title={t.contact.title}
        description={t.description}
        actions={
          <Button
            type='button'
            variant='product'
            size='control'
            onClick={() => setEditOpen(true)}
          >
            {t.contact.edit}
          </Button>
        }
      />

      <Panel aria-labelledby='contact-details-heading'>
        <PanelHeader
          id='contact-details-heading'
          title={t.contact.heading}
          description={
            memberSince ? (
              <>
                {t.contact.memberSince}{' '}
                <bdi>{formatMemberSince(memberSince, locale)}</bdi>
              </>
            ) : undefined
          }
        />
        <ContactDetails
          contact={contact}
          labels={t.contact.labels}
          notAdded={t.contact.notAdded}
          className='mt-5 border-t border-[#eef0f7] pt-5'
        />
      </Panel>

      <PersonalStatsSummary stats={stats} t={t.stats} />

      <EditPersonalInfoDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={resolvedUser}
        labels={t.editDialog}
      />
    </>
  );
}
