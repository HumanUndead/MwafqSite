import Link from 'next/link';
import { CheckCircle2, ChevronLeft, ClipboardList } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { getTranslations } from '@/i18n/server';
import { getLocalizedRoute } from '@/i18n/routing';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { marketingAlignedShellClass } from '@/shared/components/marketing';
import { ROUTES } from '@/shared/constants/routes';
import { interpolate } from '@/shared/lib/interpolate';
import type { ServiceGroupDetail } from '@/modules/auth/serviceGroup.types';
import { ServiceGroupDetailImage } from './components/ServiceGroupDetailImage';
import { BasketBar } from './components/catalog/BasketBar';
import { CatalogActionsProvider } from './components/catalog/CatalogActionsProvider';
import { GroupBookingPanel } from './components/catalog/GroupBookingPanel';

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
  service: ServiceGroupDetail;
};

export async function ServiceGroupDetailsView({
  locale,
  langId,
  service,
}: ServiceGroupDetailsViewProps) {
  const servicesT = await getTranslations('services');
  const catalogT = await getTranslations('catalog');
  const t = servicesT.detail;
  const servicesHref = getLocalizedRoute(locale, ROUTES.SERVICES);

  const translation =
    service.translations.find((tr) => tr.langId === langId) ??
    service.translations[0];

  const title = translation?.name?.trim() ?? '';
  const descriptionHtml = translation?.description?.trim() ?? '';
  const descriptionPlain = plainTextFromHtml(descriptionHtml);
  const includedServices = (service.serviceGroupServices ?? []).filter(
    (item) => item.serviceName?.trim()
  );
  const requirements = (service.requirements ?? []).filter(
    (item) => item.langId === langId && item.requirement?.trim()
  );

  return (
    <CatalogActionsProvider>
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
                  <div className='relative flex min-w-0 flex-col gap-8'>
                    <div>
                      <h1 className='mb-2.5 wrap-break-word text-[clamp(22px,2.6vw,32px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1e2364]'>
                        {title}
                      </h1>
                      {descriptionPlain && (
                        <p className='min-w-0 max-w-full wrap-break-word text-[14.5px] leading-[1.55] text-[#6b7196] lg:max-w-[560px]'>
                          {descriptionPlain}
                        </p>
                      )}
                    </div>

                    {includedServices.length > 0 && (
                      <div>
                        <h2 className='mb-3 text-[18px] font-extrabold text-[#1e2364]'>
                          {catalogT.groupServicesTitle}
                        </h2>
                        <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                          {includedServices.map((item) => (
                            <li
                              key={item.id}
                              className='flex items-center gap-2 rounded-[12px] bg-[#f3f4f8] px-3 py-2.5 text-sm font-semibold'
                            >
                              <CheckCircle2
                                className='size-4 shrink-0 text-[#00a8f1]'
                                aria-hidden
                              />
                              {item.serviceName.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h2 className='mb-3 text-[18px] font-extrabold text-[#1e2364]'>
                        {interpolate(t.requirementsTitle, { name: title })}
                      </h2>
                      {requirements.length > 0 ? (
                        <ul className='flex flex-col gap-2'>
                          {requirements.map((item) => (
                            <li
                              key={item.id}
                              className='flex items-start gap-2 text-[14.5px] leading-[1.55] text-[#6b7196]'
                            >
                              <ClipboardList
                                className='mt-0.5 size-4 shrink-0 text-[#1e2364]'
                                aria-hidden
                              />
                              {plainTextFromHtml(item.requirement)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='text-[14.5px] text-[#6b7196]'>
                          {t.emptyRequirements}
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal
                  variant='y'
                  revealAfterLoadMs={200}
                  transitionDelay={0.12}
                  className='mx-auto min-w-0 w-full max-w-[380px] lg:sticky lg:top-[110px] lg:mx-0 lg:max-w-full'
                >
                  <div className='flex min-w-0 flex-col gap-4'>
                    <div className='relative aspect-4/3 w-full overflow-hidden rounded-[8px] border-2 border-[#e5e7f0] bg-white'>
                      <ServiceGroupDetailImage
                        icon={service.icon}
                        alt={title}
                        className='object-contain object-center p-20'
                        priority
                        sizes='(max-width: 1024px) 380px, 420px'
                      />
                    </div>
                    <GroupBookingPanel group={service} />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

      </div>
      <BasketBar />
    </CatalogActionsProvider>
  );
}
