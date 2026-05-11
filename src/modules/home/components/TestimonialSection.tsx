import type { HomeTestimonialContent } from '../home.types'

interface Props {
  content: HomeTestimonialContent
}

export function TestimonialSection({ content }: Props) {
  return (
    <section className="relative overflow-hidden bg-white py-[265px_0_140px] pb-[140px] pt-[265px]">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(#eef0f7_1px,transparent_1px),linear-gradient(90deg,#eef0f7_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1320px] px-4 md:px-7">
        <div className="relative z-10 mx-auto max-w-[980px] text-center">
          <div className="mb-9 text-[clamp(26px,3.5vw,44px)] font-light italic leading-[1.3] tracking-[-1px] text-[#1e2364]">
            {content.quote}{' '}
            <em className="not-italic font-semibold text-[#00a8f1]">{content.highlight}</em>
          </div>
          <div className="inline-flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-full bg-[#f2f3f7]" aria-hidden="true" />
            <div className="text-left">
              <strong className="block text-[14.5px] text-[#1e2364]">{content.author}</strong>
              <span className="text-[13px] text-[#6b7196]">{content.role}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
