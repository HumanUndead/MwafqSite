'use client';

import Image from 'next/image';
import type { Locale } from '@/i18n/config';
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
      className={cn('flex items-center', compact ? 'gap-1.5' : 'gap-2')}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-[#1e2364]/8 text-[#00a8f1]',
          compact ? 'h-6 w-6' : 'h-7 w-7'
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
  return (
    <footer id='contact' className='bg-[#eeeeef] px-4 pb-3 pt-0 md:px-6 md:pb-4'>
      <div className='mx-auto max-w-330'>
        <div className='xl:grid xl:grid-cols-[2.6fr_1fr_1.4fr] xl:py-5'>

          {/* ── Brand ── */}
          <div className='py-3 xl:py-0 xl:pr-6'>
            <CmsLink locale={locale} href={content.brandPath} className='w-fit'>
              <Image
                src={content.brandImageSrc ?? '/demo-assets/logo.svg'}
                alt={content.brandLabel}
                width={200}
                height={200}
                className='h-10 w-auto md:h-11'
                loading='eager'
                onError={(e) =>
                  (e.currentTarget.src = '/demo-assets/logo.svg')
                }
              />
            </CmsLink>
            <p className='mt-1.5 max-w-85 text-[13px] leading-[1.45] text-[rgba(30,35,100,0.65)]'>
              {content.brandBody}
            </p>

            {content.socialLinks.length > 0 && (
              <div className='mt-2.5 flex gap-2'>
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
                        'flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 xl:hover:-translate-y-0.5',
                        getSocialIconStyle(name)
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </a>
                  );
                })}
              </div>
            )}

            <p className='mt-3 text-[12px] text-[rgba(30,35,100,0.45)]'>
              {content.copyrightLabel} {content.copyrightBody}
            </p>
          </div>

          {/* ── Mobile only: 2-col grid (Pages | Contact), no accordion ── */}
          <div className='xl:hidden'>
            <div className='h-px bg-[#1e2364]/10' />
            <div className='grid grid-cols-2 gap-3 py-2.5'>

              {/* Pages column */}
              <div>
                <ul className='space-y-1.5 text-[12.5px] text-[rgba(30,35,100,0.72)]'>
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
                <div className='flex flex-col gap-1.5 text-[rgba(30,35,100,0.72)]'>
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
            <ul className='space-y-1.5 text-[13px] text-[rgba(30,35,100,0.72)]'>
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

          {/* ── Desktop col 3: Contact ── */}
          <div className='hidden xl:block xl:py-0'>
            <div className='flex flex-col gap-2 text-[13px] text-[rgba(30,35,100,0.72)]'>
              {content.contact.links.map((link) => (
                <ContactLink
                  key={`${link.label}-${link.path ?? 'no-path'}`}
                  link={link}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
