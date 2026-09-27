import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getLocalizedRoute } from '@/i18n/routing';
import { MarketingStickyHeaderOffset, marketingAlignedShellClass } from '@/shared/components/marketing';
import { ROUTES } from '@/shared/constants/routes';

interface DeactivateAccountResultPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

/**
 * The OS intercepts this URL as a Universal Link/App Link the moment the
 * deactivate-account flow redirects here, so this page only renders when
 * that interception did not happen (app not installed, desktop browser).
 */
export default async function DeactivateAccountResultPage({
  params,
  searchParams,
}: DeactivateAccountResultPageProps) {
  const [{ locale }, { status }] = await Promise.all([params, searchParams]);

  if (!hasLocale(locale)) {
    notFound();
  }

  const { auth } = await getDictionary(locale);
  const isSuccess = status === 'success';
  const copy = isSuccess
    ? auth.deactivateAccount.resultSuccess
    : auth.deactivateAccount.resultError;

  return (
    <MarketingStickyHeaderOffset variant='hero'>
      <div className='px-4 py-14 text-[#1e2364] md:px-7 md:py-20'>
        <div className={marketingAlignedShellClass}>
          <div className='mx-auto flex max-w-[620px] flex-col items-center gap-5 rounded-3xl border border-[#e5e7f0] bg-white px-6 py-10 text-center shadow-sm md:px-12 md:py-14'>
            <h1 className='text-[clamp(26px,3.6vw,40px)] font-extrabold leading-[1.15] tracking-[-0.8px]'>
              {copy.title}
            </h1>
            <p className='max-w-125 text-[15px] leading-[1.7] text-[#6b7196]'>
              {copy.message}
            </p>

            <Link
              href={getLocalizedRoute(locale, ROUTES.HOME)}
              className='text-[13.5px] font-semibold text-[#6b7196] underline-offset-4 transition-colors hover:text-[#00a8f1] hover:underline'
            >
              {auth.deactivateAccount.continueOnWeb}
            </Link>
          </div>
        </div>
      </div>
    </MarketingStickyHeaderOffset>
  );
}
