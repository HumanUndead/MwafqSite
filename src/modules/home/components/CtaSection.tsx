import type { Locale } from '@/i18n/config';
import type { HomeFinalCtaContent } from '../home.types';
import { HomeActionLinks } from './HomeActionLinks';

interface Props {
  locale: Locale;
  content: HomeFinalCtaContent;
}

export function CtaSection({ locale, content }: Props) {
  return (
    <section className='relative flex min-h-screen flex-col items-center justify-center bg-[#1e2364] px-6 md:px-15 py-20 text-center'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:26px_26px] [mask-image:radial-gradient(circle_at_50%_50%,transparent_25%,#000_75%)]'
      />
      <h2 className='relative z-10 mb-[22px] text-[clamp(34px,5vw,64px)] font-extrabold leading-[1.04] tracking-[-1.8px] text-white'>
        {content.title}
        {content.highlight ? (
          <>
            <br />
            <em className='font-normal italic text-[#00a8f1]/95'>
              {content.highlight}
            </em>
          </>
        ) : null}
      </h2>
      <p className='relative z-10 mx-auto mb-9 max-w-[560px] text-[16.5px] text-white/78'>
        {content.body}
      </p>
      <HomeActionLinks
        locale={locale}
        primary={content.primaryAction}
        secondary={content.secondaryAction}
        primaryVariant='brandInverse'
        secondaryVariant='brandGhost'
        className='relative z-10 flex flex-wrap justify-center gap-3.5'
      />
    </section>
  );
}
