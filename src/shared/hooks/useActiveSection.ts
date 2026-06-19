'use client';

import { useEffect, useState } from 'react';

/**
 * Scroll-spy for in-page nav anchors.
 *
 * `ids` is the ordered list of section tokens (a hash like `app`, or any
 * sentinel for a plain page-root link). Returns the single token that should
 * read as active:
 *
 * - The FIRST token is the neutral default — active at the top of the page,
 *   even when it has no matching element (mirrors "Home" before any section).
 * - While scrolling, the active token becomes the deepest section whose top
 *   has crossed the reference line (~35% down the viewport).
 *
 * Only one token is ever active, so two anchors that share a base path can no
 * longer light up at once.
 */
export function useActiveSection(ids: string[]): string | null {
  const key = ids.join('|');
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const compute = () => {
      if (ids.length === 0) {
        setActive(null);
        return;
      }
      const line = window.innerHeight * 0.35;
      let current = ids[0];
      let best = -Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= line && top > best) {
          best = top;
          current = id;
        }
      }
      setActive(current);
    };

    // Defer the first read to a frame so we never setState synchronously in
    // the effect body; scroll/resize then keep it in sync.
    const raf = requestAnimationFrame(compute);
    if (ids.length === 0) {
      return () => cancelAnimationFrame(raf);
    }
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
