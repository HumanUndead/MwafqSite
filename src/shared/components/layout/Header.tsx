'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import type { HomeHeaderContent } from '@/modules/home/home.types';
import { CmsLink } from '@/modules/home/components/CmsLink';
import { hasCmsActionLabel } from '@/modules/home/lib/hasCmsActionLabel';
import { MenuHamburgerIcon, SunIcon } from '@/shared/components/icons/layout';
import { cn } from '@/shared/lib/cn';
import Image from 'next/image';
import { HeaderUserMenu } from '@/shared/components/layout/HeaderUserMenu';
interface HeaderProps {
  locale: Locale;
  content: HomeHeaderContent;
}

export function Header({ locale, content }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed left-1/2 top-4 z-200 flex w-[calc(100%-40px)] max-w-350 -translate-x-1/2 items-center justify-between rounded-[80px] border-2 border-transparent py-2.5 pl-5 pr-3',
        'transition-[background,border-color,backdrop-filter] duration-250 ease-in-out',
        'max-[980px]:w-[calc(100%-24px)] max-[980px]:pl-4 max-[980px]:pr-2.5',
        'max-[560px]:top-2.5 max-[560px]:w-[calc(100%-16px)] max-[560px]:pl-3.5 max-[560px]:pr-2',
        isScrolled &&
          'border-white/70 bg-white/62 backdrop-blur-md backdrop-saturate-150'
      )}
    >
      <CmsLink
        locale={locale}
        href={content.brandPath}
        className='flex shrink-0 items-center'
        aria-label={content.brandLabel}
      >
        <Image
          src={'/demo-assets/logo.svg'}
          alt={content.brandLabel}
          width={200}
          height={200}
          className={cn(
            'block w-auto transition-[height] duration-250 ease-in-out',
            isScrolled
              ? 'h-12 max-[980px]:h-11 max-[560px]:h-10'
              : 'h-16 max-[980px]:h-14 max-[560px]:h-12'
          )}
          loading='eager'
        />
      </CmsLink>

      <nav
        className='flex items-center max-[980px]:hidden'
        aria-label='Main navigation'
      >
        {content.navLinks.map((item) => (
          <CmsLink
            key={`${item.label}-${item.path ?? 'no-path'}`}
            locale={locale}
            href={item.path}
            className='group inline-block whitespace-nowrap px-3.5 py-2.5'
          >
            <span className='inline-block origin-center text-[17px] font-bold text-[#1e2364]/80 transition-colors duration-200 ease-out group-hover:text-[#00a8f1]'>
              {item.label}
            </span>
          </CmsLink>
        ))}
      </nav>

      <div className='flex flex-nowrap items-center gap-2'>
        {/* Separator */}
        <div
          className='mr-1 h-5 w-px bg-[#1e2364]/15 max-[980px]:hidden'
          aria-hidden='true'
        />

        {/* <button
          className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1e2364]/60 transition-colors duration-200 hover:bg-[#1e2364]/8 hover:text-[#1e2364] max-[980px]:hidden'
          type='button'
          aria-label='Toggle dark mode'
        >
          <SunIcon className='size-4.5' />
        </button> */}

        <div title={content.localeSwitchLabel ?? undefined}>
          <LanguageSwitcher />
        </div>

        {content.userMenu ? (
          <HeaderUserMenu locale={locale} menu={content.userMenu} />
        ) : null}

        {hasCmsActionLabel(content.businessSignInAction) ? (
          <CmsLink
            locale={locale}
            target='_blank'
            href={content.businessSignInAction.path}
            className='inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[50px] border-2 border-[#00a8f1] px-5 text-[14px] font-semibold text-[#00a8f1] transition-[background,color] duration-200 hover:bg-[#00a8f1] hover:text-white max-[980px]:hidden'
          >
            <span>{content.businessSignInAction.label}</span>
          </CmsLink>
        ) : null}

        {hasCmsActionLabel(content.signInAction) ? (
          <CmsLink
            locale={locale}
            href={content.signInAction.path}
            className='inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[50px] bg-[#1e2364] px-5 max-[560px]:px-4 text-[14px] max-[560px]:text-[13px] font-semibold text-white transition-[background] duration-200 hover:bg-[#233567]'
          >
            <span>{content.signInAction.label}</span>
          </CmsLink>
        ) : null}

        <button
          className='hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e2364]/8 text-[#1e2364] transition-colors duration-200 hover:bg-[#1e2364] hover:text-white max-[980px]:inline-flex'
          type='button'
          aria-label='Open menu'
        >
          <MenuHamburgerIcon className='size-5' />
        </button>
      </div>
    </header>
  );
}
