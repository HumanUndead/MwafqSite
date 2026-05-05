'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSeconds(initialSeconds)
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [initialSeconds])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return { seconds, isRunning: seconds > 0, start }
}
