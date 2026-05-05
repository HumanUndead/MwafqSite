/* eslint-disable @next/next/no-img-element */

import { GetLocale, getTranslations } from '@/i18n/server'
import { RotatingWord } from './components/RotatingWord'
import { CountUp } from './components/CountingUp'
import { WhySection } from './components/WhySection'
import { StepsSection } from './components/StepsSection'
import { BookingSection } from './components/BookingSection'

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M5 16l1.2-4.1A2 2 0 0 1 8.12 10.5h7.76a2 2 0 0 1 1.92 1.4L19 16" />
      <path d="M4 16h16v2.2a.8.8 0 0 1-.8.8H18a1 1 0 0 1-1-1V16H7v2a1 1 0 0 1-1 1H4.8a.8.8 0 0 1-.8-.8z" />
      <circle cx="8" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M4 20h16" /><path d="M7 20V6.8A1.8 1.8 0 0 1 8.8 5h6.4A1.8 1.8 0 0 1 17 6.8V20" />
      <path d="M10 9h.01M14 9h.01M10 12h.01M14 12h.01" /><path d="M11 20v-3h2v3" />
    </svg>
  )
}
function CertificateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M7 5.5h10A1.5 1.5 0 0 1 18.5 7v7A1.5 1.5 0 0 1 17 15.5H7A1.5 1.5 0 0 1 5.5 14V7A1.5 1.5 0 0 1 7 5.5Z" />
      <path d="M8.5 9.5h7M8.5 12h4.5" /><path d="M10 15.5v3l2-1.2 2 1.2v-3" />
    </svg>
  )
}
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <rect x="4" y="7" width="16" height="11" rx="2" />
      <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
      <path d="M4 12h16" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-[#00a8f1]" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  )
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={[
        'relative mb-7 inline-block px-[30px] py-3 text-[17px] font-bold uppercase leading-none tracking-[2.2px]',
        'before:absolute before:left-0 before:top-0 before:h-[18px] before:w-[18px] before:border-l-4 before:border-t-4 before:border-current',
        'after:absolute after:bottom-0 after:right-0 after:h-[18px] after:w-[18px] after:border-b-4 after:border-r-4 after:border-current',
        dark ? 'text-[#00a8f1]' : 'text-[#00a8f1]',
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export async function HomePage() {
  const locale = await GetLocale()
  const content = await getTranslations('home')
  const isRtl = locale === 'ar'
  const floatingCardSprite = '/demo-assets/icons%20and%20vector%20visuals.svg'

  const logos = ['logo01', 'logo03', 'logo04', 'logo05', 'logo06', 'logo07', 'logo08', 'logo09', 'logo10', 'logo11']
  const phoneTileStyles = [
    { card: 'bg-[#dff5ff]', icon: 'bg-white text-[#27a7e7]' },
    { card: 'bg-[#f1e8fb]', icon: 'bg-white text-[#8a48c7]' },
    { card: 'bg-[#e8fbf7]', icon: 'bg-white text-[#12b7a2]' },
    { card: 'bg-[#edf1ff]', icon: 'bg-white text-[#5d75d6]' },
  ]
  const phoneTileIcons = [CarIcon, BuildingIcon, CertificateIcon, BriefcaseIcon]

  const svcIcons = [
    <CarIcon key="car" />,
    <BuildingIcon key="building" />,
    <CertificateIcon key="cert" />,
    <BriefcaseIcon key="brief" />,
  ]
  const floatingCardMeta = [
    {
      wrapperClassName: 'right-0 top-[8%] animate-[floatSoft_5s_ease-in-out_infinite]',
      iconPosition: '-291px -621px',
    },
    {
      wrapperClassName: 'left-0 top-[46%] animate-[floatTilt_6s_ease-in-out_0.3s_infinite]',
      iconPosition: '-237px -429px',
    },
    {
      wrapperClassName: 'bottom-[8%] right-0 animate-[floatSoft_5.5s_ease-in-out_0.6s_infinite]',
      iconPosition: '-247px -664px',
    },
  ] as const

  return (
    <main className="overflow-x-hidden bg-[#eeeeef] text-[#1e2364]">

      {/* ============ HERO ============ */}
      <section
        id="home"
        className="relative overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-20 pt-[200px] md:px-7"
      >
        <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:24px_24px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-[60px] lg:grid-cols-[1.05fr_1fr]">

          {/* Left content */}
          <div className="-translate-y-10">
            <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border-2 border-[#e5e7f0] bg-white px-4 py-2 text-[13px] font-semibold tracking-[0.4px] text-[#1e2364]">
              <span className={`flex items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                <img src="/demo-assets/img1.jpg" alt="" className="h-[22px] w-[22px] rounded-full border-2 border-[#00a8f1] object-cover" />
                <img src="/demo-assets/img2.jpg" alt="" className="-mx-[11px] h-[22px] w-[22px] rounded-full border-2 border-[#742f88] object-cover" />
                <img src="/demo-assets/img3.jpg" alt="" className="h-[22px] w-[22px] rounded-full border-2 border-[#00dec9] object-cover" />
              </span>
              <span>{content.hero.badge}</span>
            </span>

            <h1 className="mb-7 text-[clamp(44px,6.5vw,92px)] font-extrabold leading-[1.05] tracking-[-2.6px] text-[#1e2364]">
              <span className="block whitespace-nowrap">
                {content.hero.titleLead}
              </span>
              <span className="block">
                {content.hero.titleMiddle}{' '}
                <RotatingWord />
              </span>
            </h1>

            <p className="mb-9 max-w-[540px] text-[17.5px] leading-[1.45] text-[#6b7196]">
              {content.hero.subtitle}
            </p>

            <div className="mb-11 flex flex-wrap gap-3.5">
              <a href="#booking" className="inline-flex items-center gap-2 rounded-full bg-[#1e2364] px-[30px] py-4 text-[15px] font-semibold text-white transition hover:bg-[#233567]">
                {content.hero.primaryCta}
                <ArrowIcon />
              </a>
              <a href="#app" className="inline-flex items-center gap-2 rounded-full border-2 border-[#1e2364] bg-white px-[30px] py-4 text-[15px] font-semibold text-[#1e2364] transition hover:-translate-y-0.5">
                {content.hero.secondaryCta}
              </a>
            </div>

            <div className="grid max-w-[560px] gap-[30px] border-t-2 border-[#e5e7f0] pt-9 sm:grid-cols-3">
              {content.hero.stats.map(stat => (
                <div key={stat.label}>
                  <div className="inline-flex items-baseline gap-0.5 text-[30px] font-extrabold leading-none tracking-[-1px] whitespace-nowrap text-[#1e2364]">
                    <CountUp
                      value={stat.value}
                      suffix={'suffix' in stat ? stat.suffix : undefined}
                      decimals={'decimals' in stat ? stat.decimals : undefined}
                    />
                  </div>
                  <p className="mt-1.5 text-[12.5px] font-medium tracking-[0.4px] text-[#6b7196]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right phone mockup */}
          <div className="relative mx-auto h-[560px] w-full max-w-[560px]">
            {content.hero.floatingCards.slice(0, 3).map((card, index) => (
              <div
                key={card?.title ?? index}
                className={`absolute z-[5] hidden items-center gap-[14px] rounded-[18px] border-2 border-[#1e2364] bg-white md:flex ${floatingCardMeta[index]?.wrapperClassName ?? ''}`}
                style={{ padding: '12px 18px 12px 12px' }}
              >
                <span
                  aria-hidden="true"
                  className="block h-[46px] w-[46px] flex-shrink-0 rounded-[12px] bg-[#fbfcff]"
                  style={{
                    backgroundImage: `url("${floatingCardSprite}")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '736px auto',
                    backgroundPosition: floatingCardMeta[index]?.iconPosition,
                  }}
                />
                <div className={isRtl ? 'text-right' : ''}>
                  <strong className="mt-1 block text-[17px] font-extrabold leading-[1.15] tracking-[-0.3px] text-[#1e2364]">
                    {card?.title}
                  </strong>
                  <span className="block text-[11px] text-[#6b7196]">
                    {card?.detail}
                  </span>
                </div>
              </div>
            ))}

            {/* Phone frame */}
            <div className="absolute left-1/2 top-1/2 h-[540px] w-[260px] animate-[phoneFloat_6s_ease-in-out_infinite] overflow-visible rounded-[42px] border-2 border-[#1e2364] bg-white shadow-[0_20px_60px_rgba(30,35,100,0.12)]">
              {/* Notch */}
              <div className="absolute left-1/2 top-[18px] z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-[14px] bg-[#1e2364]" />
              {/* Screen */}
              <div className="absolute inset-[14px] flex flex-col gap-[10px] overflow-hidden rounded-[36px] border-2 border-[#e5e7f0] bg-white px-[13px] pb-[14px] pt-6">
                {/* Header */}
                <div className="mt-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11.5px] font-medium leading-none text-[#6b7196]">{content.hero.phoneGreeting}</p>
                    <p className="mt-1.5 text-[17px] font-extrabold leading-none tracking-[-0.3px] text-[#1e2364]">{content.hero.phoneName}</p>
                  </div>
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-[11px] border-2 border-[#1e2364] bg-white text-[#1e2364]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="absolute right-[-3px] top-[-3px] h-2 w-2 rounded-full border-2 border-white bg-[#ff6b2b]" />
                  </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2.5 rounded-[12px] border-2 border-[#eef0f7] bg-[#f2f2f2] px-3.5 py-[11px] text-[12px] font-medium text-[#6b7196]">
                  <SearchIcon />
                  <span>{content.hero.phoneSearchPlaceholder}</span>
                </div>

                {/* Section header */}
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11.5px] font-extrabold tracking-[-0.1px] text-[#1e2364]">{content.hero.servicesTitle}</span>
                  <span className="text-[10px] font-semibold text-[#00a8f1]">{content.hero.servicesLink}</span>
                </div>

                {/* Tile grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {content.hero.phoneTiles.map((tile, index) => (
                    <div
                      key={tile.title}
                      className={`min-h-[96px] rounded-[18px] border-2 border-[#1e2364] p-3 pb-[11px] ${phoneTileStyles[index]?.card ?? 'bg-white'}`}
                    >
                      <div className={`mb-2 h-10 w-10 overflow-hidden rounded-[14px] flex items-center justify-center ${phoneTileStyles[index]?.icon ?? 'bg-white text-[#1e2364]'}`}>
                        <div className="[transform:scale(0.78)]">
                          {(() => { const TileIcon = phoneTileIcons[index] ?? CarIcon; return <TileIcon /> })()}
                        </div>
                      </div>
                      <p className="text-[11.5px] font-extrabold leading-[1.15] tracking-[-0.2px] text-[#1e2364]">{tile.title}</p>
                      <p className="mt-0.5 text-[9.5px] font-medium leading-[1.2] text-[#6b7196]">{tile.subtitle}</p>
                    </div>
                  ))}
                </div>

                {/* Live strip */}
                <div className="mt-auto flex items-center gap-2.5 rounded-[14px] bg-[#1e2364] px-3.5 py-[11px] text-white">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#00a8f1] animate-[phLivePulse_1.6s_ease-in-out_infinite] shadow-[0_0_0_3px_rgba(0,168,241,0.25)]" aria-hidden="true" />
                  <span className="flex flex-1 items-baseline gap-1.5">
                    <strong className="text-[14px] font-extrabold tracking-[-0.3px] text-[#00a8f1]">{content.hero.liveBookings}</strong>
                    <span className="text-[10.5px] opacity-85">{content.hero.liveBookingsLabel}</span>
                  </span>
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[8px] bg-white/[0.14]">
                    <ArrowIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <div className="relative flex h-[100px] items-center overflow-x-clip overflow-y-visible border-b-2 border-t-2 border-[#e5e7f0] bg-white">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center hover:[animation-play-state:paused]">
          {[...logos, ...logos].map((logo, i) => (
            <img
              key={i}
              src={`/demo-assets/logos/${logo}.svg`}
              alt={i < logos.length ? 'Partner logo' : ''}
              aria-hidden={i >= logos.length || undefined}
              className="mr-20 block h-[130px] w-auto flex-shrink-0 object-contain opacity-80 grayscale brightness-0 [filter:grayscale(1)_brightness(0)_invert(0.55)] transition-[opacity,transform,filter] duration-300 hover:opacity-100 hover:scale-[1.04] hover:[filter:grayscale(1)_brightness(0)_invert(0.35)]"
            />
          ))}
        </div>
      </div>

      {/* ============ SERVICES ============ */}
      <section id="services" className="relative px-4 py-[120px] md:px-7">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(30,35,100,0.05)_1px,transparent_1.2px)] [background-size:24px_24px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1320px]">
          <div className="mb-[60px] flex flex-wrap items-end justify-start gap-[50px]">
            <div>
              <Eyebrow>{content.services.eyebrow}</Eyebrow>
              <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]">
                {content.services.title.split('.')[0]}.<br />
                <span className="font-normal italic opacity-55">{content.services.title.split('.').slice(1).join('.').trim()}</span>
              </h2>
            </div>
          </div>

          <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {content.services.items.map((svc, i) => (
              <div
                key={svc.title}
                className="group relative rounded-[20px] bg-white p-[38px_28px_32px] transition-transform duration-300 hover:-translate-y-1.5 after:absolute after:bottom-0 after:right-0 after:h-0 after:w-0 after:rounded-[14px] after:bg-[#eeeeef] after:content-[''] after:[transform:translate(50%,50%)] after:transition-[width,height] after:duration-300 hover:after:h-24 hover:after:w-24"
              >
                <div className="absolute right-7 top-[38px]">
                  <div className="flex h-10 w-10 items-center justify-center">
                    {svcIcons[i]}
                  </div>
                </div>
                <h3 className="flex min-h-10 items-center pr-14 text-[20px] font-extrabold leading-[1.2] tracking-[-0.3px] text-[#1e2364]">
                  {svc.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.55] text-[#6b7196]">{svc.description}</p>
                <svg
                  className="absolute bottom-3.5 right-3.5 z-[3] h-[22px] w-[22px] text-[#1e2364] transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY MWAFQ (scroll-driven) ============ */}
      <WhySection />

      {/* ============ BOOKING ============ */}
      <BookingSection />

      {/* ============ STEPS ============ */}
      <StepsSection />

      {/* ============ APP SHOWCASE ============ */}
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
                  <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-white/85">{content.app.cards[0]?.title}</div>
                  <div className="mb-[18px] text-[20px] font-extrabold tracking-[-0.4px]">{content.app.cards[0]?.detail.split('·')[0]}</div>
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
                  <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-white/85">{content.app.cards[1]?.title}</div>
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
                  <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[1.2px] text-[#6b7196]">{content.app.cards[2]?.title}</div>
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
              <Eyebrow>{content.app.eyebrow}</Eyebrow>
              <h2 className="mb-7 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]">
                {content.app.title.split(',')[0]},<br />
                <span className="font-normal italic opacity-55">{content.app.title.split(',').slice(1).join(',').trim()}</span>
              </h2>
              <div className="flex flex-col gap-3.5 mt-7">
                {content.app.points.map(point => (
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

      {/* ============ ACADEMY (in stats-section wrapper — white, rounded top) ============ */}
      <section className="relative mt-20 overflow-hidden rounded-t-[60px] bg-white pb-[50px] pt-[90px]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(30,35,100,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,100,0.035)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.18]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1320px] px-4 md:px-7">
          <div className="mb-[60px] flex flex-wrap items-end justify-start gap-[50px]">
            <div>
              <Eyebrow>{content.academy.eyebrow}</Eyebrow>
              <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]">
                {content.academy.title.split('.')[0]}.<br />
                <span className="text-[#00a8f1]">{content.academy.title.split('.').slice(1).join('.').trim()}</span>
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.academy.items.map((course, i) => (
              <div
                key={course.title}
                className="group relative overflow-hidden rounded-[4px_28px_4px_28px] border-2 border-[#e5e7f0] bg-white px-[30px] pb-8 pt-[54px] transition-all duration-400 hover:-translate-y-1 hover:bg-[#fbfcff] before:absolute before:left-0 before:top-0 before:h-2.5 before:origin-left before:scale-x-0 before:bg-[#00a8f1] before:content-[''] before:[left:30px] before:[right:0] before:transition-transform before:duration-500 hover:before:scale-x-100 after:absolute after:bottom-0 after:left-0 after:top-[30px] after:w-2.5 after:origin-top after:scale-y-0 after:bg-[#00a8f1] after:content-[''] after:transition-transform after:duration-500 hover:after:scale-y-100"
              >
                {/* Sky-blue corner bracket */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 z-[2] h-[30px] w-[30px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`,
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <div className="mb-[18px] flex items-center gap-3.5">
                  <div className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-[14px_4px_14px_4px] border-2 border-[#e5e7f0] bg-[#fbfcff] group-hover:border-[#00a8f1]">
                    {i === 0 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1e2364" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    ) : i === 1 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1e2364" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1e2364" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M7 5.5h10A1.5 1.5 0 0 1 18.5 7v7A1.5 1.5 0 0 1 17 15.5H7A1.5 1.5 0 0 1 5.5 14V7A1.5 1.5 0 0 1 7 5.5Z"/><path d="M8.5 9.5h7M8.5 12h4.5"/><path d="M10 15.5v3l2-1.2 2 1.2v-3"/></svg>
                    )}
                  </div>
                  <span className={`rounded-full border-2 px-3 py-[5px] text-[11px] font-bold uppercase tracking-[0.5px] ${i === 2 ? 'border-transparent bg-[rgba(217,116,60,0.14)] text-[#a65528]' : 'border-[#00a8f1] bg-white text-[#00a8f1]'}`}>
                    {course.meta}
                  </span>
                </div>
                <div className="mb-2.5 min-h-[46px] text-[18px] font-bold leading-[1.3] tracking-[-0.3px] text-[#1e2364]">{course.title}</div>
                <div className="mb-5 min-h-16 text-[13.5px] leading-[1.6] text-[#6b7196]">{course.detail}</div>
                <div className="flex items-center justify-between border-t-2 border-[#e5e7f0] pt-4">
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1e2364]">
                    <StarIcon />
                    4.8 <span className="font-medium text-[#6b7196]">(12)</span>
                  </div>
                  <a href="#" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#00a8f1] transition-[gap] duration-300 group-hover:gap-3">
                    Enroll →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS (in academy-section wrapper) ============ */}
      <section id="academy" className="relative bg-white px-4 pb-[50px] pt-[70px] md:px-7">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(30,35,100,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,100,0.035)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.18]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,transparent_47%,rgba(30,35,100,0.18)_47%,rgba(30,35,100,0.18)_53%,transparent_53%),linear-gradient(-45deg,transparent_47%,rgba(30,35,100,0.18)_47%,rgba(30,35,100,0.18)_53%,transparent_53%)] [background-size:30px_30px] [mask-image:linear-gradient(180deg,transparent_0%,#000_50%,transparent_100%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1320px]">
          <h2 className="relative z-10 mx-auto mb-9 text-center text-[clamp(28px,3.6vw,44px)] font-extrabold uppercase leading-[1.05] tracking-[-0.5px] text-[#1e2364]">
            {content.stats.title}
          </h2>
          <div className="relative z-10 grid gap-8 px-7 pt-[60px] sm:grid-cols-2 lg:grid-cols-4">
            {content.stats.items.map((stat, i) => (
              <div key={stat.label} className="px-6 py-[18px] text-center">
                <div className="text-[60px] font-extrabold leading-none tracking-[-2px] text-[#00a8f1]">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-3.5 text-[14.5px] font-bold tracking-[0.5px] text-[#1e2364]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ B2B ============ */}
      <section
        id="b2b"
        className="relative overflow-hidden border-t-2 border-[#e5e7f0] px-4 py-[140px] text-white md:px-7"
        style={{ background: 'radial-gradient(circle at 80% 25%, rgba(0,168,241,0.42), transparent 45%), radial-gradient(circle at 18% 78%, rgba(116,47,136,0.45), transparent 45%), radial-gradient(circle at 50% 60%, rgba(35,53,103,0.25), transparent 50%), #1e2364' }}
      >
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1.2px,transparent_1.2px)] [background-size:24px_24px]" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1320px]">
          <div className="grid items-center gap-20 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Eyebrow dark>{content.business.eyebrow}</Eyebrow>
              <h2 className="mb-7 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-white">
                {content.business.title.split(',')[0]},<br />
                <span className="font-normal italic text-white/55">{content.business.title.split(',').slice(1).join(',').trim()}</span>
              </h2>
              <p className="mb-7 text-[16px] leading-[1.65] text-white/82">{content.business.body}</p>
              <ul className="mb-8 flex flex-col gap-3.5">
                {content.business.points.map(point => (
                  <li key={point} className="flex items-center gap-3.5 text-[15.5px] text-white/92">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0 text-[#00dec9]" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3.5">
                <a href="#" className="inline-flex items-center gap-2 rounded-full bg-[#00a8f1] px-[30px] py-4 text-[14.5px] font-semibold text-white transition hover:bg-[#0090d1]">
                  {content.business.primaryCta}
                </a>
                <a href="#" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-transparent px-[30px] py-4 text-[14.5px] font-semibold text-white transition hover:border-white/60">
                  {content.business.secondaryCta}
                </a>
              </div>
            </div>

            {/* Dashboard card */}
            <div className="rounded-[32px_4px_32px_4px] border-2 border-[#e5e7f0] bg-white p-[30px] text-[#1e2364]">
              {/* Tabs */}
              <div className="mb-[22px] w-fit rounded-full bg-[#f2f2f2] p-[5px]">
                {['Overview', 'Employees', 'Reports'].map((tab, i) => (
                  <button key={tab} type="button" className={`rounded-full px-4 py-2 text-[12px] font-semibold ${i === 0 ? 'bg-white text-[#1e2364]' : 'bg-transparent text-[#6b7196]'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Metrics */}
              <div className="mb-[22px] grid grid-cols-3 gap-3.5">
                {content.business.metrics.map((m, i) => (
                  <div key={m.label} className="rounded-[16px_4px_16px_4px] border-2 border-[#e5e7f0] bg-white p-[18px]">
                    <div className={`text-[26px] font-extrabold leading-none tracking-[-1px] ${i === 0 ? 'text-[#1e2364]' : i === 1 ? 'text-[#00dec9]' : 'text-[#d9743c]'}`}>{m.value}</div>
                    <div className="mt-1.5 text-[12px] text-[#6b7196]">{m.label}</div>
                    <div className="mt-2.5 flex h-[30px] items-end gap-[3px]">
                      {[30, 55, 40, 80, 60, 90, 70].map((h, j) => (
                        <div key={j} className="flex-1 rounded-t-[3px]" style={{ height: `${h}%`, background: i === 1 ? '#00dec9' : i === 2 ? '#EBA277' : '#00a8f1' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Employee rows */}
              {content.business.employees.map(emp => {
                const statusClass = emp.status === 'Completed'
                  ? 'border-transparent bg-[rgba(0,222,201,0.14)] text-[#00867a]'
                  : emp.status === 'In Progress'
                  ? 'border-transparent bg-[rgba(217,116,60,0.14)] text-[#a65528]'
                  : 'border-transparent bg-[rgba(111,143,207,0.16)] text-[#4a6cb8]'
                return (
                  <div key={emp.name} className="mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#e5e7f0] bg-white px-3.5 py-[11px]">
                    <div className="h-[38px] w-[38px] flex-shrink-0 rounded-full bg-[#f2f3f7]" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <strong className="block text-[13px] font-bold tracking-[-0.2px] text-[#1e2364]">{emp.name}</strong>
                      <span className="text-[11px] text-[#6b7196]">{emp.exam}</span>
                    </div>
                    <span className={`rounded-full border-2 px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.4px] ${statusClass}`}>
                      {emp.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL ============ */}
      <section className="relative overflow-hidden bg-white py-[265px_0_140px] pb-[140px] pt-[265px]">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(#eef0f7_1px,transparent_1px),linear-gradient(90deg,#eef0f7_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1320px] px-4 md:px-7">
          <div className="relative z-10 mx-auto max-w-[980px] text-center">
            <div className="mb-9 text-[clamp(26px,3.5vw,44px)] font-light italic leading-[1.3] tracking-[-1px] text-[#1e2364]">
              {content.testimonial.quote}{' '}
              <em className="not-italic font-semibold text-[#00a8f1]">{content.testimonial.highlight}</em>
            </div>
            <div className="inline-flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-full bg-[#f2f3f7]" aria-hidden="true" />
              <div className="text-left">
                <strong className="block text-[14.5px] text-[#1e2364]">{content.testimonial.author}</strong>
                <span className="text-[13px] text-[#6b7196]">{content.testimonial.role}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#1e2364] px-[60px] py-[100px] text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:26px_26px] [mask-image:radial-gradient(circle_at_50%_50%,transparent_25%,#000_75%)]"
        />
        <h2 className="relative z-10 mb-[22px] text-[clamp(34px,5vw,64px)] font-extrabold leading-[1.04] tracking-[-1.8px] text-white">
          {content.finalCta.title.split('?')[0]}?<br />
          <em className="font-normal not-italic italic text-[#00a8f1]/95">{content.finalCta.title.split('?')[1]}</em>
        </h2>
        <p className="relative z-10 mx-auto mb-9 max-w-[560px] text-[16.5px] text-white/78">{content.finalCta.body}</p>
        <div className="relative z-10 flex flex-wrap justify-center gap-3.5">
          <a href="#booking" className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-[30px] py-4 text-[15px] font-semibold text-[#1e2364] transition hover:bg-[#00a8f1] hover:border-[#00a8f1] hover:text-white">
            {content.finalCta.primary}
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-transparent px-[30px] py-4 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#1e2364]">
            {content.finalCta.secondary}
          </a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="contact" className="bg-[#eeeeef] px-4 pb-7 pt-[80px] md:px-7">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-[50px] grid gap-[60px] border-b border-[#1e2364]/10 pb-0 xl:grid-cols-[2.6fr_1fr_1fr_1.4fr]">
            <div className="flex flex-col">
              <img src="/demo-assets/logo.svg" alt="Mwafq" className="h-20 w-auto" />
              <p className="mt-4 max-w-none text-[14.5px] font-medium leading-[1.55] text-[rgba(30,35,100,0.78)]">{content.footer.body}</p>
            </div>

            <div className="flex flex-col ml-0 xl:ml-[150px]">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]">{content.footer.pages}</h3>
              <ul className="mt-5 space-y-3 text-sm text-[rgba(30,35,100,0.78)]">
                {content.footer.links.map((link, i) => (
                  <li key={link}>
                    <a href={['#home', '#services', '#academy', '#b2b'][i]} className="whitespace-nowrap transition hover:text-[#00a8f1]">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col xl:ml-[70px]">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]">{content.footer.help}</h3>
              <ul className="mt-5 space-y-3 text-sm text-[rgba(30,35,100,0.78)]">
                {content.footer.helpLinks.map(link => (
                  <li key={link}>
                    <a href="#contact" className="transition hover:text-[#00a8f1]">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e2364]">{content.footer.contact}</h3>
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
              <p className="mt-auto pt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(30,35,100,0.5)]">{content.footer.latest}</p>
              <div className="mt-3 flex w-full max-w-[360px] items-end gap-3 border-b border-[rgba(30,35,100,0.22)] pb-1.5 transition-[border-color] focus-within:border-[#00a8f1]">
                <input
                  type="email"
                  placeholder={content.footer.emailPlaceholder}
                  className="h-[38px] flex-1 min-w-0 border-0 bg-transparent text-[15px] text-[#1e2364] outline-none placeholder:font-medium placeholder:text-[rgba(30,35,100,0.42)]"
                />
                <button type="button" className="inline-flex h-[38px] flex-shrink-0 items-center justify-center bg-transparent text-[22px] font-bold text-[#00a8f1] transition-transform hover:translate-x-1" aria-label={content.footer.subscribe}>
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6 text-[13px] text-[rgba(30,35,100,0.55)] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Mwafq. {content.footer.rights}</p>
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
    </main>
  )
}
