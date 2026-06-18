'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveCmsHref } from '@/modules/home/cmsHref';
import type { Locale } from '@/i18n/config';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import type { HomeHeaderContent } from '@/modules/home/home.types';
import { CmsLink } from '@/modules/home/components/CmsLink';
import { hasCmsActionLabel } from '@/modules/home/lib/hasCmsActionLabel';
import { MenuHamburgerIcon, SunIcon } from '@/shared/components/icons/layout';
import { XMarkIcon } from '@/shared/components/icons/reservations';
import { cn } from '@/shared/lib/cn';
import Image from 'next/image';
import { HeaderUserMenu } from '@/shared/components/layout/HeaderUserMenu';
interface HeaderProps {
  locale: Locale;
  content: HomeHeaderContent;
}

export function Header({ locale, content }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function isNavLinkActive(href: string | null | undefined): boolean {
    const resolved = resolveCmsHref(locale, href);
    if (!resolved) return false;
    const target = resolved.split('#')[0].replace(/\/$/, '') || '/';
    const current = pathname.replace(/\/$/, '') || '/';
    return current === target || (target.length > 3 && current.startsWith(target + '/'));
  }
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
    <header
      className={cn(
        'fixed left-1/2 top-4 z-200 flex w-[calc(100%-40px)] max-w-350 -translate-x-1/2 items-center justify-between rounded-[80px] border-2 border-transparent py-2.5 px-5',
        'transition-[background,border-color,backdrop-filter] duration-250 ease-in-out',
        'max-[980px]:w-[calc(100%-24px)] max-[980px]:px-4',
        'max-[560px]:top-2.5 max-[560px]:w-[calc(100%-16px)] max-[560px]:px-3.5',
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
              ? 'h-11 max-[980px]:h-10 max-[560px]:h-9'
              : 'h-14 max-[980px]:h-12 max-[560px]:h-11'
          )}
          loading='eager'
        />
      </CmsLink>

      <nav
        className='flex items-center max-[980px]:hidden'
        aria-label='Main navigation'
      >
        {content.navLinks.map((item) => {
          const active = isNavLinkActive(item.path);
          return (
            <CmsLink
              key={`${item.label}-${item.path ?? 'no-path'}`}
              locale={locale}
              href={item.path}
              className='group relative inline-block whitespace-nowrap px-3.5 py-2.5'
            >
              <span
                className={cn(
                  'inline-block origin-center text-[17px] font-bold transition-colors duration-200 ease-out',
                  active
                    ? 'text-[#00a8f1]'
                    : 'text-[#1e2364]/80 group-hover:text-[#00a8f1]'
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className='absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#00a8f1]' />
              )}
            </CmsLink>
          );
        })}
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
            className='inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[50px] bg-[#1e2364] px-5 text-[14px] font-semibold text-white transition-[background] duration-200 hover:bg-[#233567] max-[980px]:hidden'
          >
            <span>{content.signInAction.label}</span>
          </CmsLink>
        ) : null}

        <button
          className='hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e2364]/8 text-[#1e2364] transition-colors duration-200 hover:bg-[#1e2364] hover:text-white max-[980px]:inline-flex'
          type='button'
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className='size-5' />
          ) : (
            <MenuHamburgerIcon className='size-5' />
          )}
        </button>
      </div>
    </header>

    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            key='mobile-backdrop'
            className='fixed inset-0 z-[150] bg-black/30'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <motion.div
            key='mobile-menu'
            className='fixed inset-x-0 top-0 z-[160] rounded-b-[32px] bg-white px-5 pb-8 pt-24 shadow-2xl max-[560px]:pt-20'
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 38 }}
          >
            <nav className='flex flex-col gap-1' aria-label='Mobile navigation'>
              {content.navLinks.map((item) => {
                const active = isNavLinkActive(item.path);
                return (
                  <CmsLink
                    key={`mobile-${item.label}-${item.path ?? 'no-path'}`}
                    locale={locale}
                    href={item.path}
                    className={cn(
                      'flex items-center rounded-xl px-4 py-3 text-[17px] font-bold transition-colors duration-200',
                      active
                        ? 'bg-[#00a8f1]/10 text-[#00a8f1]'
                        : 'text-[#1e2364]/80 hover:bg-[#1e2364]/6 hover:text-[#1e2364]'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </CmsLink>
                );
              })}
            </nav>

            {hasCmsActionLabel(content.businessSignInAction) && (
              <div className='mt-5 flex flex-col gap-3 border-t border-[#1e2364]/10 pt-5'>
                <CmsLink
                  locale={locale}
                  target='_blank'
                  href={content.businessSignInAction.path}
                  className='flex h-11 items-center justify-center rounded-[50px] border-2 border-[#00a8f1] text-[15px] font-semibold text-[#00a8f1] transition-[background,color] duration-200 hover:bg-[#00a8f1] hover:text-white'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {content.businessSignInAction.label}
                </CmsLink>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
