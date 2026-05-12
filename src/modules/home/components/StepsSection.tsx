'use client'

import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/i18n/config'
import type { HomeStepsContent } from '../home.types'
import { CmsLink } from './CmsLink'

const INITIAL_OFFSET = 200
const END_HOLD = 500
const EXTRA_LIFT = 100

interface StepsSectionProps {
  locale: Locale
  content: HomeStepsContent
}

export function StepsSection({ locale, content }: StepsSectionProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [sceneDistance, setSceneDistance] = useState(0)

  useEffect(() => {
    function syncViewport() {
      setIsDesktop(window.innerWidth > 980)
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)

    return () => {
      window.removeEventListener('resize', syncViewport)
    }
  }, [])

  useEffect(() => {
    let sectionTop = 0
    let scrollDistance = 0
    let endTranslate = 0
    let frameId = 0
    let timeoutId = 0

    function measure() {
      const stage = stageRef.current
      const list = listRef.current
      const viewport = viewportRef.current
      if (!stage || !list || !viewport) return

      const desktop = window.innerWidth > 980
      list.style.transform = ''
      stage.style.height = ''

      if (!desktop) {
        setSceneDistance(0)
        return
      }

      const viewportHeight = window.innerHeight
      const needed = Math.max(list.scrollHeight - viewport.offsetHeight, 0) + EXTRA_LIFT
      endTranslate = -needed
      scrollDistance = INITIAL_OFFSET + needed + END_HOLD
      stage.style.height = `${viewportHeight + scrollDistance}px`
      sectionTop = stage.getBoundingClientRect().top + window.scrollY
      setSceneDistance(scrollDistance)
    }

    function update() {
      const list = listRef.current
      if (!list) return

      if (window.innerWidth <= 980) {
        list.style.transform = ''
        return
      }

      const scrolled = Math.min(Math.max(window.scrollY - sectionTop, 0), scrollDistance)
      const translate = Math.max(INITIAL_OFFSET - scrolled, endTranslate)
      list.style.transform = `translate3d(0, ${translate}px, 0)`
    }

    function requestUpdate() {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        update()
      })
    }

    function handleResize() {
      measure()
      update()
    }

    measure()
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', handleResize)
    timeoutId = window.setTimeout(() => {
      measure()
      update()
    }, 800)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', handleResize)
      window.clearTimeout(timeoutId)
    }
  }, [])

  const steps = content.items.map((step, index) => ({
    num: String(index + 1).padStart(2, '0'),
    ...step,
  }))

  return (
    <section id="how" className="relative p-0">
      <div
        ref={stageRef}
        className="relative"
        style={{ height: isDesktop && sceneDistance > 0 ? `calc(100vh + ${sceneDistance}px)` : undefined }}
      >
        <div className={isDesktop ? 'sticky top-0 flex h-screen items-center overflow-hidden' : 'flex min-h-screen items-center overflow-hidden'}>
          <div className="w-full py-9">
            <div className="mx-auto max-w-[1320px] px-7">
              <div className="grid grid-cols-2 items-center gap-20">
                <div>
                  <span className="relative mb-7 inline-block px-[30px] py-3 text-[17px] font-bold uppercase leading-none tracking-[2.2px] text-[#00a8f1] before:absolute before:left-0 before:top-0 before:h-[18px] before:w-[18px] before:border-l-4 before:border-t-4 before:border-current after:absolute after:bottom-0 after:right-0 after:h-[18px] after:w-[18px] after:border-b-4 after:border-r-4 after:border-current">
                    {content.eyebrow}
                  </span>
                  <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]">
                    {content.title}
                    <br />
                    <span className="text-[#00a8f1]">{content.highlight}</span>
                  </h2>
                  <CmsLink
                    locale={locale}
                    href={content.cta.path}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1e2364] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#233567]"
                  >
                    {content.cta.label}
                  </CmsLink>
                </div>

                <div ref={viewportRef} className="relative max-h-[78vh] overflow-hidden">
                  <div ref={listRef} className="flex flex-col gap-[18px] [will-change:transform]">
                    {steps.map(step => (
                      <div
                        key={step.num}
                        className="relative overflow-hidden rounded-[22px] border-2 border-[#e5e7f0] bg-white px-12 py-12 transition-all duration-400 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:origin-top before:scale-y-0 before:bg-[#00a8f1] before:transition-transform before:duration-500 hover:border-[#1e2364] hover:before:scale-y-100"
                      >
                        <div className="flex items-start gap-6">
                          <div className="min-w-[96px] text-[64px] font-light italic leading-none text-[rgba(30,35,100,0.3)] transition-colors duration-400">
                            {step.num}
                          </div>
                          <div>
                            <h3 className="mb-3.5 text-[27px] font-bold tracking-[-0.4px] text-[#1e2364]">
                              {step.title}
                            </h3>
                            <p className="text-[16.5px] leading-[1.65] text-[#6b7196]">
                              {step.body}
                            </p>
                            <div className="mt-[18px] flex items-center gap-[22px] border-t-[1.5px] border-[#e5e7f0] pt-[18px] text-[14.5px] text-[#6b7196]">
                              <span><b className="font-bold text-[#1e2364]">{step.meta1.value}</b> {step.meta1.label}</span>
                              <span><b className="font-bold text-[#1e2364]">{step.meta2.value}</b> {step.meta2.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
