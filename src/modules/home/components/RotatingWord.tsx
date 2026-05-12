'use client'

import { useEffect, useState } from 'react'

interface Props {
  words: readonly string[]
}

export function RotatingWord({ words }: Props) {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) {
      return
    }

    const timer = window.setInterval(() => {
      setWordIndex(current => (current + 1) % words.length)
    }, 1900)

    return () => window.clearInterval(timer)
  }, [words])

  const activeWord = words[wordIndex] ?? words[0]

  if (!activeWord) {
    return null
  }

  return (
    <span className="relative inline-flex min-w-[4.4ch] text-sky-500">
      <span
        key={`${activeWord}-${wordIndex}`}
        className="animate-[fadeWord_1.9s_ease-in-out_infinite] font-normal italic"
      >
        {activeWord}
      </span>
      <span className="ml-1 inline-block h-[0.9em] w-[0.08em] animate-[blink_0.8s_ease-in-out_infinite] rounded-full bg-sky-500" />
    </span>
  )
}
