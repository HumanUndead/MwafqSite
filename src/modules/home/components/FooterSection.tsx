'use client';

import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/config';
import {
  SocialInstagramIcon,
  SocialLinkedInIcon,
  SocialTwitterIcon,
} from '@/shared/components/icons/home/SocialIcons';
import type { HomeFooterContent } from '../home.types';
import { CmsLink } from './CmsLink';
import {
  EmailIcon,
  getUtilityIconByKey,
  LocationIcon,
  PhoneIcon,
} from './Icons';

interface Props {
  locale: Locale;
  content: HomeFooterContent;
}

const socialLinks = [
  { label: 'Twitter', Icon: SocialTwitterIcon },
  { label: 'Instagram', Icon: SocialInstagramIcon },
  { label: 'LinkedIn', Icon: SocialLinkedInIcon },
] as const;

export function FooterSection({ locale, content }: Props) {
  return (
    <footer id='contact' className='bg-[#eeeeef] px-4 pb-7 pt-16 sm:pt-20 md:px-7'>
      <div className='mx-auto max-w-330'>
        {/* Main grid */}
        <div className='mb-8 grid gap-8 border-b border-[#1e2364]/10 pb-8 xl:mb-12.5 xl:grid-cols-[2.6fr_1fr_1fr_1.4fr] xl:gap-0 xl:pb-0'>

          {/* Brand */}
          <div className='flex flex-col'>
            <CmsLink locale={locale} href={content.brandPath} className='w-fit'>
              <Image
                src={content.brandImageSrc ?? '/demo-assets/logo.svg'}
                alt={content.brandLabel}
                width={200}
                height={200}
                className='h-16 w-auto sm:h-20'
                loading='eager'
                onError={(e) => (e.currentTarget.src = '/demo-assets/logo.svg')}
              />
            </CmsLink>
            <p className='mt-4 max-w-none text-[14.5px] font-medium leading-[1.55] text-[rgba(30,35,100,0.78)]'>
              {content.brandBody}
            </p>
            {/* Social icons — shown below brand on mobile, hidden in bottom bar */}
            <div className='mt-5 flex items-center gap-2 xl:hidden'>
              {socialLinks.map(({ label, Icon }) => (
                <a
                  key={label}
                  href='#contact'
                  aria-label={label}
                  className='flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(30,35,100,0.14)] bg-white text-[#1e2364] transition hover:bg-[#1e2364] hover:text-white'
                >
                  <Icon className='h-3.5 w-3.5' />
                </a>
              ))}
            </div>
          </div>

          {/* Pages + Help: 2-col grid on mobile, separate cols on xl */}
          <div className='grid grid-cols-2 gap-6 xl:contents'>
            <div className='flex flex-col xl:ml-37.5'>
              <h3 className='text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]'>
                {content.pages.title}
              </h3>
              <ul className='mt-5 space-y-3 text-sm text-[rgba(30,35,100,0.78)]'>
                {content.pages.links.map((link) => (
                  <li key={`${link.label}-${link.path ?? 'no-path'}`}>
                    <CmsLink
                      locale={locale}
                      href={link.path}
                      className='whitespace-nowrap transition hover:text-[#00a8f1]'
                    >
                      {link.label}
                    </CmsLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className='flex flex-col xl:ml-17.5'>
              <h3 className='text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]'>
                {content.help.title}
              </h3>
              <ul className='mt-5 space-y-3 text-sm text-[rgba(30,35,100,0.78)]'>
                {content.help.links.map((link) => (
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
          </div>

          {/* Contact + Newsletter */}
          <div className='flex flex-col'>
            <h3 className='text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]'>
              {content.contact.title}
            </h3>
            <div className='mt-5 flex flex-col gap-3 text-[14.5px] font-medium text-[rgba(30,35,100,0.78)]'>
              {content.contact.links.map((link) => (
                <CmsLink
                  key={`${link.label}-${link.path ?? 'no-path'}`}
                  locale={locale}
                  href={link.path}
                  className='flex items-center gap-2.5'
                >
                  <span className='text-[#00a8f1]'>
                    {getUtilityIconByKey(link.iconKey) ??
                      (link.iconKey === 'icon-phone' ? (
                        <PhoneIcon />
                      ) : link.iconKey === 'icon-location' ? (
                        <LocationIcon />
                      ) : (
                        <EmailIcon />
                      ))}
                  </span>
                  <span>{link.label}</span>
                </CmsLink>
              ))}
            </div>
            <p className='mt-8 text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(30,35,100,0.5)] xl:mt-auto xl:pt-6'>
              {content.newsletterEyebrow}
            </p>
            <div className='mt-3 flex w-full items-end gap-3 border-b border-[#1e2364]/20'>
              <Input
                type='email'
                placeholder={content.newsletterPlaceholder}
                className='h-9.5 flex-1 border-0 bg-transparent px-0 text-[15px] text-[#1e2364] placeholder:font-medium placeholder:text-[rgba(30,35,100,0.42)]'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label={content.newsletterAction}
                className='h-9.5 text-[22px] font-bold text-[#00a8f1] hover:translate-x-1'
              >
                →
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='flex flex-col items-center gap-3 pt-2 text-[13px] text-[rgba(30,35,100,0.55)] sm:flex-row sm:justify-between sm:pt-4'>
          <p>
            {content.copyrightLabel} {content.copyrightBody}
          </p>
          {/* Social icons on desktop only — already shown near brand on mobile */}
          <div className='hidden items-center gap-2 xl:flex'>
            {socialLinks.map(({ label, Icon }) => (
              <a
                key={label}
                href='#contact'
                aria-label={label}
                className='flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(30,35,100,0.14)] bg-white text-[#1e2364] transition hover:-translate-y-0.5 hover:bg-[#1e2364] hover:text-white'
              >
                <Icon className='h-3.5 w-3.5' />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
