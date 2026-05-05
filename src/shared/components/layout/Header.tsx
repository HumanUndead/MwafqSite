'use client'

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { ROUTES } from '@/shared/constants/routes'
import styles from './Header.module.css'

export function Header() {
  const locale = useLocale()
  const home = useTranslations('home')
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
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <Link href={`${homeHref}#home`} className={styles.logo} aria-label="Mwafq home">
        <img src="/demo-assets/logo.svg" alt="Mwafq" className={styles.logoImage} />
      </Link>

      <nav className={styles.navLinks} aria-label="Main navigation">
        {navLabels.map(item => (
          <Link key={item.href} href={`${homeHref}${item.href}`} className={styles.navLink}>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.actions}>
        <button className={styles.themeButton} type="button" aria-label="Toggle dark mode">
          <svg
            className={styles.sunIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </button>

        <LanguageSwitcher
          className={styles.languageSwitcher}
          optionClassName={styles.languageOption}
          activeOptionClassName={styles.languageOptionActive}
          inactiveOptionClassName={styles.languageOptionInactive}
        />

        <Link href={`${homeHref}#booking`} className={styles.bookButton}>
          <span>{home.nav.cta}</span>
        </Link>

        <button className={styles.menuButton} type="button" aria-label="Open menu">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  )
}
