import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/locales/types';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { ContactForm } from './components/ContactForm';

interface Props {
  locale: Locale;
  content: Dictionary['contact'];
}

function MailIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect x='2' y='4' width='20' height='16' rx='2' />
      <polyline points='22,4 12,13 2,4' />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.35 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  );
}

const infoIcons = [MailIcon, PhoneIcon, MapPinIcon];

export function ContactPage({ content }: Props) {
  const infoItems = [
    content.info.email,
    content.info.phone,
    content.info.address,
  ];

  return (
    <>
      {/* Hero */}
      <section className='relative overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-14 pt-40 sm:px-7 sm:pt-44 lg:pt-[210px]'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]'
        />
        <div className='relative z-[2] mx-auto max-w-[1320px] text-center'>
          <ScrollReveal>
            <h1 className='text-[clamp(32px,4.9vw,67px)] font-extrabold leading-[1.05] tracking-[-2px] text-[#1e2364]'>
              {content.title}
            </h1>
          </ScrollReveal>
          <ScrollReveal transitionDelay={0.1}>
            <p className='mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.7] text-[#6b7196]'>
              {content.description}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Body */}
      <section className='px-4 py-20 sm:px-7'>
        <div className='mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16'>
          {/* Info cards */}
          <div className='flex flex-col gap-5'>
            {infoItems.map((item, i) => {
              const Icon = infoIcons[i];
              return (
                <ScrollReveal key={item.label} transitionDelay={i * 0.08}>
                  <div className='flex items-start gap-4 rounded-[20px] border-2 border-[#e5e7f0] bg-white p-6 transition-[border-color] duration-300 hover:border-[#00a8f1]/40'>
                    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#00a8f1]/10 text-[#00a8f1]'>
                      <Icon />
                    </span>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[1.5px] text-[#6b7196]'>
                        {item.label}
                      </p>
                      <p className='mt-1 text-[15px] font-medium text-[#1e2364]'>
                        {item.value}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Form card */}
          <ScrollReveal transitionDelay={0.12}>
            <div className='rounded-[28px] border-2 border-[#e5e7f0] bg-white px-8 py-10 shadow-sm'>
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
