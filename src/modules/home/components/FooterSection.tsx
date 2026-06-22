'use client';

import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/shared/components/ui/Button';
import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import {
  getSocialIcon,
  getSocialIconStyle,
} from '@/shared/components/icons/home/SocialIcons';
import { cn } from '@/shared/lib/cn';
import type { HomeFooterContent } from '../home.types';
import { CmsLink } from './CmsLink';
import {
  EmailIcon,
  getUtilityIconByKey,
  LocationIcon,
  PhoneIcon,
} from '@/shared/components/icons/home';

interface Props {
  locale: Locale;
  content: HomeFooterContent;
}

function ContactHeadingIcon() {
  return (
    <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00a8f1]/12'>
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-3.5 w-3.5 text-[#00a8f1]'
        aria-hidden='true'
      >
        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
      </svg>
    </span>
  );
}

function toExternalHref(path: string | null): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function ContactLink({
  link,
  locale,
  compact,
}: {
  link: HomeFooterContent['contact']['links'][number];
  locale: Locale;
  compact?: boolean;
}) {
  return (
    <CmsLink
      locale={locale}
      href={link.path}
      className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-[#1e2364]/8 text-[#00a8f1]',
          compact ? 'h-7 w-7' : 'h-8 w-8'
        )}
      >
        {getUtilityIconByKey(link.iconKey) ??
          (link.iconKey === 'icon-phone' ? (
            <PhoneIcon />
          ) : link.iconKey === 'icon-location' ? (
            <LocationIcon />
          ) : (
            <EmailIcon />
          ))}
      </span>
      <span
        dir={link.iconKey === 'icon-phone' ? 'ltr' : undefined}
        className={compact ? 'line-clamp-2 text-[12px]' : undefined}
      >
        {link.label}
      </span>
    </CmsLink>
  );
}

export function FooterSection({ locale, content }: Props) {
  const rtl = isRtl(locale);

  return (
    <footer id='contact' className='bg-[#eeeeef] px-5 pb-0 pt-0 md:px-7'>
      <div className='mx-auto max-w-330'>
        {/* ─── xl: 3-col grid | mobile: stacked ─── */}
        <div className='xl:grid xl:grid-cols-[2.6fr_1fr_1.4fr] xl:py-14'>

          {/* ── Brand ── */}
          <div className='py-8 xl:py-0 xl:pr-14'>
            <CmsLink locale={locale} href={content.brandPath} className='w-fit'>
              <Image
                src={content.brandImageSrc ?? '/demo-assets/logo.svg'}
                alt={content.brandLabel}
                width={200}
                height={200}
                className='h-14 w-auto md:h-18'
                loading='eager'
                onError={(e) =>
                  (e.currentTarget.src = '/demo-assets/logo.svg')
                }
              />
            </CmsLink>
            <p className='mt-3.5 max-w-85 text-[14.5px] leading-[1.65] text-[rgba(30,35,100,0.65)]'>
              {content.brandBody}
            </p>

            {/* Social icons — mobile only */}
            {content.socialLinks.length > 0 && (
              <div className='mt-6 flex justify-center gap-4 xl:hidden'>
                {content.socialLinks.map(({ name, path }) => {
                  const Icon = getSocialIcon(name);
                  const href = toExternalHref(path);
                  return (
                    <a
                      key={name}
                      href={href ?? '#contact'}
                      target={href ? '_blank' : undefined}
                      rel={href ? 'noopener noreferrer' : undefined}
                      aria-label={name}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110',
                        getSocialIconStyle(name)
                      )}
                    >
                      <Icon className='h-5 w-5' />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Mobile only: 2-col grid (Pages | Contact), no accordion ── */}
          <div className='xl:hidden'>
            <div className='h-px bg-[#1e2364]/10' />
            <div className='grid grid-cols-2 gap-5 py-6'>

              {/* Pages column */}
              <div>
                <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-[#1e2364]'>
                  {content.pages.title}
                </p>
                <ul className='mt-3 space-y-3 text-[13px] text-[rgba(30,35,100,0.72)]'>
                  {content.pages.links.map((link) => (
                    <li key={`${link.label}-${link.path ?? 'no-path'}`}>
                      <CmsLink
                        locale={locale}
                        href={link.path}
                        className='transition hover:text-[#00a8f1]'
                      >
                        {link.label}
                      </CmsLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact column */}
              <div>
                <div className='flex items-center gap-1.5'>
                  <ContactHeadingIcon />
                  <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-[#1e2364]'>
                    {content.contact.title}
                  </p>
                </div>
                <div className='mt-3 flex flex-col gap-3 text-[rgba(30,35,100,0.72)]'>
                  {content.contact.links.map((link) => (
                    <ContactLink
                      key={`${link.label}-${link.path ?? 'no-path'}`}
                      link={link}
                      locale={locale}
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Desktop col 2: Pages ── */}
          <div className='hidden xl:block'>
            <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-[#1e2364]'>
              {content.pages.title}
            </p>
            <ul className='mt-4 space-y-3.5 text-[14px] text-[rgba(30,35,100,0.72)]'>
              {content.pages.links.map((link) => (
                <li key={`${link.label}-${link.path ?? 'no-path'}`}>
                  <CmsLink
                    locale={locale}
                    href={link.path}
                    className='transition hover:text-[#00a8f1]'
                  >
                    {link.label}
                  </CmsLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Desktop col 3: Contact + Newsletter | Mobile: Newsletter only ── */}
          <div className='xl:py-0'>

            {/* Contact — desktop only (mobile shows in 2-col grid above) */}
            <div className='hidden xl:block'>
              <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-[#1e2364]'>
                {content.contact.title}
              </p>
              <div className='mt-4 flex flex-col gap-3.5 text-[14px] text-[rgba(30,35,100,0.72)]'>
                {content.contact.links.map((link) => (
                  <ContactLink
                    key={`${link.label}-${link.path ?? 'no-path'}`}
                    link={link}
                    locale={locale}
                  />
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className='border-t border-[#1e2364]/10 py-6 xl:mt-auto xl:border-0 xl:pt-8'>
              <p className='text-[10.5px] font-bold uppercase tracking-[0.2em] text-[rgba(30,35,100,0.5)]'>
                {content.newsletterEyebrow}
              </p>
              <div className='mt-3 flex h-12 items-center overflow-hidden rounded-full border-2 border-[#1e2364]/12 bg-white pr-1.5 xl:h-auto xl:overflow-visible xl:rounded-none xl:border-0 xl:border-b xl:border-[#1e2364]/20 xl:bg-transparent xl:pr-0'>
                <Input
                  type='email'
                  placeholder={content.newsletterPlaceholder}
                  className='h-full flex-1 border-0 bg-transparent px-4 text-[14px] text-[#1e2364] shadow-none placeholder:font-medium placeholder:text-[rgba(30,35,100,0.35)] focus-visible:ring-0 xl:px-0'
                />
                <Button
                  type='button'
                  aria-label={content.newsletterAction}
                  className={cn(
                    'h-9 shrink-0 rounded-full bg-[#1e2364] px-5 text-[13px] font-bold text-white hover:bg-[#233567] xl:h-10 xl:w-10 xl:rounded-none xl:bg-transparent xl:p-0 xl:text-[22px] xl:text-[#00a8f1] xl:hover:bg-transparent',
                    rtl ? 'xl:hover:-translate-x-1' : 'xl:hover:translate-x-1'
                  )}
                >
                  <span className={cn('inline-block', rtl && 'rotate-180')}>
                    →
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className='flex flex-col items-center gap-3 border-t border-[#1e2364]/10 py-5 text-[13px] text-[rgba(30,35,100,0.45)] xl:flex-row xl:justify-between'>
          <p>
            {content.copyrightLabel} {content.copyrightBody}
          </p>

          {/* Social icons — desktop only */}
          {content.socialLinks.length > 0 && (
            <div className='hidden items-center gap-2.5 xl:flex'>
              {content.socialLinks.map(({ name, path }) => {
                const Icon = getSocialIcon(name);
                const href = toExternalHref(path);
                return (
                  <a
                    key={name}
                    href={href ?? '#contact'}
                    target={href ? '_blank' : undefined}
                    rel={href ? 'noopener noreferrer' : undefined}
                    aria-label={name}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5',
                      getSocialIconStyle(name)
                    )}
                  >
                    <Icon className='h-4 w-4' />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
