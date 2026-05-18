import type { Dictionary } from '@/locales/types'

interface Props {
  content: Dictionary['about']['mv']
}

export function MissionVisionSection({ content }: Props) {
  return (
    <section className="bg-[#eeeeef] px-4 py-20 sm:px-7 sm:pb-16 sm:pt-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-5 lg:grid-cols-2">
          <MvCard data={content.mission} icon={<MissionIcon />} />
          <MvCard data={content.vision} icon={<VisionIcon />} />
        </div>
      </div>
    </section>
  )
}

function MvCard({
  data,
  icon,
}: {
  data: Dictionary['about']['mv']['mission']
  icon: React.ReactNode
}) {
  return (
    <article className="rounded-[28px] border-2 border-[#1e2364] bg-white p-8 sm:p-10">
      <div className="mb-5 flex items-center gap-3.5">
        <span className="inline-flex flex-shrink-0 items-center justify-center text-[#00a8f1]">
          {icon}
        </span>
        <span className="text-[clamp(22px,2.2vw,28px)] font-extrabold leading-[1.1] tracking-[-0.4px] text-[#1e2364]">
          {data.label}
        </span>
      </div>
      <h3 className="mb-3 text-[clamp(22px,2.2vw,28px)] font-normal italic leading-[1.22] tracking-[-0.5px] text-[#6f8fcf]">
        {data.headline}
      </h3>
      <p className="text-[15.5px] leading-[1.7] text-[#6b7196]">{data.body}</p>
    </article>
  )
}

function MissionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[34px] w-[34px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M21 3 L13 11" />
      <path d="M18 3h3v3" />
    </svg>
  )
}

function VisionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[34px] w-[34px] text-[#6f8fcf]"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
