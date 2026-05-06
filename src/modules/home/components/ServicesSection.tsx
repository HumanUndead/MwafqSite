import type { Dictionary } from '@/locales/types'
import { Eyebrow } from './Eyebrow'
import { CarIcon, BuildingIcon, CertificateIcon, BriefcaseIcon } from './Icons'

const svcIcons = [
  <CarIcon key="car" />,
  <BuildingIcon key="building" />,
  <CertificateIcon key="cert" />,
  <BriefcaseIcon key="brief" />,
]

interface Props {
  content: Dictionary['home']['services']
}

export function ServicesSection({ content }: Props) {
  return (
    <section id="services" className="relative px-4 py-[120px] md:px-7">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(30,35,100,0.05)_1px,transparent_1.2px)] [background-size:24px_24px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1320px]">
        <div className="mb-[60px] flex flex-wrap items-end justify-start gap-[50px]">
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]">
              {content.title.split('.')[0]}.<br />
              <span className="font-normal italic opacity-55">{content.title.split('.').slice(1).join('.').trim()}</span>
            </h2>
          </div>
        </div>

        <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {content.items.map((svc, i) => (
            <div
              key={svc.title}
              className="group relative rounded-[20px] bg-white p-[38px_28px_32px] transition-transform duration-300 hover:-translate-y-1.5 after:absolute after:bottom-0 after:right-0 rtl:after:right-auto rtl:after:left-0 after:h-0 after:w-0 after:rounded-[14px] after:bg-[#eeeeef] after:content-[''] after:[transform:translate(50%,50%)] rtl:after:[transform:translate(-50%,50%)] after:transition-[width,height] after:duration-300 hover:after:h-24 hover:after:w-24"
            >
              <div className="absolute right-7 top-[38px] rtl:right-auto rtl:left-7">
                <div className="flex h-10 w-10 items-center justify-center">
                  {svcIcons[i]}
                </div>
              </div>
              <h3 className="flex min-h-10 items-center pr-14 rtl:pr-0 rtl:pl-14 text-[20px] font-extrabold leading-[1.2] tracking-[-0.3px] text-[#1e2364]">
                {svc.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-[1.55] text-[#6b7196]">{svc.description}</p>
              <svg
                className="absolute bottom-3.5 right-3.5 rtl:right-auto rtl:left-3.5 z-[3] h-[22px] w-[22px] text-[#1e2364] transition-transform duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 group-hover:translate-y-2 rtl:[transform:scaleX(-1)]"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
