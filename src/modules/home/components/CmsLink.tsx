import type { AnchorHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { isNativeAnchorHref, resolveCmsHref } from '../cmsHref';

interface CmsLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  locale: Locale;
  href: string | null | undefined;
  children: ReactNode;
}

export function CmsLink({ locale, href, children, ...props }: CmsLinkProps) {
  const resolvedHref = resolveCmsHref(locale, href);

  if (!resolvedHref) {
    return <span {...props}>{children}</span>;
  }

  if (isNativeAnchorHref(resolvedHref)) {
    return (
      <Link href={resolvedHref} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={resolvedHref} {...props}>
      {children}
    </a>
  );
}
