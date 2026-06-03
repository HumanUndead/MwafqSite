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
        'fixed left-1/2 top-4.5 z-200 flex w-[calc(100%-40px)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-[80px] border-2 border-transparent py-2 pl-5.5 pr-3.5',
        'transition-[background,border-color,backdrop-filter] duration-250 ease-in-out',
        'max-[980px]:w-[calc(100%-24px)] max-[980px]:pl-4 max-[980px]:pr-2.5',
        'max-[560px]:top-2.5 max-[560px]:w-[calc(100%-16px)] max-[560px]:pl-3 max-[560px]:pr-2',
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
              ? 'h-14 max-[980px]:h-13 max-[560px]:h-11.5'
              : 'h-22 max-[980px]:h-16 max-[560px]:h-13'
          )}
          loading='eager'
        />
      </CmsLink>

      <nav
        className='flex items-center gap-1 max-[980px]:hidden'
        aria-label='Main navigation'
      >
        {content.navLinks.map((item) => (
          <CmsLink
            key={`${item.label}-${item.path ?? 'no-path'}`}
            locale={locale}
            href={item.path}
            className='group inline-block whitespace-nowrap px-4 py-2.5'
          >
            <span className='inline-block origin-center scale-[0.909] text-[17.6px] font-bold text-[#1e2364] transition-[transform,color] duration-280 ease-out group-hover:scale-100 group-hover:text-[#00a8f1] backface-hidden will-change-transform'>
              {item.label}
            </span>
          </CmsLink>
        ))}
      </nav>

      <div className='flex flex-nowrap items-center gap-2.5'>
        <button
          className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#1e2364] transition-[background,color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1e2364] hover:text-[#f2f2f2] max-[980px]:hidden'
          type='button'
          aria-label='Toggle dark mode'
        >
          <SunIcon className='size-[18px]' />
        </button>

        <div title={content.localeSwitchLabel ?? undefined}>
          <LanguageSwitcher
            className='flex gap-1 rounded-[30px] border-0 bg-[#f2f2f2] p-1.5'
            optionClassName='min-w-12 max-[560px]:min-w-[42px] rounded-full min-h-10 max-[560px]:min-h-9 px-4 max-[560px]:px-3 text-[13.5px] max-[560px]:text-xs font-semibold'
            activeOptionClassName='bg-[#1e2364] text-[#f2f2f2]'
            inactiveOptionClassName='text-[#1e2364] hover:bg-[rgba(30,35,100,0.12)]'
          />
        </div>

        {content.userMenu ? (
          <HeaderUserMenu locale={locale} menu={content.userMenu} />
        ) : null}

        {hasCmsActionLabel(content.signInAction) ? (
          <CmsLink
            locale={locale}
            href={content.signInAction.path}
            className='inline-flex h-10 shrink-0 max-[560px]:h-9 items-center justify-center whitespace-nowrap rounded-[50px] bg-[#1e2364] px-[18px] max-[560px]:px-3.5 text-[14.5px] max-[560px]:text-xs font-semibold text-white transition-[background,color] duration-280 ease-out hover:bg-[#233567]'
          >
            <span>{content.signInAction.label}</span>
          </CmsLink>
        ) : null}

        <button
          className='hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#1e2364] transition-[background,color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1e2364] hover:text-[#f2f2f2] max-[980px]:inline-flex'
          type='button'
          aria-label='Open menu'
        >
          <MenuHamburgerIcon className='size-5' />
        </button>
      </div>
    </header>
  );
}
