import type { Dictionary } from '@/locales/types'

interface Props {
  content: Dictionary['about']['story']
}

export function StorySection({ content }: Props) {
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-white px-4 py-24 sm:px-7 sm:py-32 lg:py-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(#eef0f7_1px,transparent_1px),linear-gradient(90deg,#eef0f7_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_70%)]"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[4%] top-[6%] block h-14 w-14 text-[#00a8f1]/85 sm:left-[10%] sm:top-[14%] sm:h-[90px] sm:w-[90px]"
      >
        <CornerBracket />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[6%] right-[4%] block h-14 w-14 rotate-180 text-[#00a8f1]/85 sm:bottom-[14%] sm:right-[10%] sm:h-[90px] sm:w-[90px]"
      >
        <CornerBracket />
      </span>

      <div className="relative z-[2] mx-auto max-w-[980px] text-center">
        <h2 className="mb-9 text-[clamp(20px,3vw,42px)] font-extrabold leading-[1.1] tracking-[-1px] text-[#1e2364]">
          {content.title}
        </h2>
        <p className="text-[clamp(22px,3.5vw,44px)] font-light italic leading-[1.3] tracking-[-1px] text-[#1e2364]">
          {content.body}
        </p>
      </div>
    </section>
  )
}

function CornerBracket() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path d="M4 18 V4 H18" />
      <path d="M4 30 V44 H18" />
    </svg>
  )
}
