import type { Dictionary } from '@/locales/types'

interface Props {
  content: Dictionary['b2b']['services']
}

const serviceIcons = [PreEmpIcon, ResidencyIcon, MunicipalityIcon, OccupationalIcon]

export function B2BServicesSection({ content }: Props) {
  return (
    <section
      id="services"
      className="bg-[#eeeeef] px-4 pb-24 sm:px-7 sm:pb-[110px]"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mx-auto mb-14 max-w-[760px] text-center">
          <h2 className="mb-4 text-[clamp(30px,4.2vw,52px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]">
            {content.titleLead}{' '}
            {content.titleAccent ? (
              <em className="font-normal italic text-[#1e2364]/55">
                {content.titleAccent}
              </em>
            ) : null}
          </h2>
          <p className="mx-auto max-w-[600px] text-[16px] leading-[1.65] text-[#6b7196]">
            {content.body}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {content.items.map((item, index) => {
            const Icon = serviceIcons[index] ?? PreEmpIcon
            return (
              <article
                key={item.title}
                className="relative flex flex-col items-start overflow-hidden rounded-[18px] border-2 border-[#1e2364] bg-[#1e2364] px-8 pb-8 pt-9 sm:px-9"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-9 top-9 text-[56px] font-light italic leading-none tracking-[-1.5px] text-[#00a8f1]/30 rtl:right-auto rtl:left-9"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  aria-hidden="true"
                  className="mb-4 ms-1 inline-flex items-center justify-start text-[#00a8f1]"
                >
                  <Icon />
                </span>
                <h3 className="relative z-[2] mb-2.5 text-[18px] font-extrabold leading-tight tracking-[-0.3px] text-white">
                  {item.title}
                </h3>
                <p className="relative z-[2] text-[14px] leading-[1.6] text-white/80">
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

function PreEmpIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  )
}

function ResidencyIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="11" r="2.5" />
      <line x1="14" y1="10" x2="18" y2="10" />
      <line x1="14" y1="14" x2="18" y2="14" />
    </svg>
  )
}

function MunicipalityIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <line x1="9" y1="21" x2="9" y2="13" />
      <line x1="15" y1="21" x2="15" y2="13" />
      <line x1="12" y1="9" x2="12" y2="9" />
    </svg>
  )
}

function OccupationalIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  )
}
