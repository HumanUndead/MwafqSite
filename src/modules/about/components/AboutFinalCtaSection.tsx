import type { Locale } from '@/i18n/config'
import { getLocalizedRoute } from '@/i18n/routing'
import type { Dictionary } from '@/locales/types'
import { ROUTES } from '@/shared/constants/routes'
import { buttonVariants } from '@/shared/lib/variants'

interface Props {
  locale: Locale
  content: Dictionary['about']['finalCta']
}

export function AboutFinalCtaSection({ locale, content }: Props) {
  return (
    <section className="relative border-t-2 border-[#e5e7f0] bg-white px-7 py-24 text-center sm:py-[100px]">
      <div className="mx-auto max-w-[760px]">
        <h2 className="mb-5 text-[clamp(34px,5vw,60px)] font-extrabold leading-[1.05] tracking-[-1.8px] text-[#1e2364]">
          {content.titleLead}{' '}
          <em className="font-normal italic text-[#00a8f1]/95">
            {content.titleAccent}
          </em>
        </h2>
        <p className="mx-auto mb-9 max-w-[560px] text-[16.5px] leading-[1.65] text-[#6b7196]">
          {content.body}
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <a
            href={getLocalizedRoute(locale, ROUTES.HOME) + '#booking'}
            className={buttonVariants({
              variant: 'brand',
              size: 'hero',
              shape: 'pill',
            })}
          >
            {content.primary}
          </a>
          <a
            href={getLocalizedRoute(locale, ROUTES.CONTACT)}
            className={buttonVariants({
              variant: 'brandOutline',
              size: 'hero',
              shape: 'pill',
            })}
          >
            {content.secondary}
          </a>
        </div>
      </div>
    </section>
  )
}
