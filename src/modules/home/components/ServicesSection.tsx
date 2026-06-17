import type { Locale } from '@/i18n/config';
import type { HomeServicesContent } from '../home.types';
import { CmsLink } from './CmsLink';
import { Eyebrow } from './Eyebrow';
import { ArrowIcon, getServiceIconByKey } from './Icons';

interface Props {
  locale: Locale;
  content: HomeServicesContent;
}

export function ServicesSection({ locale, content }: Props) {
  return (
    <section id='services' className='relative px-4 py-12 md:py-20 md:px-7'>
      <div
        className='pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(30,35,100,0.05)_1px,transparent_1.2px)] [background-size:24px_24px]'
        aria-hidden='true'
      />
      <div className='relative mx-auto max-w-[1320px]'>
        <div className='mb-10 md:mb-[60px] flex flex-wrap items-end justify-start gap-[50px]'>
          <div className='max-w-[620px]'>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className='text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]'>
              {content.title}
              {content.accent ? (
                <>
                  <br />
                  <span className='font-normal italic opacity-55'>
                    {content.accent}
                  </span>
                </>
              ) : null}
            </h2>
            <p className='mt-4 max-w-[540px] text-[15px] leading-[1.6] text-[#6b7196]'>
              {content.body}
            </p>
          </div>
        </div>

        <div className='grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4'>
          {content.items.map((service) => (
            <CmsLink
              key={`${service.title}-${service.path ?? 'no-path'}`}
              locale={locale}
              href={service.path}
              className="group relative block rounded-[20px] bg-white p-[38px_28px_32px] transition-transform duration-300 hover:-translate-y-1.5 after:absolute after:bottom-0 after:right-0 rtl:after:right-auto rtl:after:left-0 after:h-0 after:w-0 after:rounded-[14px] after:bg-[#eeeeef] after:content-[''] after:[transform:translate(50%,50%)] rtl:after:[transform:translate(-50%,50%)] after:transition-[width,height] after:duration-300 hover:after:h-24 hover:after:w-24"
            >
              <div className='absolute right-7 top-[38px] rtl:right-auto rtl:left-7'>
                <div className='flex h-10 w-10 items-center justify-center'>
                  {getServiceIconByKey(service.iconKey)}
                </div>
              </div>
              <h3 className='flex min-h-10 items-center pr-14 text-[20px] font-extrabold leading-[1.2] tracking-[-0.3px] text-[#1e2364] rtl:pl-14 rtl:pr-0'>
                {service.title}
              </h3>
              <p className='mt-3 text-[13.5px] leading-[1.55] text-[#6b7196]'>
                {service.description}
              </p>
              <span className='absolute bottom-3.5 right-3.5 z-[3] text-[#1e2364] transition-transform duration-300 group-hover:translate-y-2 group-hover:translate-x-2 rtl:left-3.5 rtl:right-auto rtl:group-hover:-translate-x-2 rtl:[transform:scaleX(-1)]'>
                <ArrowIcon />
              </span>
            </CmsLink>
          ))}
        </div>
      </div>
    </section>
  );
}
