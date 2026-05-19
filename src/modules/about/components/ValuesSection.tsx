import type { Dictionary } from '@/locales/types'
import { Eyebrow } from '@/modules/home/components/Eyebrow'

interface Props {
  content: Dictionary['about']['values']
}

const valueIcons = [TrustIcon, SpeedIcon, CareIcon]

export function ValuesSection({ content }: Props) {
  return (
    <section className="bg-[#eeeeef] px-4 py-20 sm:px-7 sm:py-[110px]">
      <div className="mx-auto max-w-[1320px]">
        <div className="mx-auto mb-12 max-w-[780px] text-center">
          <div className="inline-block">
            <Eyebrow>{content.eyebrow}</Eyebrow>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((item, index) => {
            const Icon = valueIcons[index] ?? TrustIcon
            return (
              <article
                key={item.title}
                className="rounded-[28px] border-2 border-[#1e2364] bg-white px-8 py-8"
              >
                <div className="mb-3.5 flex items-center justify-between gap-3.5">
                  <h3 className="text-[20px] font-extrabold tracking-[-0.3px] text-[#1e2364]">
                    {item.title}
                  </h3>
                  <span className="inline-flex flex-shrink-0 items-center justify-center text-[#1e2364]">
                    <Icon />
                  </span>
                </div>
                <p className="text-[14.5px] leading-[1.65] text-[#6b7196]">
                  {item.body}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TrustIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[30px] w-[30px]"
      aria-hidden="true"
    >
      <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
    </svg>
  )
}

function SpeedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[30px] w-[30px]"
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function CareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[30px] w-[30px]"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
