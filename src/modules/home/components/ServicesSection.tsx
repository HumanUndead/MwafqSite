import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import { getLocalizedRoute, localizePathname } from '@/i18n/routing';
import { getTranslations } from '@/i18n/server';
import { ROUTES } from '@/shared/constants/routes';
import type { HomeServicesContent } from '../home.types';
import { ArrowIcon } from '@/shared/components/icons/home';
import { Eyebrow } from './Eyebrow';
import { ServicesScrollList } from './ServicesScrollList';
import { cn } from '@/shared/lib/cn';
import {
  marketingLeadTextClass,
  marketingSectionHeadingClass,
  marketingSectionShellClass,
} from '@/shared/components/marketing/marketingLayout';

const MAX_HOME_SERVICES = 6;

interface Props {
  locale: Locale;
  content: HomeServicesContent;
}

export async function ServicesSection({ locale, content }: Props) {
  const services = content.items
    .filter((item) => item.title.length > 0)
    .slice(0, MAX_HOME_SERVICES);
  const rtl = isRtl(locale);
  const t = await getTranslations('services');

  return (
    <section id='services' className='relative px-4 py-10 md:py-16 md:px-7'>
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(30,35,100,0.05)_1px,transparent_1.2px)] bg-size-[24px_24px]'
        aria-hidden='true'
      />
      <div className={cn('relative', marketingSectionShellClass)}>
        <div className='mb-10 md:mb-15 flex flex-wrap items-end justify-between gap-12.5'>
          <div className=''>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2
              className={cn(
                'font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]',
                marketingSectionHeadingClass
              )}
            >
              {content.title}
              {content.accent && (
                <>
                  {' '}
                  <span className='font-normal italic opacity-55'>
                    {content.accent}
                  </span>
                </>
              )}
            </h2>
            <p
              className={cn(
                'mt-4 max-w-135 leading-[1.6] text-[#6b7196] min-[1920px]:max-w-none',
                marketingLeadTextClass
              )}
            >
              {content.body}
            </p>
          </div>

          <Link
            href={getLocalizedRoute(locale, ROUTES.SERVICES)}
            className='group ms-auto inline-flex shrink-0 items-center gap-2 text-[15px] font-bold text-[#1e2364] transition-colors hover:text-[#00a8f1] md:ms-0'
          >
            {t.viewAll}
            <ArrowIcon
              className={cn(
                'size-4 transition-transform group-hover:translate-x-1',
                rtl && 'rotate-180 group-hover:-translate-x-1'
              )}
            />
          </Link>
        </div>

        <ServicesScrollList
          services={services.map((service, index) => ({
            id: index,
            href: service.path ? localizePathname(service.path, locale) : '#',
            title: service.title,
          }))}
          rtl={rtl}
        />
      </div>
    </section>
  );
}
