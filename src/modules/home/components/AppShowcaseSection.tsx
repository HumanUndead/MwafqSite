import type { Dictionary } from '@/locales/types'
import { Eyebrow } from './Eyebrow'
import { CheckIcon } from './Icons'

interface Props {
  content: Dictionary['home']['app']
}

export function AppShowcaseSection({ content }: Props) {
  return (
    <section id="app" className="sticky top-[-100px] flex min-h-screen items-center border-t-2 border-[#e5e7f0] bg-[#eeeeef] pb-[200px]">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:26px_26px] opacity-55 [mask-image:radial-gradient(circle_at_70%_50%,#000_0%,transparent_70%)]" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 py-[120px] md:px-7">
        <div className="grid items-center gap-[60px] lg:grid-cols-[1.1fr_1fr]">

          {/* 3D device stack */}
          <div className="relative h-[600px] overflow-hidden rounded-[32px] [perspective:1500px]">
            <div
              className="absolute left-1/2 top-1/2 h-[560px] w-[380px] [transform-style:preserve-3d] animate-[stackShowcase_9s_ease-in-out_infinite]"
              id="phones"
            >
              {/* Card 1 — sapphire, front */}
              <div className="device-card absolute -left-10 bottom-[-40px] right-20 top-[140px] overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-[#1e2364] p-[30px] text-white animate-[cardFloat1_5s_ease-in-out_infinite]">
                <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-white/85">{content.cards[0]?.title}</div>
                <div className="mb-[18px] text-[20px] font-extrabold tracking-[-0.4px]">{content.cards[0]?.detail.split('·')[0]}</div>
                <div className="flex items-center gap-2.5 rounded-[14px] border-2 border-white bg-white p-3.5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#1e2364] font-extrabold text-white">12</div>
                  <div>
                    <strong className="block text-[14px] font-extrabold text-[#1e2364]">King Fahd Hospital</strong>
                    <span className="text-[12px] text-[#6b7196]">09:00 AM · Riyadh</span>
                  </div>
                </div>
              </div>
              {/* Card 2 — purple, back */}
              <div className="device-card absolute bottom-20 left-0 right-0 top-0 overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-[#742f88] p-6 text-white animate-[cardFloat2_7s_ease-in-out_infinite]">
                <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-white/85">{content.cards[1]?.title}</div>
                <div className="mb-[18px] text-[20px] font-extrabold tracking-[-0.4px]">In Progress</div>
                {[{ dot: 'bg-[#1e2364]', label: 'Booking accepted' }, { dot: 'bg-[#742f88] border border-white/40', label: 'Sample collected' }, { dot: 'bg-[#f5b400]', label: 'Lab review' }].map((s, i) => (
                  <div key={i} className="mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#1e2364] bg-white px-3.5 py-3 text-[13px] font-bold text-[#1e2364]">
                    <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${s.dot}`} aria-hidden="true" />
                    {s.label}
                  </div>
                ))}
              </div>
              {/* Card 3 — white, middle */}
              <div className="device-card absolute bottom-5 left-[60px] right-[-40px] top-[60px] overflow-hidden rounded-[28px] border-2 border-[#1e2364] bg-white p-[26px] animate-[cardFloat3_6s_ease-in-out_infinite]">
                <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b7196]">{content.cards[2]?.title}</div>
                <div className="mb-[18px] text-[20px] font-extrabold tracking-[-0.4px] text-[#1e2364]">Ready to download</div>
                {[
                  { icon: <CheckIcon />, label: 'Driving License', sub: 'Fit for Service', bg: 'bg-[#1e2364]' },
                  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'Residency Exam', sub: 'Approved · Mar 12', bg: 'bg-[#742f88]' },
                ].map((r, i) => (
                  <div key={i} className="mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#e5e7f0] bg-white px-3.5 py-3">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-white ${r.bg}`} aria-hidden="true">{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <strong className="block text-[13px] font-extrabold text-[#1e2364]">{r.label}</strong>
                      <span className="text-[11px] text-[#6b7196]">{r.sub}</span>
                    </div>
                    <span className="rounded-full bg-[#00a8f1] px-2.5 py-1 text-[10.5px] font-extrabold text-white">PDF</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right text */}
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className="mb-7 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]">
              {content.title.split(',')[0]},<br />
              <span className="font-normal italic opacity-55">{content.title.split(',').slice(1).join(',').trim()}</span>
            </h2>
            <div className="flex flex-col gap-3.5 mt-7">
              {content.points.map(point => (
                <div key={point.title} className="flex items-center gap-3.5 rounded-[18px] border-2 border-[#e5e7f0] bg-white px-[22px] py-[18px] transition-[border-color,transform] duration-300 hover:border-[#1e2364] hover:translate-x-[3px]">
                  <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[#00dec9] bg-[rgba(0,222,201,0.10)] text-[#007a6e] transition-all duration-300 hover:bg-[#00dec9] hover:text-[#1e2364]">
                    <CheckIcon />
                  </div>
                  <div>
                    <strong className="block text-[15.5px] font-bold tracking-[-0.2px] text-[#1e2364]">{point.title}</strong>
                    <span className="text-[13.5px] text-[#6b7196]">{point.detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-[30px] flex flex-wrap gap-3.5">
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-[#1e2364] px-[30px] py-4 text-[15px] font-semibold text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                App Store
              </a>
              <a href="#" className="inline-flex items-center gap-2 rounded-full border-2 border-[#1e2364] bg-white px-[30px] py-4 text-[15px] font-semibold text-[#1e2364]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
