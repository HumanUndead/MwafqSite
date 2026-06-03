import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { getTranslations } from '@/i18n/server';
import { getLocalizedRoute } from '@/i18n/routing';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { ROUTES } from '@/shared/constants/routes';
import { lowestServiceGroupPrice } from '@/shared/lib/serviceGroupMedia';
import { getServiceGroupBuyPath } from '@/modules/services/booking.shared';
import type {
  ServiceGroupDetail,
  ServiceGroupListItem,
} from '@/modules/auth/serviceGroup.types';
import { BuyNowButton } from './components/BuyNowButton';
import { PackageCard } from './components/PackageCard';
import { ServiceGroupDetailImage } from './components/ServiceGroupDetailImage';

function SarIcon() {
  return (
    <svg
      viewBox='0 0 1124.14 1256.39'
      aria-hidden
      className='inline-block h-5 w-[18px] fill-current'
    >
      <path d='M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z' />
      <path d='M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z' />
    </svg>
  );
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? String(price) : price.toFixed(2);
}

function plainTextFromHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type ServiceGroupDetailsViewProps = {
  locale: Locale;
  langId: number;
  serviceGroup: ServiceGroupDetail;
  relatedPackages: ServiceGroupListItem[];
  isAuthenticated: boolean;
};

export async function ServiceGroupDetailsView({
  locale,
  langId,
  serviceGroup,
  relatedPackages,
  isAuthenticated,
}: ServiceGroupDetailsViewProps) {
  const servicesT = await getTranslations('services');
  const t = servicesT.detail;
  const cardsT = servicesT.cards;
  const servicesHref = getLocalizedRoute(locale, ROUTES.SERVICES);

  const translation =
    serviceGroup.translations.find((tr) => tr.langId === langId) ??
    serviceGroup.translations[0];

  const title = translation?.name?.trim() ?? '';
  const descriptionHtml = translation?.description?.trim() ?? '';
  const descriptionPlain = plainTextFromHtml(descriptionHtml);

  const price = lowestServiceGroupPrice(
    serviceGroup.serviceGroupClassificationPricings
  );

  const requirements =
    serviceGroup.requirements?.filter((r) => r.langId === langId) ?? [];

  const conditions = serviceGroup.conditions ?? [];

  return (
    <div className='overflow-x-clip bg-[#eeeeef] text-[#1e2364]'>
      <div className='pb-3'>
        <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
          <ScrollReveal variant='y' revealAfterLoadMs={200}>
            <nav aria-label={t.breadcrumbAriaLabel}>
              <Link
                href={servicesHref}
                className='group inline-flex items-center gap-2 text-[14.5px] font-bold text-[#1e2364] transition-colors hover:text-[#00a8f1]'
              >
                <ChevronLeft className='size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1' />
                {t.backLink}
              </Link>
            </nav>
          </ScrollReveal>
        </div>
      </div>

      <section className='pb-[60px] pt-3 md:pb-[60px]'>
        <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
          <div className='mx-auto grid max-w-[1000px] grid-cols-1 items-stretch gap-6 lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-[25px]'>
            <ScrollReveal className='mx-auto w-full max-w-[330px] lg:mx-0'>
              <div className='flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-[#e5e7f0] bg-white'>
                <div className='relative min-h-[280px] flex-1 overflow-hidden bg-[#f2f2f2]'>
                  <ServiceGroupDetailImage
                    icon={serviceGroup.icon}
                    serviceGroupId={serviceGroup.id}
                    alt={title}
                    className='object-cover'
                    priority
                  />
                </div>

                <div className='border-t border-[#e5e7f0] px-5 py-4'>
                  <h1 className='text-[clamp(24px,2.6vw,32px)] font-extrabold leading-[1.05] tracking-[-1.2px] text-[#1e2364]'>
                    {title}
                  </h1>
                  {descriptionHtml ? (
                    <div
                      className='mt-1 text-[12.5px] leading-normal text-[#6b7196] [&_p]:m-0'
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : descriptionPlain ? (
                    <p className='mt-1 text-[12.5px] leading-normal text-[#6b7196]'>
                      {descriptionPlain}
                    </p>
                  ) : null}
                </div>

                {price ? (
                  <div className='flex items-center justify-between gap-3.5 border-t border-[#e5e7f0] px-5 py-3.5'>
                    <span className='inline-flex items-end gap-1.5 text-[30px] font-black leading-none tracking-[-1.4px] text-[#1e2364]'>
                      {formatPrice(price)}
                      <SarIcon />
                    </span>
                    <BuyNowButton
                      href={
                        isAuthenticated
                          ? getServiceGroupBuyPath(locale, serviceGroup.id)
                          : `${getLocalizedRoute(locale, ROUTES.LOGIN)}?redirect=${encodeURIComponent(getServiceGroupBuyPath(locale, serviceGroup.id))}`
                      }
                      label={t.buyNow}
                      locale={locale}
                      size='detail'
                    />
                  </div>
                ) : null}
              </div>
            </ScrollReveal>

            <ScrollReveal
              variant='y'
              transitionDelay={0.1}
              className='flex flex-col px-0 py-2 lg:ps-[38px] lg:pe-7'
            >
              <div>
                <h2 className='mb-3.5 text-[22px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
                  {t.requirementsTitle.replace('{{name}}', title)}
                </h2>
                {requirements.length > 0 ? (
                  <ul className='flex flex-col gap-2.5'>
                    {requirements.map((item) => (
                      <li
                        key={item.id}
                        className='flex gap-3.5 text-[14.5px] leading-[1.55] text-[#4a4f78] before:shrink-0 before:font-bold before:text-[#00a8f1] before:content-["→"]'
                      >
                        <span>{item.requirement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-[14.5px] text-[#6b7196]'>
                    {t.emptyRequirements}
                  </p>
                )}
              </div>

              <div className='mt-[18px] border-t border-[#e5e7f0] pt-[18px]'>
                <h2 className='mb-3.5 text-[22px] font-extrabold tracking-[-0.4px] text-[#1e2364]'>
                  {t.conditionsTitle}
                </h2>
                {conditions.length > 0 ? (
                  <ul className='flex flex-col gap-2.5'>
                    {conditions.map((item) => (
                      <li
                        key={item.id}
                        className='flex gap-3.5 text-[14.5px] leading-[1.55] text-[#4a4f78] before:shrink-0 before:font-bold before:text-[#00a8f1] before:content-["→"]'
                      >
                        <span>{item.value}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-[14.5px] text-[#6b7196]'>
                    {t.emptyConditions}
                  </p>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {relatedPackages.length > 0 ? (
        <section className='border-t-2 border-[#e5e7f0] pb-[100px] pt-[30px]'>
          <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
            <ScrollReveal className='mb-9'>
              <h2 className='text-[clamp(24px,2.8vw,36px)] font-extrabold tracking-[-1px] text-[#1e2364]'>
                {t.relatedTitle}
              </h2>
            </ScrollReveal>

            <div className='grid grid-cols-1 gap-[18px] min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
              {relatedPackages.map((pkg, index) => (
                <ScrollReveal
                  key={pkg.id}
                  transitionDelay={Math.min(index, 4) * 0.08}
                >
                  <PackageCard
                    pkg={pkg}
                    locale={locale}
                    t={cardsT}
                    variant='related'
                    withScrollReveal={false}
                    delay={Math.min(index, 4) * 0.08}
                    isAuthenticated={isAuthenticated}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
