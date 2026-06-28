'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/modules/auth/store/authStore';
import type { User } from '@/shared/types/user.types';
import { getUserMemberSinceDate } from '@/shared/lib/user';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { Button } from '@/shared/components/ui/Button';
import {
  AwardMedalIcon,
  CalendarIcon,
  GraduationCapIcon,
  PencilEditIcon,
} from '@/shared/components/icons/profile';
import { cn } from '@/shared/lib/cn';
import { personalInfoPlaceholderContact, statIconWrap } from './constants';
import type { PersonalInfoStats } from '@/modules/profile-personal/personalStats.shared';
import { EditPersonalInfoDialog } from './components/EditPersonalInfoDialog';

function contactFromUser(user: User | null): Partial<PersonalInfoContact> {
  if (!user) {
    return {};
  }

  const next: Partial<PersonalInfoContact> = {};
  const email = user.email?.trim();
  const phone = user.phoneNo?.trim() || user.userName?.trim();
  const city = user.cityName?.trim();
  const country = user.countryName?.trim();
  const mailingAddress = user.address?.trim();

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

const contactFieldLabelClass =
  'mb-1 text-[13px] font-semibold text-[#6b7196] md:mb-[3px] md:text-sm md:font-bold md:uppercase md:tracking-[0.12em]';

const contactFieldValueClass =
  'text-[15px] font-semibold leading-[1.45] text-[#1e2364] md:text-[15.5px]';

function ContactField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-w-0 border-b border-[#e5e7f0] py-3.5 last:border-b-0 last:pb-0 first:pt-0',
        'max-[640px]:py-4',
        'md:border-b-0 md:py-0',
        className
      )}
    >
      <div className={contactFieldLabelClass}>{label}</div>
      <div className={contactFieldValueClass}>{children}</div>
    </div>
  );
}

type StatItemProps = {
  count: string;
  title: string;
  subtitle: string;
  icon: typeof CalendarIcon;
  iconWrap: string;
  transitionDelay: number;
};

function StatCard({
  count,
  title,
  subtitle,
  icon: Icon,
  iconWrap,
  transitionDelay,
}: StatItemProps) {
  return (
    <ScrollReveal
      transitionDelay={transitionDelay}
      className='flex items-center gap-4 rounded-[18px] border-2 border-[#e5e7f0] bg-white p-4 shadow-sm md:p-5'
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full md:size-12',
          iconWrap
        )}
      >
        <Icon className='size-5' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-[26px] font-extrabold leading-none tracking-[-0.5px] text-[#1e2364] md:text-[28px]'>
          {count}
        </div>
        <div className='mt-1.5'>
          <div className='text-[14px] font-semibold text-[#1e2364] md:text-[15px]'>
            {title}
          </div>
          <div className='mt-0.5 text-[12px] font-medium text-[#6b7196] md:text-[12.5px]'>
            {subtitle}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export type PersonalInfoContact = {
  email: string;
  phone: string;
  city: string;
  country: string;
  mailingAddress: string;
};

export type { PersonalInfoStats };

export type PersonalInfoViewProps = {
  /** User from session cookie (RSC). Client store wins after rehydrate. */
  sessionUser?: User | null;
  contact?: Partial<PersonalInfoContact>;
  stats?: Partial<PersonalInfoStats>;
};

export function PersonalInfoView({
  sessionUser = null,
  contact: contactProp,
  stats: statsProp,
}: PersonalInfoViewProps) {
  const t = useTranslations('profilePersonal');
  const locale = useLocale();
  const storeUser = useAuthStore((s) => s.user);
  const resolvedUser = storeUser ?? sessionUser ?? null;
  const [editOpen, setEditOpen] = useState(false);

  const contact = useMemo(
    () => ({
      ...personalInfoPlaceholderContact,
      ...contactFromUser(resolvedUser),
      ...contactProp,
    }),
    [contactProp, resolvedUser]
  );

  const stats = useMemo(
    () => ({
      reservationsCount: statsProp?.reservationsCount ?? '0',
      coursesOngoingCount: statsProp?.coursesOngoingCount ?? '0',
      coursesFinishedCount: statsProp?.coursesFinishedCount ?? '0',
    }),
    [statsProp]
  );

  const memberSince = resolvedUser
    ? getUserMemberSinceDate(resolvedUser)
    : undefined;
  const memberSinceLabel =
    memberSince && memberSince !== ''
      ? `${t.contact.memberSince} ${formatMemberSince(memberSince, locale)}`
      : null;

  return (
    <section className='relative min-w-0 pb-4 max-[640px]:pb-20'>
      <ScrollReveal
        id='contact-info'
        className={cn(
          'rounded-[22px] border-2 border-[#e5e7f0] bg-white px-6 py-6 shadow-sm',
          'transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:border-[#e5e7f0] hover:shadow-md',
          'md:rounded-[28px] md:px-[34px] md:py-8'
        )}
      >
        <div
          className={cn(
            'mb-5 flex flex-col gap-4 border-b border-[#e5e7f0] pb-5',
            'max-[480px]:gap-3',
            'md:mb-[26px] md:flex-row md:items-end md:justify-between md:gap-[18px] md:pb-[18px]'
          )}
        >
          <div className='min-w-0 flex-1'>
            <h2 className='text-[20px] font-extrabold leading-[1.2] tracking-[-0.4px] text-[#1e2364] md:text-[22px] md:tracking-[-0.5px] [&_em]:font-normal [&_em]:italic [&_em]:text-[#1e2364] [&_em]:opacity-55'>
              {t.contact.title}
            </h2>
            {resolvedUser?.name ? (
              <p className='mt-1.5 hidden text-[15px] font-semibold leading-snug text-[#1e2364] min-[1101px]:block'>
                {resolvedUser.name}
              </p>
            ) : null}
            {memberSinceLabel ? (
              <p className='mt-2'>
                <span className='inline-flex items-center rounded-full bg-[#f3f4f8] px-3 py-1 text-[12px] font-semibold text-[#6b7196]'>
                  {memberSinceLabel}
                </span>
              </p>
            ) : null}
          </div>
          <Button
            type='button'
            onClick={() => setEditOpen(true)}
            shape='pill'
            className={cn(
              'h-auto w-full gap-2 rounded-[30px] border-0 px-4 py-2.5 text-sm font-bold shadow-none',
              'bg-[rgba(0,168,241,0.1)] text-[#00a8f1]',
              'transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'hover:bg-[#00a8f1] hover:text-white',
              'md:w-auto md:shrink-0 md:px-[14px] md:py-2'
            )}
            data-cursor
          >
            <PencilEditIcon className='size-[14px] shrink-0' />
            {t.contact.edit}
          </Button>

          <EditPersonalInfoDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            user={resolvedUser}
            labels={t.editDialog}
          />
        </div>

        <div
          className={cn(
            'flex flex-col',
            'md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-[22px]'
          )}
        >
          <ContactField label={t.contact.labels.email}>
            {contact.email}
          </ContactField>
          <ContactField label={t.contact.labels.phone}>
            <bdi>{contact.phone}</bdi>
          </ContactField>
          <div className='grid grid-cols-2 gap-x-5 border-b border-[#e5e7f0] py-4 md:contents'>
            <ContactField
              label={t.contact.labels.city}
              className='border-b-0 py-0'
            >
              {contact.city}
            </ContactField>
            <ContactField
              label={t.contact.labels.country}
              className='border-b-0 py-0'
            >
              {contact.country}
            </ContactField>
          </div>
          <ContactField
            label={t.contact.labels.mailingAddress}
            className='md:col-span-2'
          >
            <span className='wrap-break-word'>{contact.mailingAddress}</span>
          </ContactField>
        </div>
      </ScrollReveal>

      <ScrollReveal
        transitionDelay={0.06}
        className='mb-3.5 mt-6 md:mb-4 md:mt-8'
      >
        <h3 className='text-[17px] font-extrabold tracking-[-0.3px] text-[#1e2364] md:text-lg'>
          {t.stats.heading}
        </h3>
      </ScrollReveal>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4'>
        <StatCard
          count={stats.reservationsCount}
          title={t.stats.reservations.title}
          subtitle={t.stats.reservations.subtitle}
          icon={CalendarIcon}
          iconWrap={statIconWrap.sky}
          transitionDelay={0.08}
        />
        <StatCard
          count={stats.coursesOngoingCount}
          title={t.stats.coursesOngoing.title}
          subtitle={t.stats.coursesOngoing.subtitle}
          icon={GraduationCapIcon}
          iconWrap={statIconWrap.mint}
          transitionDelay={0.16}
        />
        <StatCard
          count={stats.coursesFinishedCount}
          title={t.stats.coursesFinished.title}
          subtitle={t.stats.coursesFinished.subtitle}
          icon={AwardMedalIcon}
          iconWrap={statIconWrap.purple}
          transitionDelay={0.24}
        />
      </div>
    </section>
  );
}
