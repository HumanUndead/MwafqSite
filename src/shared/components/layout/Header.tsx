'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveCmsHref } from '@/modules/home/cmsHref';
import type { Locale } from '@/i18n/config';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import type { HomeHeaderContent } from '@/modules/home/home.types';
import { CmsLink } from '@/modules/home/components/CmsLink';
import { MenuHamburgerIcon } from '@/shared/components/icons/layout';
import { XMarkIcon } from '@/shared/components/icons/reservations';
import { cn } from '@/shared/lib/cn';
import {
  marketingHeaderButtonClass,
  marketingHeaderMaxWidthClass,
  marketingHeaderNavLinkClass,
} from '@/shared/components/marketing/marketingLayout';
import Image from 'next/image';
import { HeaderUserMenu } from '@/shared/components/layout/HeaderUserMenu';
import { useHeaderVisibilityStore } from '@/shared/store/headerVisibilityStore';
import { ROUTES } from '@/shared/constants/routes';
import { useActiveSection } from '@/shared/hooks/useActiveSection';
import { scrollToSectionIdWithRetries } from '@/shared/lib/scrollToSection';
import { useDeveloperMode } from '@/shared/hooks/useDeveloperMode';
import { getLocalizedRoute } from '@/i18n/routing';
import { DEV_MODE_PARAM, DEV_MODE_VALUE } from '@/shared/lib/devMode';
import Link from 'next/link';

// Sentinel token for a plain (hash-less) nav link that points at the current
// page root — lets it take part in the scroll-spy as the neutral "top" anchor.
const ROOT_ANCHOR = 'root';
const BUSINESS_LOGIN_URL = 'https://www.business.mwafq.com/auth';

interface HeaderProps {
  locale: Locale;
  content: HomeHeaderContent;
}

export function Header({ locale, content }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuPathname, setMobileMenuPathname] = useState(pathname);
  const headerHidden = useHeaderVisibilityStore((s) => s.hidden);
  const developerMode = useDeveloperMode();
  // Keep the flag on the link so the login page shows the developer-only form.
  const developerLoginHref = `${getLocalizedRoute(locale, ROUTES.LOGIN)}?${DEV_MODE_PARAM}=${DEV_MODE_VALUE}`;

  if (pathname !== mobileMenuPathname) {
    setMobileMenuPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  const currentPath = pathname.replace(/\/$/, '') || '/';

  // About page opens with a full-screen video hero; show the header's frosted
  // "glow" background by default there so the navbar stays legible over the
  // video without needing to scroll.
  const pathWithoutLocale = currentPath.replace(/^\/[^/]+/, '') || '/';
  const isVideoHeroPage = pathWithoutLocale === ROUTES.ABOUT;

  // Resolve each nav link into its scroll-spy token (null = links off this page).
  // Hash links keep their hash; a plain same-page link gets the ROOT_ANCHOR
  // sentinel so it can be the neutral "top" anchor.
  const navTokens = useMemo(
    () =>
      content.navLinks.map((item) => {
        const resolved = resolveCmsHref(locale, item.path);
        if (!resolved) return null;
        const [rawBase, hash] = resolved.split('#');
        const base = rawBase.replace(/\/$/, '') || '/';
        const samePage =
          currentPath === base ||
          (base.length > 3 && currentPath.startsWith(base + '/'));
        if (!samePage) return null;
        return hash ? hash : ROOT_ANCHOR;
      }),
    [content.navLinks, locale, currentPath]
  );

  const sectionIds = useMemo(
    () => navTokens.filter((t): t is string => t !== null),
    [navTokens]
  );

  const activeSection = useActiveSection(sectionIds);

  function isNavLinkActive(token: string | null): boolean {
    if (token === null) return false;
    return token === activeSection;
  }

  function handleInPageHashNav(
    event: MouseEvent<HTMLAnchorElement>,
    href: string | null | undefined,
    onAfterNavigate?: () => void
  ) {
    const resolved = resolveCmsHref(locale, href);
    if (!resolved) return;

    const [rawBase, hash] = resolved.split('#');
    if (!hash) return;

    const base = rawBase.replace(/\/$/, '') || '/';
    const samePage =
      currentPath === base ||
      (base.length > 3 && currentPath.startsWith(`${base}/`));
    if (!samePage) return;

    event.preventDefault();
    window.history.pushState(null, '', resolved);
    onAfterNavigate?.();
    scrollToSectionIdWithRetries(decodeURIComponent(hash));
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          'fixed left-1/2 top-4 z-200 flex w-[calc(100%-40px)] -translate-x-1/2 items-center justify-between rounded-[80px] border-2 border-transparent py-2.5 px-5 min-[1920px]:py-3.5 min-[1920px]:px-7 min-[2560px]:py-4 min-[2560px]:px-9',
          marketingHeaderMaxWidthClass,
          'transition-[background,border-color,backdrop-filter,transform,opacity] duration-300 ease-in-out',
          'max-[1100px]:w-[calc(100%-24px)] max-[1100px]:px-4',
          'max-[560px]:top-2.5 max-[560px]:w-[calc(100%-16px)] max-[560px]:px-3.5',
          (isScrolled || isVideoHeroPage) &&
            'border-white/70 bg-white/62 backdrop-blur-md backdrop-saturate-150',
          headerHidden && 'pointer-events-none translate-y-[-160%] opacity-0'
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
                ? 'h-11 max-[1100px]:h-10 max-[560px]:h-9 min-[1920px]:h-12 min-[2560px]:h-14'
                : 'h-14 max-[1100px]:h-12 max-[560px]:h-11 min-[1920px]:h-17 min-[2560px]:h-20'
            )}
            loading='eager'
          />
        </CmsLink>

        <nav
          className='flex items-center max-[1100px]:hidden'
          aria-label='Main navigation'
        >
          {content.navLinks.map((item, index) => {
            const active = isNavLinkActive(navTokens[index]);
            return (
              <CmsLink
                key={`${item.label}-${item.path ?? 'no-path'}`}
                locale={locale}
                href={item.path}
                className='group relative inline-block whitespace-nowrap px-3.5 py-2.5 min-[1920px]:px-4 min-[1920px]:py-3 min-[2560px]:px-5'
                onClick={(event) => handleInPageHashNav(event, item.path)}
              >
                <span
                  className={cn(
                    cn(
                      'inline-block origin-center font-bold transition-colors duration-200 ease-out',
                      marketingHeaderNavLinkClass
                    ),
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
            className='mr-1 h-5 w-px bg-[#1e2364]/15 max-[1100px]:hidden'
            aria-hidden='true'
          />

          {/* <button
          className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1e2364]/60 transition-colors duration-200 hover:bg-[#1e2364]/8 hover:text-[#1e2364] max-[1100px]:hidden'
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

          {developerMode && !content.userMenu ? (
            <Link
              href={developerLoginHref}
              className={cn(
                'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[50px] border border-[#1e2364] font-semibold text-[#1e2364] transition-colors duration-200 hover:bg-[#1e2364] hover:text-white max-[1100px]:hidden',
                marketingHeaderButtonClass
              )}
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
          ) : null}

          <CmsLink
            locale={locale}
            href={BUSINESS_LOGIN_URL}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[50px] bg-[#1e2364] font-semibold text-white transition-[background] duration-200 hover:bg-[#233567] max-[1100px]:hidden',
              marketingHeaderButtonClass
            )}
          >
            <span>
              {locale === 'ar' ? 'تسجيل الدخول للأعمال' : 'Business sign in'}
            </span>
          </CmsLink>

          <button
            className='hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e2364]/8 text-[#1e2364] transition-colors duration-200 hover:bg-[#1e2364] hover:text-white max-[1100px]:inline-flex'
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
              className='fixed inset-0 z-150 bg-black/30'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              key='mobile-menu'
              className='fixed inset-x-0 top-0 z-160 rounded-b-[32px] bg-white px-5 pb-8 pt-24 shadow-2xl max-[560px]:pt-20'
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 38 }}
            >
              <nav
                className='flex flex-col gap-1'
                aria-label='Mobile navigation'
              >
                {content.navLinks.map((item, index) => {
                  const active = isNavLinkActive(navTokens[index]);
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
                      onClick={(event) =>
                        handleInPageHashNav(event, item.path, () =>
                          setIsMobileMenuOpen(false)
                        )
                      }
                    >
                      {item.label}
                    </CmsLink>
                  );
                })}
              </nav>

              {developerMode && !content.userMenu && (
                <div className='mt-5 flex flex-col gap-3 border-t border-[#1e2364]/10 pt-5'>
                  <Link
                    href={developerLoginHref}
                    className='flex h-11 items-center justify-center rounded-[50px] border border-[#1e2364] text-[15px] font-semibold text-[#1e2364] transition-colors duration-200 hover:bg-[#1e2364] hover:text-white'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
                  </Link>
                </div>
              )}

              <div className='mt-5 flex flex-col gap-3 border-t border-[#1e2364]/10 pt-5'>
                <CmsLink
                  locale={locale}
                  href={BUSINESS_LOGIN_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex h-11 items-center justify-center rounded-[50px] bg-[#1e2364] text-[15px] font-semibold text-white transition-[background] duration-200 hover:bg-[#233567]'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {locale === 'ar'
                    ? 'تسجيل الدخول للأعمال'
                    : 'Business sign in'}
                </CmsLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
