import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import { fetchServiceGroupsList } from '@/modules/auth/server/ServiceGroupService';
import {
  getServiceGroupBuyPath,
} from '@/modules/services/booking.shared';
import { getTranslation } from '@/shared/lib/getTranslationName';
import type { HomeServicesContent } from '../home.types';
import { Eyebrow } from './Eyebrow';
import { ServiceCard } from './ServiceCard';
import { ServicesMobileCarousel } from './ServicesMobileCarousel';

interface Props {
  locale: Locale;
  content: HomeServicesContent;
}

interface ServiceCardData {
  id: number;
  title: string;
  iconKey: string | null;
}

async function getServiceCards(locale: Locale): Promise<ServiceCardData[]> {
  try {
    const page = await fetchServiceGroupsList({
      pageNumber: 1,
      pageSize: 8,
    });

    return (page.data ?? [])
      .map((group) => {
        const translation = getTranslation(group.translations, locale);
        return {
          id: group.id,
          title: translation?.name?.trim() ?? '',
          iconKey: group.icon ?? null,
        };
      })
      .filter((card) => card.title.length > 0);
  } catch {
    return [];
  }
}

export async function ServicesSection({ locale, content }: Props) {
  const services = await getServiceCards(locale);
  const rtl = isRtl(locale);

  return (
    <section id='services' className='relative px-4 py-12 md:py-20 md:px-7'>
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(30,35,100,0.05)_1px,transparent_1.2px)] bg-size-[24px_24px]'
        aria-hidden='true'
      />
      <div className='relative mx-auto max-w-330'>
        <div className='mb-10 md:mb-15 flex flex-wrap items-end justify-start gap-12.5'>
          <div className=''>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className='text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]'>
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
            <p className='mt-4 max-w-135 text-[15px] leading-[1.6] text-[#6b7196]'>
              {content.body}
            </p>
          </div>
        </div>

        {/* Desktop grid */}
        <div className='hidden items-start md:grid grid-cols-2 gap-4.5 xl:grid-cols-4'>
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              href={getServiceGroupBuyPath(locale, service.id)}
              title={service.title}
              iconKey={service.iconKey}
              rtl={rtl}
              index={index}
            />
          ))}
        </div>

        {/* Mobile grid */}
        <div className='md:hidden'>
          <ServicesMobileCarousel
            services={services.map((s, i) => ({
              id: s.id,
              href: getServiceGroupBuyPath(locale, s.id),
              title: s.title,
              iconKey: s.iconKey,
              index: i,
            }))}
            rtl={rtl}
          />
        </div>
      </div>
    </section>
  );
}
