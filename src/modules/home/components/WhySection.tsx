'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from '@/i18n/DictionaryProvider'
import { useSectionScrollCapture } from './useSectionScrollCapture'

function EcgIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-11 w-11">
      <path d="M2 22h8l4-12 6 20 4-11 3 7h15" />
      <circle cx="40" cy="22" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-11 w-11">
      <path d="M10 6h16l6 6v28H10z" />
      <path d="M16 20h12M16 26h12M16 32h7" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-11 w-11">
      <path d="M22 4l14 5v12c0 9-6.5 14.5-14 17C8 35 2 30 2 21V9z" />
      <polyline points="14 22 20 28 30 18" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-11 w-11">
      <polyline points="36 8 36 18 26 18" />
      <path d="M36 18A14 14 0 1 0 32 32" />
    </svg>
  )
}

const ICONS = [EcgIcon, DocIcon, ShieldIcon, RefreshIcon]
const CARD_W = 96
const GAP = 26
const TITLE_W = 220
const STEP_SCROLL_DISTANCE = 320
const SCENE_DISTANCE = STEP_SCROLL_DISTANCE * 4

function getPositions(active: number) {
  const step = CARD_W + GAP
  const titleX = (active + 1) * step
  const cards = [0, 1, 2, 3].map(i => {
    if (i <= active) return i * step
    return titleX + TITLE_W + GAP + (i - active - 1) * step
  })

  return { cards, title: titleX }
}

export function WhySection() {
  const content = useTranslations('home')
  const stageRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const { progress } = useSectionScrollCapture(stageRef, {
    enabled: isDesktop,
    distance: SCENE_DISTANCE,
  })

  useEffect(() => {
    function syncViewport() {
      setIsDesktop(window.innerWidth > 880)
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => {
      window.removeEventListener('resize', syncViewport)
    }
  }, [])

  const normalized = isDesktop ? Math.max(0, Math.min(progress, SCENE_DISTANCE)) : 0
  const raw = normalized / STEP_SCROLL_DISTANCE
  const activeIdx = isDesktop
    ? normalized >= SCENE_DISTANCE
      ? 3
      : Math.min(3, Math.floor(raw))
    : 0
  const subProgress = isDesktop
    ? normalized >= SCENE_DISTANCE
      ? 1
      : Math.min(1, raw - activeIdx)
    : 1
  const positions = getPositions(activeIdx)
  const rowW = 4 * CARD_W + 4 * GAP + TITLE_W

  return (
    <section className="relative border-t-2 border-[#e5e7f0] bg-[#f4f4f6] p-0">
      <div
        ref={stageRef}
        className="relative"
        style={{ height: isDesktop ? `calc(100vh + ${SCENE_DISTANCE}px)` : undefined }}
      >
        <div className={isDesktop ? 'sticky top-0 flex h-screen min-h-[600px] items-center justify-center overflow-hidden' : 'flex min-h-screen items-center justify-center overflow-hidden'}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.42]"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 700' fill='none' stroke='%23d3d6e1' stroke-width='1'%3E%3Cellipse cx='800' cy='720' rx='220' ry='90'/%3E%3Cellipse cx='800' cy='720' rx='320' ry='130'/%3E%3Cellipse cx='800' cy='720' rx='430' ry='170'/%3E%3Cellipse cx='800' cy='720' rx='550' ry='215'/%3E%3Cellipse cx='800' cy='720' rx='680' ry='265'/%3E%3Cellipse cx='800' cy='720' rx='820' ry='320'/%3E%3Cellipse cx='800' cy='720' rx='970' ry='380'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center 75%',
              backgroundSize: '1700px auto',
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-[1320px] px-7">
            <h2 className="mb-9 text-center text-[clamp(28px,3.6vw,44px)] font-extrabold uppercase tracking-[-0.5px] text-[#1e2364]">
              {content.why.eyebrow}
            </h2>

            <div className="flex flex-col items-center gap-7 pb-2.5 pt-7">
              <div
                className="relative max-w-full"
                style={{ height: CARD_W, width: rowW }}
              >
                {[0, 1, 2, 3].map(i => {
                  const Icon = ICONS[i]!
                  const isActive = i === activeIdx

                  return (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        const stage = stageRef.current
                        if (!isDesktop || !stage) return

                        const stageTop = stage.getBoundingClientRect().top + window.scrollY
                        const target = stageTop + ((i + 0.5) / ICONS.length) * SCENE_DISTANCE
                        window.scrollTo({ top: Math.round(target), behavior: 'smooth' })
                      }}
                      className={[
                        'absolute left-0 top-0 flex h-24 w-24 items-center justify-center rounded-[24px] border-2 bg-white transition-[transform,border-color] duration-700',
                        isActive
                          ? 'border-[#1e2364] -translate-y-1.5 scale-[1.06]'
                          : 'border-[#e5e7f0] hover:border-[#6f8fcf]',
                        'text-[#1e2364]',
                      ].join(' ')}
                      style={{
                        transform: `translateX(${positions.cards[i]}px)${isActive ? ' translateY(-6px) scale(1.06)' : ''}`,
                        transition: 'transform 0.7s ease-in-out, border-color 0.7s ease-in-out',
                      }}
                    >
                      <Icon />
                    </button>
                  )
                })}

                <div
                  className="absolute left-0 top-0 flex h-24 items-center"
                  style={{ width: TITLE_W, transform: `translateX(${positions.title}px)`, transition: 'transform 0.7s ease-in-out' }}
                >
                  <div className="relative h-9 w-full overflow-hidden">
                    {content.why.items.map((item, i) => (
                      <span
                        key={i}
                        className="absolute inset-0 flex items-center whitespace-nowrap text-[22px] leading-none font-extrabold text-[#1e2364]"
                        style={{
                          transform: i === activeIdx ? 'translateX(0)' : 'translateX(-120%)',
                          transition: i === activeIdx ? 'transform 0.42s ease-out 0.35s' : 'transform 0.32s ease-in',
                        }}
                      >
                        {item.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex w-full max-w-[420px] gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map(i => {
                  const fill = i < activeIdx ? 1 : i === activeIdx ? Math.max(0, Math.min(1, subProgress)) : 0
                  return (
                    <div key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[rgba(30,35,100,0.12)]">
                      <div
                        className="absolute inset-0 origin-left rounded-full bg-[#1e2364]"
                        style={{ transform: `scaleX(${fill})`, transition: 'transform 0.15s linear' }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
