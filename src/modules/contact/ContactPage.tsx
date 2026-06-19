import type { Locale } from '@/i18n/config';
import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '@/shared/components/icons/contact';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { ContactForm } from './components/ContactForm';
import type { ContactPageContent } from './types/contactContent';

interface Props {
  locale: Locale;
  content: ContactPageContent;
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
      <section className='relative overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-14 sm:px-7'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 opacity-55 bg-[radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] bg-size-[24px_24px] mask-[radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]'
        />
        <div className='relative z-2 mx-auto max-w-[1320px] text-center'>
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
                      <Icon className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[1.5px] text-[#6b7196]'>
                        {item.label}
                      </p>
                      <p dir={Icon === PhoneIcon ? 'ltr' : 'rtl'} className='mt-1 text-[15px] font-medium text-[#1e2364]'>
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
              <ContactForm content={content.form} />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
