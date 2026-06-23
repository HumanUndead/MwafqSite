import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { getTranslations } from '@/i18n/server';
import { getLocalizedRoute } from '@/i18n/routing';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { ROUTES } from '@/shared/constants/routes';
import type {
  ServiceGroupDetail,
  ServiceGroupListItem,
} from '@/modules/auth/serviceGroup.types';
import { PackageCard } from './components/PackageCard';
import { ServiceGroupDetailImage } from './components/ServiceGroupDetailImage';

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

  const requirements =
    serviceGroup.requirements?.filter((r) => r.langId === langId) ?? [];

  const conditions = serviceGroup.conditions ?? [];

  return (
    <div className='overflow-x-clip bg-[#eeeeef] text-[#1e2364]'>
      <div className='pb-3'>
        <div className='mx-auto max-w-330 px-4 md:px-7'>
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

      <section className='pb-15 pt-3 md:pb-15'>
        <div className='mx-auto max-w-330 px-4 md:px-7'>
          <div className='mx-auto grid max-w-250 grid-cols-1 items-stretch gap-6 lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-6.25'>
            <ScrollReveal className='mx-auto w-full max-w-82.5 lg:mx-0'>
              <div className='flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-[#e5e7f0] bg-white'>
                <div className='relative min-h-70 flex-1 overflow-hidden bg-[#f2f2f2]'>
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
                  {descriptionPlain ? (
                    <div
                      className='mt-1 text-[12.5px] leading-normal text-[#6b7196] [&_p]:m-0'
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : null}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal
              variant='y'
              transitionDelay={0.1}
              className='flex flex-col px-0 py-2 lg:ps-9.5 lg:pe-7'
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

              <div className='mt-4.5 border-t border-[#e5e7f0] pt-4.5'>
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
        <section className='border-t-2 border-[#e5e7f0] bg-white pb-25 pt-7.5'>
          <div className='mx-auto max-w-330 px-4 md:px-7'>
            <ScrollReveal className='mb-9'>
              <h2 className='text-[clamp(24px,2.8vw,36px)] font-extrabold tracking-[-1px] text-[#1e2364]'>
                {t.relatedTitle}
              </h2>
            </ScrollReveal>

            <div className='grid grid-cols-2 gap-5.5 sm:grid-cols-3 lg:grid-cols-4'>
              {relatedPackages.map((pkg, index) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  locale={locale}
                  t={cardsT}
                  delay={Math.min(index, 4) * 0.08}
                  isAuthenticated={isAuthenticated}
                  hidePrice
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
