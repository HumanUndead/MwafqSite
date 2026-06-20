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
import BotIcon from '@/shared/components/icons/Bot';

// Box size in px — drives both the rendered size (via style) and the
// center-based positioning math, so the two can never drift apart.
const W = 100;
const H = 140;
// Parked = small companion at the side; docked = full size on the card.
const PARK_SCALE = 0.62;
const DOCK_SCALE = 1;
const PARK_MARGIN = 24; // gap from the viewport side while parked
// Below this width the side gutters collapse, so the mascot drops to the
// bottom corner instead of floating mid-screen over the content.
const XL_BREAKPOINT = 1280;
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
  // Mascot lives on the reading-END side: right for LTR (en), left for RTL (ar).
  const onRight = !rtl;
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
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const parkCenterX = () =>
      onRight
        ? window.innerWidth - PARK_MARGIN - (W * PARK_SCALE) / 2
        : PARK_MARGIN + (W * PARK_SCALE) / 2;
    const parkCenterY = () =>
      window.innerWidth >= XL_BREAKPOINT
        ? window.innerHeight * 0.42
        : window.innerHeight - PARK_MARGIN - (H * PARK_SCALE) / 2;

    // Position by the mascot's CENTER (Framer scales about center), so the
    // math stays symmetric for LTR/RTL.
    const compute = () => {
      const card = cardRef.current;
      let cx = parkCenterX();
      let cy = parkCenterY();
      let sc = PARK_SCALE;

      if (card) {
        const rect = card.getBoundingClientRect();
        // Only dock while the card is still in (or entering) the viewport.
        // Once rect.bottom <= 0 the card is fully above — stay parked so the
        // mascot remains visible as the user scrolls down the rest of the page.
        if (rect.bottom > 0) {
          const startAt = window.innerHeight * 0.95; // begin docking
          const endAt = window.innerHeight * 0.3; // fully docked
          const p = clamp((startAt - rect.top) / (startAt - endAt), 0, 1);
          const eased = p * p * (3 - 2 * p); // smoothstep

          const dockX = onRight ? rect.right - 30 : rect.left + 30;
          const dockY = rect.top + 70;

          cx = lerp(parkCenterX(), dockX, eased);
          cy = lerp(parkCenterY(), dockY, eased);
          sc = lerp(PARK_SCALE, DOCK_SCALE, eased);
        }
      }

      xBase.set(cx - W / 2);
      yBase.set(cy - H / 2);
      sBase.set(sc);
    };

    // Entrance: start off the start-side edge, then slide to the parked spot.
    x.jump(onRight ? window.innerWidth + W : -W * 2);
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
          'relative flex h-full w-full flex-col items-center',
          !reduced &&
            'animate-[mascotFloat_4s_cubic-bezier(0.45,0,0.55,1)_infinite,mascotSway_9s_cubic-bezier(0.45,0,0.55,1)_infinite]'
        )}
      >
        <Button
          type='button'
          variant='ghost'
          onClick={goToBooking}
          aria-label={label}
          style={{ transform: onRight ? 'scaleX(1)' : 'scaleX(-1)', width: W, height: H }}
          className={cn(
            'pointer-events-auto block shrink-0 rounded-[28px] bg-transparent p-0 hover:bg-transparent',
            'outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0'
          )}
        >
          <BotIcon className='size-full' />
        </Button>
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-5 whitespace-nowrap',
            'rounded-full bg-[#00a8f1] px-2.5 py-1.25',
            'text-xl font-semibold leading-none text-white shadow-md',
            onRight ? 'right-full me-2' : 'left-full ms-2'
          )}
        >
          {rtl ? 'احجز الآن' : 'Book Now!'}
        </motion.span>
      </div>
    </motion.div>,
    document.body
  );
}
