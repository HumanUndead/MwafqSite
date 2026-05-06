import { buttonVariants } from '@/shared/lib/variants'
import type { Dictionary } from '@/locales/types'

interface Props {
  content: Dictionary['home']['finalCta']
}

export function CtaSection({ content }: Props) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#1e2364] px-[60px] py-[100px] text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] [background-size:26px_26px] [mask-image:radial-gradient(circle_at_50%_50%,transparent_25%,#000_75%)]"
      />
      <h2 className="relative z-10 mb-[22px] text-[clamp(34px,5vw,64px)] font-extrabold leading-[1.04] tracking-[-1.8px] text-white">
        {content.title.split('?')[0]}?<br />
        <em className="font-normal not-italic italic text-[#00a8f1]/95">{content.title.split('?')[1]}</em>
      </h2>
      <p className="relative z-10 mx-auto mb-9 max-w-[560px] text-[16.5px] text-white/78">{content.body}</p>
      <div className="relative z-10 flex flex-wrap justify-center gap-3.5">
        <a href="#booking" className={buttonVariants({ variant: 'brandInverse', size: 'hero', shape: 'pill' })}>
          {content.primary}
        </a>
        <a href="#contact" className={buttonVariants({ variant: 'brandGhost', size: 'hero', shape: 'pill' })}>
          {content.secondary}
        </a>
      </div>
    </section>
  )
}
