import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocalizedRoute } from '@/i18n/routing';
import { AppLinkActions } from '@/modules/deep-linking/components/AppLinkActions';
import { marketingAlignedShellClass } from '@/shared/components/marketing';
import { ROUTES } from '@/shared/constants/routes';

interface Props {
  locale: Locale;
}

/**
 * Web fallback for a shared `/app/*` deep link. People with the app never reach
 * it — the OS intercepts the URL before any request — so this page only serves
 * the store-fallback case.
 *
 * Deliberately static: no reveal animation. This is the last resort when the
 * app handoff failed, so it must render with zero JS. `ScrollReveal` would emit
 * `opacity: 0` server-side and leave a blank card if the bundle never runs.
 */
export async function AppLinkPage({ locale }: Props) {
  const { appLink } = await getDictionary(locale);

  return (
    <div className='px-4 py-14 text-[#1e2364] md:px-7 md:py-20'>
      <div className={marketingAlignedShellClass}>
        <div className='mx-auto flex max-w-[620px] flex-col items-center gap-5 rounded-3xl border border-[#e5e7f0] bg-white px-6 py-10 text-center shadow-sm md:px-12 md:py-14'>
          <span className='text-[13px] font-bold uppercase tracking-[0.14em] text-[#00a8f1]'>
            {appLink.eyebrow}
          </span>
          <h1 className='text-[clamp(26px,3.6vw,40px)] font-extrabold leading-[1.15] tracking-[-0.8px]'>
            {appLink.title}
          </h1>
          <p className='max-w-125 text-[15px] leading-[1.7] text-[#6b7196]'>
            {appLink.message}
          </p>

          <AppLinkActions
            labels={{
              openInApp: appLink.openInApp,
              playStore: appLink.playStore,
              appStore: appLink.appStore,
            }}
          />

          <Link
            href={getLocalizedRoute(locale, ROUTES.HOME)}
            className='text-[13.5px] font-semibold text-[#6b7196] underline-offset-4 transition-colors hover:text-[#00a8f1] hover:underline'
          >
            {appLink.continueOnWeb}
          </Link>
        </div>
      </div>
    </div>
  );
}
