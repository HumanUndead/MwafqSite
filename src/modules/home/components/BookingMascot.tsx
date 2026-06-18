'use client';

import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { isRtl, type Locale } from '@/i18n/config';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/Button';

// Box size in px — drives both the rendered size (via style) and the
// center-based positioning math, so the two can never drift apart.
const W = 100;
const H = 170;
// Parked = small companion at the side; docked = full size on the card.
const PARK_SCALE = 0.62;
const DOCK_SCALE = 1;
const PARK_MARGIN = 24; // gap from the viewport side while parked
const SPRING = { stiffness: 200, damping: 30, mass: 0.6 };

interface BookingMascotProps {
  locale: Locale;
  /** The booking card the mascot grows and docks onto. */
  cardRef: RefObject<HTMLDivElement | null>;
  /** Accessible name for the click-to-scroll action. */
  label: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export function BookingMascot({ locale, cardRef, label }: BookingMascotProps) {
  const rtl = isRtl(locale);
  const reduced = useReducedMotion();
  // Starts false (so SSR + first render emit nothing) and only flips true
  // client-side via the matchMedia subscription below — gates the portal too.
  const [enabled, setEnabled] = useState(false); // desktop (xl) only

  // Base values are driven by scroll; springs smooth the entrance + dock.
  // Start off-screen so the first paint (incl. reduced-motion, which skips the
  // fade) never flashes the mascot at the origin before positioning runs.
  const xBase = useMotionValue(-9999);
  const yBase = useMotionValue(0);
  const sBase = useMotionValue(PARK_SCALE);
  const oBase = useMotionValue(0);
  const x = useSpring(xBase, SPRING);
  const y = useSpring(yBase, SPRING);
  const scale = useSpring(sBase, SPRING);
  const opacity = useSpring(oBase, { stiffness: 80, damping: 20 });

  // Only run on xl+, mirroring the original desktop-only mascot.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const parkCenterX = () =>
      rtl
        ? window.innerWidth - PARK_MARGIN - (W * PARK_SCALE) / 2
        : PARK_MARGIN + (W * PARK_SCALE) / 2;
    const parkCenterY = () => window.innerHeight * 0.42;

    // Position by the mascot's CENTER (Framer scales about center), so the
    // math stays symmetric for LTR/RTL.
    const compute = () => {
      const card = cardRef.current;
      let cx = parkCenterX();
      let cy = parkCenterY();
      let sc = PARK_SCALE;

      if (card) {
        const rect = card.getBoundingClientRect();
        const startAt = window.innerHeight * 0.95; // begin docking
        const endAt = window.innerHeight * 0.3; // fully docked
        const p = clamp((startAt - rect.top) / (startAt - endAt), 0, 1);
        const eased = p * p * (3 - 2 * p); // smoothstep

        // Dock onto the card's start-side top corner (flips with language).
        const dockX = rtl ? rect.right - 30 : rect.left + 30;
        const dockY = rect.top + 70;

        cx = lerp(parkCenterX(), dockX, eased);
        cy = lerp(parkCenterY(), dockY, eased);
        sc = lerp(PARK_SCALE, DOCK_SCALE, eased);
      }

      xBase.set(cx - W / 2);
      yBase.set(cy - H / 2);
      sBase.set(sc);
    };

    // Entrance: start off the start-side edge, then slide to the parked spot.
    x.jump(rtl ? window.innerWidth + W : -W * 2);
    y.jump(parkCenterY() - H / 2);
    scale.jump(PARK_SCALE);
    compute();
    oBase.set(1);

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        compute();
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, rtl]);

  if (!enabled) return null;

  const goToBooking = () => {
    const el = document.getElementById('booking');
    if (!el) return;
    // Offset so the section lands clear of the fixed header (~110px tall).
    const headerOffset = 120;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };

  return createPortal(
    <motion.div
      style={{
        width: W,
        height: H,
        x: reduced ? xBase : x,
        y: reduced ? yBase : y,
        scale: reduced ? sBase : scale,
        opacity: reduced ? 1 : opacity,
      }}
      className='pointer-events-none fixed left-0 top-0 z-100 will-change-transform'
    >
      <div
        className={cn(
          'relative h-full w-full',
          !reduced &&
            'animate-[mascotFloat_7s_cubic-bezier(0.45,0,0.55,1)_infinite,mascotSway_9s_cubic-bezier(0.45,0,0.55,1)_infinite]'
        )}
      >
        <Button
          type='button'
          variant='ghost'
          onClick={goToBooking}
          aria-label={label}
          style={{ transform: rtl ? 'scaleX(1)' : 'scaleX(-1)' }}
          className={cn(
            'pointer-events-auto block h-full w-full rounded-[28px] bg-transparent bg-contain bg-center bg-no-repeat p-0 hover:bg-transparent',
            'outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0',
            "[background-image:url('/demo-assets/character3.png')]"
          )}
        />
      </div>
    </motion.div>,
    document.body
  );
}
