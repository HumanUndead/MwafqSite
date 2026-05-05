'use client'

import { RefObject, useEffect, useState } from 'react'

type ScrollCaptureOptions = {
  enabled: boolean
  distance: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getSectionTop(section: HTMLElement) {
  return section.getBoundingClientRect().top + window.scrollY
}

export function useSectionScrollCapture(
  sectionRef: RefObject<HTMLElement | null>,
  { enabled, distance }: ScrollCaptureOptions,
) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled || distance <= 0) return

    let frameId = 0

    function syncFromWindow() {
      const section = sectionRef.current
      if (!section) return

      const next = clamp(window.scrollY - getSectionTop(section), 0, distance)
      setProgress(prev => prev === next ? prev : next)
    }

    function requestSync() {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        syncFromWindow()
      })
    }

    requestSync()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
    }
  }, [distance, enabled, sectionRef])

  return { progress }
}
