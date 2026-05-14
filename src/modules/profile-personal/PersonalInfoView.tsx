'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import {
  AwardMedalIcon,
  CalendarIcon,
  GraduationCapIcon,
  PencilEditIcon,
} from '@/shared/components/icons/profile';
import { cn } from '@/shared/lib/cn';
import {
  personalInfoPlaceholderContact,
  personalInfoPlaceholderStats,
  statIconWrap,
} from './constants';

export type PersonalInfoContact = {
  email: string;
  phone: string;
  city: string;
  country: string;
  mailingAddress: string;
};

export type PersonalInfoStats = {
  reservationsCount: string;
  coursesOngoingCount: string;
  coursesFinishedCount: string;
};

export type PersonalInfoViewProps = {
  contact?: Partial<PersonalInfoContact>;
  stats?: Partial<PersonalInfoStats>;
};

export function PersonalInfoView({
  contact: contactProp,
  stats: statsProp,
}: PersonalInfoViewProps) {
  const t = useTranslations('profilePersonal');
  const contact = { ...personalInfoPlaceholderContact, ...contactProp };
  const stats = { ...personalInfoPlaceholderStats, ...statsProp };

  return (
    <>
      <ScrollReveal
        id="contact-info"
        className={cn(
          'rounded-[28px] border-2 border-[#e5e7f0] bg-white px-[34px] py-8',
          'transition-[border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:border-[#e5e7f0]'
        )}
      >
        <div
          className={cn(
            'mb-[26px] flex flex-col gap-4 border-b border-[#e5e7f0] pb-[18px]',
            'sm:flex-row sm:items-end sm:justify-between sm:gap-[18px]'
          )}
        >
          <div className="min-w-0">
            <h2 className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#1e2364] [&_em]:italic [&_em]:font-normal [&_em]:text-[#1e2364] [&_em]:opacity-55">
              {t.contact.title}
            </h2>
          </div>
          <a
            href="#"
            className={cn(
              'inline-flex shrink-0 items-center gap-[7px] rounded-[30px]',
              'bg-[rgba(0,168,241,0.1)] px-[14px] py-2 text-sm font-bold text-[#00a8f1]',
              'transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'hover:bg-[#00a8f1] hover:text-white'
            )}
            data-cursor
          >
            <PencilEditIcon className="size-[14px] shrink-0" />
            {t.contact.edit}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-[22px] md:grid-cols-2">
          <div className="min-w-0">
            <div className="mb-[3px] text-sm font-bold uppercase tracking-[0.12em] text-[#6b7196]">
              {t.contact.labels.email}
            </div>
            <div className="text-[15.5px] font-semibold leading-[1.45] text-[#1e2364]">
              {contact.email}
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-[3px] text-sm font-bold uppercase tracking-[0.12em] text-[#6b7196]">
              {t.contact.labels.phone}
            </div>
            <div className="text-[15.5px] font-semibold leading-[1.45] text-[#1e2364]">
              <bdi>{contact.phone}</bdi>
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-[3px] text-sm font-bold uppercase tracking-[0.12em] text-[#6b7196]">
              {t.contact.labels.city}
            </div>
            <div className="text-[15.5px] font-semibold leading-[1.45] text-[#1e2364]">
              {contact.city}
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-[3px] text-sm font-bold uppercase tracking-[0.12em] text-[#6b7196]">
              {t.contact.labels.country}
            </div>
            <div className="text-[15.5px] font-semibold leading-[1.45] text-[#1e2364]">
              {contact.country}
            </div>
          </div>
          <div className="min-w-0 md:col-span-2">
            <div className="mb-[3px] text-sm font-bold uppercase tracking-[0.12em] text-[#6b7196]">
              {t.contact.labels.mailingAddress}
            </div>
            <div className="wrap-break-word text-[15.5px] font-semibold leading-[1.45] text-[#1e2364]">
              {contact.mailingAddress}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ScrollReveal
          transitionDelay={0.08}
          className="flex items-center gap-4 rounded-[18px] border-2 border-[#e5e7f0] bg-white p-4 md:p-5"
        >
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-full',
              statIconWrap.sky
            )}
          >
            <CalendarIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[28px] font-extrabold leading-none tracking-[-0.5px] text-[#1e2364]">
              {stats.reservationsCount}
            </div>
            <div className="mt-1.5">
              <div className="text-[15px] font-semibold text-[#1e2364]">
                {t.stats.reservations.title}
              </div>
              <div className="text-[12.5px] font-medium text-[#6b7196]">
                {t.stats.reservations.subtitle}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          transitionDelay={0.16}
          className="flex items-center gap-4 rounded-[18px] border-2 border-[#e5e7f0] bg-white p-4 md:p-5"
        >
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-full',
              statIconWrap.mint
            )}
          >
            <GraduationCapIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[28px] font-extrabold leading-none tracking-[-0.5px] text-[#1e2364]">
              {stats.coursesOngoingCount}
            </div>
            <div className="mt-1.5">
              <div className="text-[15px] font-semibold text-[#1e2364]">
                {t.stats.coursesOngoing.title}
              </div>
              <div className="text-[12.5px] font-medium text-[#6b7196]">
                {t.stats.coursesOngoing.subtitle}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          transitionDelay={0.24}
          className="flex items-center gap-4 rounded-[18px] border-2 border-[#e5e7f0] bg-white p-4 md:p-5"
        >
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-full',
              statIconWrap.purple
            )}
          >
            <AwardMedalIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[28px] font-extrabold leading-none tracking-[-0.5px] text-[#1e2364]">
              {stats.coursesFinishedCount}
            </div>
            <div className="mt-1.5">
              <div className="text-[15px] font-semibold text-[#1e2364]">
                {t.stats.coursesFinished.title}
              </div>
              <div className="text-[12.5px] font-medium text-[#6b7196]">
                {t.stats.coursesFinished.subtitle}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
