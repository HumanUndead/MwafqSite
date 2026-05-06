/* eslint-disable @next/next/no-img-element */

import type { Dictionary } from '@/locales/types'

interface Props {
  content: Dictionary['home']['footer']
}

export function FooterSection({ content }: Props) {
  return (
    <footer id="contact" className="bg-[#eeeeef] px-4 pb-7 pt-[80px] md:px-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-[50px] grid gap-[60px] border-b border-[#1e2364]/10 pb-0 xl:grid-cols-[2.6fr_1fr_1fr_1.4fr]">
          <div className="flex flex-col">
            <img src="/demo-assets/logo.svg" alt="Mwafq" className="h-20 w-auto" />
            <p className="mt-4 max-w-none text-[14.5px] font-medium leading-[1.55] text-[rgba(30,35,100,0.78)]">{content.body}</p>
          </div>

          <div className="flex flex-col ml-0 xl:ml-[150px]">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]">{content.pages}</h3>
            <ul className="mt-5 space-y-3 text-sm text-[rgba(30,35,100,0.78)]">
              {content.links.map((link, i) => (
                <li key={link}>
                  <a href={(['#home', '#services', '#academy', '#b2b'] as const)[i]} className="whitespace-nowrap transition hover:text-[#00a8f1]">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col xl:ml-[70px]">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]">{content.help}</h3>
            <ul className="mt-5 space-y-3 text-sm text-[rgba(30,35,100,0.78)]">
              {content.helpLinks.map(link => (
                <li key={link}>
                  <a href="#contact" className="transition hover:text-[#00a8f1]">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]">{content.contact}</h3>
            <div className="mt-5 flex flex-col gap-3 text-[14.5px] font-medium text-[rgba(30,35,100,0.78)]">
              {[['info@mwafq.com', 'M'], ['+966 5 400000', 'P'], ['Riyadh - KSA', 'L']].map(([val, type]) => (
                <div key={val} className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00a8f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                    {type === 'M' ? <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></> : type === 'P' ? <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.17 3.38 2 2 0 0 1 3.15 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l1.27-.64a2 2 0 0 1 2.11.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></> : <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
                  </svg>
                  <span>{val}</span>
                </div>
              ))}
            </div>
            <p className="mt-auto pt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(30,35,100,0.5)]">{content.latest}</p>
            <div className="mt-3 flex w-full max-w-[360px] items-end gap-3 border-b border-[rgba(30,35,100,0.22)] pb-1.5 transition-[border-color] focus-within:border-[#00a8f1]">
              <input
                type="email"
                placeholder={content.emailPlaceholder}
                className="h-[38px] flex-1 min-w-0 border-0 bg-transparent text-[15px] text-[#1e2364] outline-none placeholder:font-medium placeholder:text-[rgba(30,35,100,0.42)]"
              />
              <button type="button" className="inline-flex h-[38px] flex-shrink-0 items-center justify-center bg-transparent text-[22px] font-bold text-[#00a8f1] transition-transform hover:translate-x-1" aria-label={content.subscribe}>
                →
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[13px] text-[rgba(30,35,100,0.55)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Mwafq. {content.rights}</p>
          <div className="flex items-center gap-2">
            {[
              <><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></>,
              <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
              <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
            ].map((path, i) => (
              <a
                key={i}
                href="#contact"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(30,35,100,0.14)] bg-white text-[#1e2364] transition hover:-translate-y-0.5 hover:bg-[#1e2364] hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                  {path}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
