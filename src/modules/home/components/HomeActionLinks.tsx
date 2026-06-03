import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { HomeActionContent } from '@/modules/home/home.types';
import { hasCmsActionLabel } from '@/modules/home/lib/hasCmsActionLabel';
import { buttonVariants } from '@/shared/lib/variants';
import { CmsLink } from './CmsLink';

type HomeActionButtonVariant =
  | 'brand'
  | 'brandOutline'
  | 'brandGhost'
  | 'brandInverse';

interface Props {
  locale: Locale;
  primary: HomeActionContent;
  secondary: HomeActionContent;
  primaryVariant: HomeActionButtonVariant;
  secondaryVariant: HomeActionButtonVariant;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  primaryTrailing?: ReactNode;
}

export function HomeActionLinks({
  locale,
  primary,
  secondary,
  primaryVariant,
  secondaryVariant,
  className = 'flex flex-wrap gap-3.5',
  primaryClassName,
  secondaryClassName,
  primaryTrailing,
}: Props) {
  const showPrimary = hasCmsActionLabel(primary);
  const showSecondary = hasCmsActionLabel(secondary);

  if (!showPrimary && !showSecondary) {
    return null;
  }

  return (
    <div className={className}>
      {showPrimary ? (
        <CmsLink
          locale={locale}
          href={primary.path}
          className={
            primaryClassName ??
            buttonVariants({
              variant: primaryVariant,
              size: 'hero',
              shape: 'pill',
            })
          }
        >
          {primary.label}
          {primaryTrailing}
        </CmsLink>
      ) : null}
      {showSecondary ? (
        <CmsLink
          locale={locale}
          href={secondary.path}
          className={
            secondaryClassName ??
            buttonVariants({
              variant: secondaryVariant,
              size: 'hero',
              shape: 'pill',
            })
          }
        >
          {secondary.label}
        </CmsLink>
      ) : null}
    </div>
  );
}
