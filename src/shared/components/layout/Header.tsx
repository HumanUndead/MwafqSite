'use client'

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { ROUTES } from '@/shared/constants/routes'

export function Header() {
  const locale = useLocale()
  const home = useTranslations('home')
  const navTranslation = useTranslations('navigation')
  const [isScrolled, setIsScrolled] = useState(false)
  const homeHref = getLocalizedRoute(locale, ROUTES.HOME)
  const navLabels = [
    { href: '#home', label: home.nav.home },
    { href: '#app', label: home.nav.app },
    { href: '#contact', label: home.nav.contact },
    { href: '#about', label: home.nav.about },
    { href: '#b2b', label: home.nav.businesses },
  ]

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed left-1/2 top-[18px] z-[200] flex w-[calc(100%-40px)] max-w-[1280px] -translate-x-1/2 items-center justify-between rounded-[80px] border-2 border-transparent py-2 pl-[22px] pr-[14px]',
        'transition-[background,border-color,backdrop-filter] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        'max-[980px]:w-[calc(100%-24px)] max-[980px]:pl-4 max-[980px]:pr-[10px]',
        'max-[560px]:top-[10px] max-[560px]:w-[calc(100%-16px)] max-[560px]:pl-3 max-[560px]:pr-2',
        isScrolled && 'border-white/70 bg-white/[0.62] backdrop-blur-[12px] backdrop-saturate-150'
      )}
    >
      <Link href={`${homeHref}#home`} className="flex flex-shrink-0 items-center" aria-label="Mwafq home">
        <img
          src="/demo-assets/logo.svg"
          alt="Mwafq"
          className={cn(
            'block w-auto transition-[height] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            isScrolled
              ? 'h-14 max-[980px]:h-[52px] max-[560px]:h-[46px]'
              : 'h-[88px] max-[980px]:h-16 max-[560px]:h-[52px]'
          )}
        />
      </Link>

      <nav className="flex items-center gap-1 max-[980px]:hidden" aria-label="Main navigation">
        {navLabels.map(item => (
          <Link key={item.href} href={`${homeHref}${item.href}`} className="group inline-block px-4 py-2.5">
            <span className="inline-block origin-center scale-[0.909] text-[17.6px] font-bold text-[#1e2364] transition-[transform,color] duration-[280ms] ease-out group-hover:scale-100 group-hover:text-[#00a8f1] [backface-visibility:hidden] [will-change:transform]">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <button
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#1e2364] transition-[background,color] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1e2364] hover:text-[#f2f2f2] max-[980px]:hidden"
          type="button"
          aria-label="Toggle dark mode"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </button>

        <LanguageSwitcher
          className="flex gap-1 rounded-[30px] border-0 bg-[#f2f2f2] p-1.5"
          optionClassName="min-w-12 max-[560px]:min-w-[42px] rounded-full min-h-10 max-[560px]:min-h-9 px-4 max-[560px]:px-3 text-[13.5px] max-[560px]:text-xs font-semibold"
          activeOptionClassName="bg-[#1e2364] text-[#f2f2f2]"
          inactiveOptionClassName="text-[#1e2364] hover:bg-[rgba(30,35,100,0.12)]"
        />

        <Link
          href={getLocalizedRoute(locale, ROUTES.LOGIN)}
          className="inline-flex h-10 max-[560px]:h-9 items-center justify-center rounded-[50px] bg-[#1e2364] px-[22px] max-[560px]:px-3.5 text-[14.5px] max-[560px]:text-xs font-semibold text-white transition-[background] duration-[350ms] ease-[cubic-bezier(0.59,0.06,0.1,1)] hover:bg-[#233567]"
        >
          <span>{navTranslation.signIn}</span>
        </Link>

        <button
          className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#1e2364] transition-[background,color] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1e2364] hover:text-[#f2f2f2] max-[980px]:inline-flex"
          type="button"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  )
}
