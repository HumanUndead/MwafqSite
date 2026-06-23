'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const LG_MEDIA = '(min-width: 1024px)';

function pickActiveIndex(items: HTMLElement[], horizontal: boolean): number {
  const center = horizontal ? window.innerWidth / 2 : window.innerHeight / 2;

  let bestIndex = 0;
  let bestDistance = Infinity;

  items.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const elementCenter = horizontal
      ? rect.left + rect.width / 2
      : rect.top + rect.height / 2;
    const distance = Math.abs(elementCenter - center);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function useB2BServiceScrollSpy(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      itemRefs.current[index] = node;
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    const items = itemRefs.current.filter(
      (node): node is HTMLElement => node != null
    );

    if (items.length === 0) return;

    const compute = () => {
      const horizontal = !window.matchMedia(LG_MEDIA).matches;
      setActiveIndex(pickActiveIndex(items, horizontal));
    };

    const raf = requestAnimationFrame(compute);

    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    container?.addEventListener('scroll', compute, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
      container?.removeEventListener('scroll', compute);
    };
  }, [itemCount]);

  return { activeIndex, containerRef, setItemRef };
}
