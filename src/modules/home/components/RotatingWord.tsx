'use client'
  
import { useLocale, useTranslations } from "@/i18n/DictionaryProvider"
import { useEffect, useState } from "react"


export function RotatingWord() {
  const [wordIndex, setWordIndex] = useState(0)
  const content = useTranslations('home')
  const locale = useLocale()
  

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWordIndex(current => (current + 1) % content.hero.rotatingWords.length)
    }, 1900)

    return () => window.clearInterval(timer)
  }, [content.hero.rotatingWords.length])

  return <span className="relative inline-flex min-w-[4.4ch] text-sky-500">
                  <span key={`${locale}-${wordIndex}`} className="animate-[fadeWord_1.9s_ease-in-out_infinite] font-normal italic">
                    {content.hero.rotatingWords[wordIndex]}
                  </span>
                  <span className="ml-1 inline-block h-[0.9em] w-[0.08em] animate-[blink_0.8s_ease-in-out_infinite] rounded-full bg-sky-500" />
                </span>;
}