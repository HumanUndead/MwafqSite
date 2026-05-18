import type { Dictionary } from '@/locales/types'
import { Eyebrow } from '@/modules/home/components/Eyebrow'

interface Props {
  content: Dictionary['about']['how']
}

export function HowItWorksSection({ content }: Props) {
  return (
    <section
      id="how"
      className="border-y-2 border-[#e5e7f0] bg-white px-4 py-20 sm:px-7 sm:py-[110px]"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 flex flex-col items-start gap-8 sm:mb-14 sm:flex-row sm:items-end sm:gap-12">
          <div className="max-w-[640px]">
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]">
              {content.titleLead}
              <br />
              {content.titleAccent}
            </h2>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {content.items.map((step, index) => (
            <article
              key={step.title}
              className="relative overflow-hidden rounded-[22px] border-2 border-[#e5e7f0] bg-white px-9 py-10 before:absolute before:inset-y-0 before:start-0 before:w-1 before:bg-[#00a8f1]"
            >
              <div className="mb-4 text-[56px] font-light italic leading-none text-[#1e2364]/30">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="mb-3 text-[22px] font-extrabold tracking-[-0.4px] text-[#00a8f1]">
                {step.title}
              </h3>
              <p className="text-[15px] leading-[1.65] text-[#6b7196]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
