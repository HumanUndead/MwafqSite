import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import { localizePathname } from '@/i18n/routing';
import type { HomeServicesContent } from '../home.types';
import { Eyebrow } from './Eyebrow';
import { ServicesScrollList } from './ServicesScrollList';
import { cn } from '@/shared/lib/cn';
import {
  marketingLeadTextClass,
  marketingSectionHeadingClass,
  marketingSectionShellClass,
} from '@/shared/components/marketing/marketingLayout';

interface Props {
  locale: Locale;
  content: HomeServicesContent;
}

export function ServicesSection({ locale, content }: Props) {
  const services = content.items.filter((item) => item.title.length > 0);
  const rtl = isRtl(locale);

  return (
    <section id='services' className='relative px-4 py-10 md:py-16 md:px-7'>
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(30,35,100,0.05)_1px,transparent_1.2px)] bg-size-[24px_24px]'
        aria-hidden='true'
      />
      <div className={cn('relative', marketingSectionShellClass)}>
        <div className='mb-10 md:mb-15 flex flex-wrap items-end justify-start gap-12.5'>
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
