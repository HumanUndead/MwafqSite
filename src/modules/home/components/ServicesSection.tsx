import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import { fetchServiceGroupsList } from '@/modules/auth/server/ServiceGroupService';
import {
  getServiceGroupBuyPath,
  plainTextFromHtml,
} from '@/modules/services/booking.shared';
import { cn } from '@/shared/lib/cn';
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

        <div className='grid grid-cols-2 gap-4.5 xl:grid-cols-4'>
          {services.map((service) => (
            <Link
              key={service.id}
              href={getServiceGroupBuyPath(locale, service.id)}
              className='group relative flex flex-col overflow-hidden rounded-[20px] bg-white pb-8 pl-7 pr-7 pt-9.5 transition-transform duration-300 hover:-translate-y-1.5'
            >
              {/* Concave corner notch — page-bg square anchored at corner creates the carved look */}
              <span
                aria-hidden='true'
                className={cn(
                  'pointer-events-none absolute bottom-0 inset-e-0 z-1 h-0 w-0 translate-y-1/2 rounded-[14px] bg-[#eeeeef] transition-[width,height] duration-350 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:h-24 group-hover:w-24',
                  rtl ? '-translate-x-1/2' : 'translate-x-1/2'
                )}
              />

              <h3 className='text-[20px] font-extrabold leading-[1.2] tracking-[-0.3px] text-[#1e2364]'>
                {service.title}
              </h3>
              {service.description && (
                <p className='mt-3 line-clamp-3 text-[13.5px] leading-[1.55] text-[#6b7196]'>
                  {service.description}
                </p>
              )}

              {/* Arrow — bottom-right, slides into the notch on hover */}
              <span
                aria-hidden='true'
                className={cn(
                  'pointer-events-none absolute bottom-3.5 inset-e-3.5 z-3 text-[#1e2364] transition-transform duration-350 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-2',
                  rtl
                    ? 'group-hover:-translate-x-2'
                    : 'group-hover:translate-x-2'
                )}
              >
                <ArrowIcon className={rtl ? 'rotate-180' : undefined} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
