import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { fetchServiceGroupsList } from '@/modules/auth/server/ServiceGroupService';
import {
  getServiceGroupBuyPath,
  plainTextFromHtml,
} from '@/modules/services/booking.shared';
import { getTranslation } from '@/shared/lib/getTranslationName';
import type { HomeServicesContent } from '../home.types';
import { Eyebrow } from './Eyebrow';
import { ArrowIcon } from './Icons';

interface Props {
  locale: Locale;
  content: HomeServicesContent;
}

interface ServiceCard {
  id: number;
  title: string;
  description: string;
}

async function getServiceCards(locale: Locale): Promise<ServiceCard[]> {
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
          description: translation?.description
            ? plainTextFromHtml(translation.description)
            : '',
        };
      })
      .filter((card) => card.title.length > 0);
  } catch {
    return [];
  }
}

export async function ServicesSection({ locale, content }: Props) {
  const services = await getServiceCards(locale);

  return (
    <section id='services' className='relative px-4 py-12 md:py-20 md:px-7'>
      <div
        className='pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(30,35,100,0.05)_1px,transparent_1.2px)] [background-size:24px_24px]'
        aria-hidden='true'
      />
      <div className='relative mx-auto max-w-[1320px]'>
        <div className='mb-10 md:mb-[60px] flex flex-wrap items-end justify-start gap-[50px]'>
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
            <p className='mt-4 max-w-[540px] text-[15px] leading-[1.6] text-[#6b7196]'>
              {content.body}
            </p>
          </div>
        </div>

        <div className='grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4'>
          {services.map((service) => (
            <Link
              key={service.id}
              href={getServiceGroupBuyPath(locale, service.id)}
              className='group relative flex flex-col overflow-hidden rounded-[18px] border border-[#e7e8f0] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00a8f1]/40 hover:shadow-[0_20px_40px_-20px_rgba(30,35,100,0.35)]'
            >
              <span
                aria-hidden='true'
                className='absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#00a8f1] to-[#00dec9] transition-transform duration-300 group-hover:scale-x-100'
              />
              <h3 className='text-[17px] font-extrabold leading-[1.25] tracking-[-0.3px] text-[#1e2364]'>
                {service.title}
              </h3>
              {service.description && (
                <p className='mt-2.5 line-clamp-3 text-[13px] leading-[1.55] text-[#6b7196]'>
                  {service.description}
                </p>
              )}
              <span className='mt-auto flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-[#1e2364]'>
                {locale === 'ar' ? 'احجز الآن' : 'Book now'}
                <span className='text-[#00a8f1] transition-transform duration-300 group-hover:translate-x-1 rtl:transform-[scaleX(-1)] rtl:group-hover:-translate-x-1'>
                  <ArrowIcon />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
