'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useMotionValueEvent } from 'framer-motion';

const STICKY_TOP_PX = 0;
const SNAP_IDLE_MS = 100;
const SNAP_DONE_PX = 5;

function getTrackTop(el: HTMLElement) {
  return el.getBoundingClientRect().top + window.scrollY;
}

function sceneDistance(count: number, stepPx: number) {
  return count > 1 ? stepPx * (count - 1) : 0;
}

function scrollYForCard(trackTop: number, index: number, stepPx: number) {
  return Math.round(trackTop + index * stepPx);
}

function isPinned(track: HTMLElement) {
  const rect = track.getBoundingClientRect();
  if (track.offsetHeight - window.innerHeight <= 0) return false;
  return rect.top <= STICKY_TOP_PX + 8 && rect.bottom > window.innerHeight;
}

interface Options {
  itemCount: number;
  stepPx: number;
  enabled?: boolean;
}

export function useB2BScrollChapters({
  itemCount,
  stepPx,
  enabled = true,
}: Options) {
  const trackRef = useRef<HTMLDivElement>(null);
  const position = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const dist = sceneDistance(itemCount, stepPx);

  useEffect(() => {
    if (!enabled || itemCount < 2) return;
    const el = trackRef.current;
    if (!el) return;

    let frameId = 0;
    let idleTimer: ReturnType<typeof setTimeout>;
    let snapping = false;

    const sync = () => {
      const track = trackRef.current;
      if (!track) return;
      const trackTop = getTrackTop(track);
      const raw = Math.max(0, Math.min(window.scrollY - trackTop, dist));
      position.set(itemCount > 1 ? raw / stepPx : 0);
    };

    const snapToNearest = () => {
      const track = trackRef.current;
      if (!track || !isPinned(track)) return;
      const trackTop = getTrackTop(track);
      const raw = Math.max(0, Math.min(window.scrollY - trackTop, dist));
      const pos = itemCount > 1 ? raw / stepPx : 0;
      const nearest = Math.min(itemCount - 1, Math.max(0, Math.round(pos)));
      const target = scrollYForCard(trackTop, nearest, stepPx);
      if (Math.abs(window.scrollY - target) < SNAP_DONE_PX) return;
      snapping = true;
      window.scrollTo({ top: target, behavior: 'smooth' });
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = 0;
        sync();
        const track = trackRef.current;
        if (!track) return;
        if (snapping) {
          const trackTop = getTrackTop(track);
          const raw = Math.max(0, Math.min(window.scrollY - trackTop, dist));
          const pos = itemCount > 1 ? raw / stepPx : 0;
          const nearest = Math.min(itemCount - 1, Math.max(0, Math.round(pos)));
          const target = scrollYForCard(trackTop, nearest, stepPx);
          if (Math.abs(window.scrollY - target) < SNAP_DONE_PX)
            snapping = false;
          return;
        }
        if (!isPinned(track)) return;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(snapToNearest, SNAP_IDLE_MS);
      });
    };

    const cancelSnap = () => {
      snapping = false;
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', cancelSnap, { passive: true });
    window.addEventListener('touchstart', cancelSnap, { passive: true });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', cancelSnap);
      window.removeEventListener('touchstart', cancelSnap);
    };
  }, [dist, enabled, itemCount, position, stepPx]);

  useMotionValueEvent(position, 'change', (p) => {
    const next = Math.min(itemCount - 1, Math.max(0, Math.round(p)));
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  const jumpTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    window.scrollTo({
      top: scrollYForCard(getTrackTop(el), index, stepPx),
      behavior: 'smooth',
    });
  };

  return { trackRef, activeIndex, jumpTo, dist };
}
