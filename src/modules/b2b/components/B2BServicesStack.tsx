'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/Button';
import type { Dictionary } from '@/locales/types';
import type { B2BServiceItem } from './B2BServiceCapabilityCard';
import { B2BServiceStackCard } from './B2BServiceStackCard';
import { B2BServicesStaticList } from './B2BServicesStaticList';
import { B2BSharedServiceDashboard } from './B2BSharedServiceDashboard';

/** Scroll length (in vh) reserved per card in the pinned deck. */
const VH_PER_CARD = 90;

interface Props {
  cards: B2BServiceItem[];
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
  sectionLabel: string;
}

export function B2BServicesStack({
  cards,
  content,
  isRtl,
  sectionLabel,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const count = cards.length;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Continuous active position in [0, count - 1].
  const position = useTransform(
    scrollYProgress,
    [0, 1],
    [0, Math.max(count - 1, 0.0001)]
  );

  // Subscribe to the derived integer index only — not the continuous value.
  useMotionValueEvent(position, 'change', (p) => {
    const next = Math.min(count - 1, Math.max(0, Math.round(p)));
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  // Snap-to-center: once scrolling settles inside the pinned deck, ease the
  // page to the nearest card's centered position so a card always lands fully
  // focused. Never fights an active scroll (any user input cancels an in-flight
  // snap), and only acts while the deck is actually pinned.
  useEffect(() => {
    if (prefersReducedMotion || count < 2) return;
    const el = trackRef.current;
    if (!el) return;

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;
    let programmatic = false;

    const snapToNearest = () => {
      const pinned = el.offsetHeight - window.innerHeight;
      if (pinned <= 0) return;
      const trackTop = el.getBoundingClientRect().top + window.scrollY;
      const progress = (window.scrollY - trackTop) / pinned;
      if (progress < 0 || progress > 1) return; // only while pinned
      const nearest = Math.round(progress * (count - 1));
      const target = Math.round(trackTop + pinned * (nearest / (count - 1)));
      if (Math.abs(target - window.scrollY) < 2) return; // already centered
      programmatic = true;
      window.scrollTo({ top: target, behavior: 'smooth' });
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        programmatic = false;
      }, 700);
    };

    const onScroll = () => {
      if (programmatic) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(snapToNearest, 130);
    };

    const cancelSnap = () => {
      programmatic = false;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', cancelSnap, { passive: true });
    window.addEventListener('touchmove', cancelSnap, { passive: true });
    window.addEventListener('keydown', cancelSnap);

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(releaseTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', cancelSnap);
      window.removeEventListener('touchmove', cancelSnap);
      window.removeEventListener('keydown', cancelSnap);
    };
  }, [prefersReducedMotion, count]);

  if (prefersReducedMotion) {
    return (
      <B2BServicesStaticList
        cards={cards}
        dashboard={content.dashboard}
        isRtl={isRtl}
        sectionLabel={sectionLabel}
      />
    );
  }

  const jumpTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const frac = count > 1 ? i / (count - 1) : 0;
    const trackTop = el.getBoundingClientRect().top + window.scrollY;
    const top = trackTop + (el.offsetHeight - window.innerHeight) * frac;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div
      ref={trackRef}
      className='relative'
      style={{ height: `${count * VH_PER_CARD}vh` }}
    >
      <div className='sticky top-28 grid h-[calc(100dvh-7rem)] min-h-[560px] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-center gap-12'>
        {/* LEFT — 3D card deck */}
        <div
          className='relative h-full'
          style={{ perspective: '1200px' }}
          aria-label={sectionLabel}
        >
          <StageGlow position={position} />
          <StackRail
            cards={cards}
            activeIndex={activeIndex}
            onJump={jumpTo}
            isRtl={isRtl}
          />
          {cards.map((item, index) => (
            <B2BServiceStackCard
              key={`${item.title}-${index}`}
              item={item}
              index={index}
              position={position}
              isActive={activeIndex === index}
              isRtl={isRtl}
            />
          ))}
        </div>

        {/* RIGHT — sticky dashboard preview */}
        <aside className='self-center' aria-live='polite' aria-atomic='true'>
          <B2BSharedServiceDashboard
            items={cards}
            activeIndex={activeIndex}
            dashboard={content.dashboard}
          />
        </aside>
      </div>
    </div>
  );
}

/** Soft brand glow behind the deck with subtle scroll parallax. */
function StageGlow({ position }: { position: MotionValue<number> }) {
  const y = useTransform(position, (p) => p * -22);

  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden'
    >
      <motion.div
        style={{ y }}
        className='h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(0,168,241,0.18),rgba(30,35,100,0.06)_45%,transparent_70%)] blur-2xl'
      />
    </div>
  );
}

/** Vertical progress rail — clickable, keyboard-accessible product jumps. */
function StackRail({
  cards,
  activeIndex,
  onJump,
  isRtl,
}: {
  cards: B2BServiceItem[];
  activeIndex: number;
  onJump: (index: number) => void;
  isRtl: boolean;
}) {
  return (
    <div
      className={cn(
        'absolute top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-1.5',
        isRtl ? 'right-0' : 'left-0'
      )}
    >
      {cards.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <Button
            key={`${item.title}-${index}`}
            type='button'
            variant='ghost'
            onClick={() => onJump(index)}
            aria-label={item.title}
            aria-current={isActive ? 'true' : undefined}
            className='group flex h-auto min-h-11 w-auto items-center justify-center rounded-full px-2 py-1 hover:bg-transparent'
          >
            <span
              aria-hidden='true'
              className={cn(
                'block w-1 rounded-full transition-all duration-300',
                isActive
                  ? 'h-7 bg-[#00a8f1]'
                  : 'h-3 bg-[#c0c3d4] group-hover:bg-[#1e2364]'
              )}
            />
          </Button>
        );
      })}
    </div>
  );
}
