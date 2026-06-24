import Link from 'next/link';
import { ArrowRight, ChevronLeft } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { getTranslations } from '@/i18n/server';
import { getLocalizedRoute } from '@/i18n/routing';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { marketingAlignedShellClass } from '@/shared/components/marketing';
import { ROUTES } from '@/shared/constants/routes';
import type {
  ServiceGroupDetail,
  ServiceGroupListItem,
} from '@/modules/auth/serviceGroup.types';
import { getServiceGroupBuyPath } from '@/modules/services/booking.shared';
import { PackageCard } from './components/PackageCard';
import { BuyNowButton } from './components/BuyNowButton';
import { ServiceGroupDetailImage } from './components/ServiceGroupDetailImage';

function plainTextFromHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
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

  const buyPath = getServiceGroupBuyPath(locale, serviceGroup.id);
  const buyHref = isAuthenticated
    ? buyPath
    : `${getLocalizedRoute(locale, ROUTES.LOGIN)}?redirect=${encodeURIComponent(buyPath)}`;

  const requirements =
    serviceGroup.requirements?.filter((r) => r.langId === langId) ?? [];

  const conditions = serviceGroup.conditions ?? [];

  return (
    <div className='overflow-x-clip text-[#1e2364]'>
      <section className='pb-12 md:pb-[50px]'>
        <div className={marketingAlignedShellClass}>
          <div className='px-5 max-[1100px]:px-4 max-[560px]:px-3.5'>
            <ScrollReveal variant='y' revealAfterLoadMs={200}>
              <nav aria-label={t.breadcrumbAriaLabel} className='mb-6'>
                <Link
                  href={servicesHref}
                  className='group inline-flex items-center gap-2 text-[14.5px] font-bold text-[#1e2364] transition-colors hover:text-[#00a8f1]'
                >
                  <ChevronLeft className='size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1' />
                  {t.backLink}
                </Link>
              </nav>
            </ScrollReveal>

            <div className='grid w-full min-w-0 grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]'>
              <ScrollReveal
                variant='y'
                revealAfterLoadMs={200}
                className='min-w-0'
              >
                <div className='relative flex min-w-0 flex-col'>
                  <h1 className='mb-2.5 wrap-break-word text-[clamp(22px,2.6vw,32px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1e2364]'>
                    {title}
                  </h1>
                  {descriptionPlain ? (
                    <p className='mb-10 min-w-0 max-w-full wrap-break-word text-[14.5px] leading-[1.55] text-[#6b7196] lg:max-w-[560px]'>
                      {descriptionPlain}
                    </p>
                  ) : (
                    <div className='mb-10' />
                  )}

                  <div className='mb-9'>
                    <h2 className='mb-3 text-[19px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                      {t.requirementsTitle.replace('{{name}}', title)}
                    </h2>
                    {requirements.length > 0 ? (
                      <ul className='flex flex-col gap-2.5'>
                        {requirements.map((item) => (
                          <li
                            key={item.id}
                            className='flex items-start gap-3.5 text-[14.5px] leading-[1.55] text-[#4a4f78]'
                          >
                            <ArrowRight
                              className='mt-0.5 size-[14px] shrink-0 text-[#00a8f1] rtl:rotate-180'
                              strokeWidth={2.4}
                              aria-hidden
                            />
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

                  <div>
                    <h2 className='mb-3 text-[19px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                      {t.conditionsTitle}
                    </h2>
                    {conditions.length > 0 ? (
                      <ul className='flex flex-col gap-2.5'>
                        {conditions.map((item) => (
                          <li
                            key={item.id}
                            className='flex items-start gap-3.5 text-[14.5px] leading-[1.55] text-[#4a4f78]'
                          >
                            <ArrowRight
                              className='mt-0.5 size-[14px] shrink-0 text-[#00a8f1] rtl:rotate-180'
                              strokeWidth={2.4}
                              aria-hidden
                            />
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
                </div>
              </ScrollReveal>

              <ScrollReveal
                variant='y'
                revealAfterLoadMs={200}
                transitionDelay={0.12}
                className='mx-auto min-w-0 w-full max-w-[380px] lg:mx-0 lg:max-w-full'
              >
                <div className='flex min-w-0 flex-col gap-4'>
                  <div className='relative aspect-4/3 w-full overflow-hidden rounded-[8px] border-2 border-[#e5e7f0]'>
                    <ServiceGroupDetailImage
                      icon={serviceGroup.icon}
                      serviceGroupId={serviceGroup.id}
                      alt={title}
                      className='object-cover object-center'
                      priority
                      sizes='(max-width: 1024px) 380px, 420px'
                    />
                  </div>

                  <BuyNowButton
                    href={buyHref}
                    label={t.buyNow}
                    locale={locale}
                    size='detail'
                    className='h-11 w-full rounded-[14px] text-[14px]'
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {relatedPackages.length > 0 ? (
        <section className='overflow-x-clip border-t-2 border-[#e5e7f0] pb-16 pt-8 md:pb-24 md:pt-10'>
          <div className={marketingAlignedShellClass}>
            <div className='px-5 max-[1100px]:px-4 max-[560px]:px-3.5'>
              <ScrollReveal className='mb-9'>
                <h2 className='text-[clamp(24px,2.8vw,36px)] font-extrabold tracking-[-1px] text-[#1e2364]'>
                  {t.relatedTitle}
                </h2>
              </ScrollReveal>

              <div className='grid grid-cols-1 gap-4.5 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
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
                      hidePrice
                      flat
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
