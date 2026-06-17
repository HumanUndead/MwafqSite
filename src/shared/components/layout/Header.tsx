'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import type { HomeHeaderContent } from '@/modules/home/home.types';
import { CmsLink } from '@/modules/home/components/CmsLink';
import { hasCmsActionLabel } from '@/modules/home/lib/hasCmsActionLabel';
import { MenuHamburgerIcon } from '@/shared/components/icons/layout';
import { XMarkIcon } from '@/shared/components/icons/reservations';
import { cn } from '@/shared/lib/cn';
import Image from 'next/image';
import { HeaderUserMenu } from '@/shared/components/layout/HeaderUserMenu';

interface HeaderProps {
  locale: Locale;
  content: HomeHeaderContent;
}

export function Header({ locale, content }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
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
        {/* Logo */}
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

        {/* Desktop nav */}
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

        {/* Desktop + mobile actions */}
        <div className='flex flex-nowrap items-center gap-2'>
          {/* Desktop-only separator */}
          <div
            className='mr-1 h-5 w-px bg-[#1e2364]/15 max-[980px]:hidden'
            aria-hidden='true'
          />

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

          {/* Mobile hamburger */}
          <button
            className='hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e2364]/8 text-[#1e2364] transition-colors duration-200 hover:bg-[#1e2364] hover:text-white max-[980px]:inline-flex'
            type='button'
            aria-label='Open menu'
            aria-expanded={isMenuOpen}
            aria-controls='mobile-menu'
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuHamburgerIcon className='size-5' />
          </button>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      <div
        aria-hidden='true'
        className={cn(
          'fixed inset-0 z-300 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isMenuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile menu drawer */}
      <div
        id='mobile-menu'
        role='dialog'
        aria-modal='true'
        aria-label='Mobile navigation'
        className={cn(
          'fixed inset-y-0 z-400 flex w-[min(320px,100vw)] flex-col bg-white shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          'ltr:right-0 rtl:left-0',
          isMenuOpen
            ? 'translate-x-0'
            : 'ltr:translate-x-full rtl:-translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className='flex items-center justify-between border-b border-[#e5e7f0] px-5 py-4'>
          <CmsLink
            locale={locale}
            href={content.brandPath}
            aria-label={content.brandLabel}
            className='flex shrink-0 items-center'
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src='/demo-assets/logo.svg'
              alt={content.brandLabel}
              width={120}
              height={40}
              className='h-10 w-auto'
            />
          </CmsLink>

          <button
            type='button'
            aria-label='Close menu'
            onClick={() => setIsMenuOpen(false)}
            className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1e2364]/8 text-[#1e2364] transition-colors duration-200 hover:bg-[#1e2364] hover:text-white'
          >
            <XMarkIcon className='size-4.5' />
          </button>
        </div>

        {/* Nav links */}
        <nav
          className='flex flex-col px-4 py-3'
          aria-label='Mobile navigation links'
        >
          {content.navLinks.map((item) => (
            <CmsLink
              key={`mob-${item.label}-${item.path ?? 'no-path'}`}
              locale={locale}
              href={item.path}
              className='group rounded-xl px-3 py-3'
              onClick={() => setIsMenuOpen(false)}
            >
              <span className='text-[16px] font-bold text-[#1e2364]/80 transition-colors duration-200 ease-out group-hover:text-[#00a8f1]'>
                {item.label}
              </span>
            </CmsLink>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className='mt-auto flex flex-col gap-3 border-t border-[#e5e7f0] px-4 py-5'>
          {hasCmsActionLabel(content.businessSignInAction) ? (
            <CmsLink
              locale={locale}
              target='_blank'
              href={content.businessSignInAction.path}
              className='inline-flex h-11 w-full items-center justify-center rounded-[50px] border-2 border-[#00a8f1] px-5 text-[14px] font-semibold text-[#00a8f1] transition-[background,color] duration-200 hover:bg-[#00a8f1] hover:text-white'
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{content.businessSignInAction.label}</span>
            </CmsLink>
          ) : null}

          {hasCmsActionLabel(content.signInAction) ? (
            <CmsLink
              locale={locale}
              href={content.signInAction.path}
              className='inline-flex h-11 w-full items-center justify-center rounded-[50px] bg-[#1e2364] px-5 text-[14px] font-semibold text-white transition-[background] duration-200 hover:bg-[#233567]'
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{content.signInAction.label}</span>
            </CmsLink>
          ) : null}
        </div>
      </div>
    </>
  );
}
