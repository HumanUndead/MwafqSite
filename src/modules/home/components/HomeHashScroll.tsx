'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { scrollToSectionIdWithRetries } from '@/shared/lib/scrollToSection';

function scrollFromLocationHash() {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;

  const id = decodeURIComponent(hash.slice(1));
  return scrollToSectionIdWithRetries(id);
}

export function HomeHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanup = scrollFromLocationHash();
    const onHashChange = () => scrollFromLocationHash();

    window.addEventListener('hashchange', onHashChange);
    return () => {
      cleanup?.();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  return null;
}
