/* eslint-disable @next/next/no-img-element */
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

export function FooterSection({ locale, content }: Props) {
  return (
    <footer id='contact' className='bg-[#eeeeef] px-4 pb-7 pt-[80px] md:px-7'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='mb-[50px] grid gap-[60px] border-b border-[#1e2364]/10 pb-0 xl:grid-cols-[2.6fr_1fr_1fr_1.4fr]'>
          <div className='flex flex-col'>
            <CmsLink locale={locale} href={content.brandPath} className='w-fit'>
              <Image
                src={content.brandImageSrc ?? '/demo-assets/logo.svg'}
                alt={content.brandLabel}
                width={200}
                height={200}
                className='h-20 w-auto'
                loading='eager'
                onError={(e) => (e.currentTarget.src = '/demo-assets/logo.svg')}
              />
            </CmsLink>
            <p className='mt-4 max-w-none text-[14.5px] font-medium leading-[1.55] text-[rgba(30,35,100,0.78)]'>
              {content.brandBody}
            </p>
          </div>

          <div className='ml-0 flex flex-col xl:ml-[150px]'>
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

          <div className='flex flex-col xl:ml-[70px]'>
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
            <p className='mt-auto pt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(30,35,100,0.5)]'>
              {content.newsletterEyebrow}
            </p>
            <div className='mt-3 flex w-full max-w-[360px] items-end gap-3'>
              <Input
                type='email'
                placeholder={content.newsletterPlaceholder}
                className='h-[38px] flex-1 border-0 bg-transparent px-0 text-[15px] text-[#1e2364] placeholder:font-medium placeholder:text-[rgba(30,35,100,0.42)]'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label={content.newsletterAction}
                className='h-[38px] text-[22px] font-bold text-[#00a8f1] hover:translate-x-1'
              >
                →
              </Button>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4 pt-6 text-[13px] text-[rgba(30,35,100,0.55)] sm:flex-row sm:items-center sm:justify-between'>
          <p>
            {content.copyrightLabel} {content.copyrightBody}
          </p>
          <div className='flex items-center gap-2'>
            <a
              href='#contact'
              className='flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(30,35,100,0.14)] bg-white text-[#1e2364] transition hover:-translate-y-0.5 hover:bg-[#1e2364] hover:text-white'
              aria-label='Twitter'
            >
              <SocialTwitterIcon className='h-3.5 w-3.5' />
            </a>
            <a
              href='#contact'
              className='flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(30,35,100,0.14)] bg-white text-[#1e2364] transition hover:-translate-y-0.5 hover:bg-[#1e2364] hover:text-white'
              aria-label='Instagram'
            >
              <SocialInstagramIcon className='h-3.5 w-3.5' />
            </a>
            <a
              href='#contact'
              className='flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(30,35,100,0.14)] bg-white text-[#1e2364] transition hover:-translate-y-0.5 hover:bg-[#1e2364] hover:text-white'
              aria-label='LinkedIn'
            >
              <SocialLinkedInIcon className='h-3.5 w-3.5' />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
