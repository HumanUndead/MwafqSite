'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef } from 'react';

function formatCount(value: number, suffix = '', decimals = 0) {
  const safe = Number.isFinite(value) ? value : 0;

  if (suffix === 'K+') return `${Math.round(safe / 1000)}K+`;
  if (decimals > 0) return `${safe.toFixed(decimals)}${suffix}`;
  return `${Math.round(safe).toLocaleString()}${suffix}`;
}

type CountUpTrigger = 'inView' | 'mount';

const IN_VIEW_OPTS = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -40px 0px' as const,
};

const DURATION_MS = 2000;

export function CountUp({
  value,
  suffix,
  decimals,
  className,
  trigger = 'inView',
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
  trigger?: CountUpTrigger;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, IN_VIEW_OPTS);
  const prefersReducedMotion = useReducedMotion();
  const hasAnimatedRef = useRef(false);

  const target = Number.isFinite(value) ? value : 0;
  const active = trigger === 'mount' || inView;
  const formattedTarget = formatCount(target, suffix, decimals);

  useEffect(() => {
    hasAnimatedRef.current = false;
  }, [target]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || hasAnimatedRef.current) return;
    node.textContent = formatCount(0, suffix, decimals);
  }, [suffix, decimals]);

  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;

    if (prefersReducedMotion === true) {
      const frame = requestAnimationFrame(() => {
        node.textContent = formattedTarget;
        hasAnimatedRef.current = true;
      });
      return () => cancelAnimationFrame(frame);
    }

    hasAnimatedRef.current = false;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - (1 - elapsed) ** 3;
      node.textContent = formatCount(target * eased, suffix, decimals);

      if (elapsed < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        hasAnimatedRef.current = true;
      }
    };

    node.textContent = formatCount(0, suffix, decimals);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, prefersReducedMotion, target, suffix, decimals, formattedTarget]);

  return (
    <span
      ref={ref}
      className={className}
      suppressHydrationWarning
      aria-label={formattedTarget}
    />
  );
}
