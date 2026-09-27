'use client';

import { useEffect } from 'react';

const RELOAD_FLAG = 'mwafq-chunk-reload';

function isChunkLoadError(message: unknown): boolean {
  return typeof message === 'string' && /ChunkLoadError|Loading chunk|Failed to load chunk/i.test(message);
}

function reloadOnce() {
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  window.location.reload();
}

export function ChunkErrorReloader() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.message) || isChunkLoadError(event.error?.name)) {
        reloadOnce();
      }
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason?.message) || isChunkLoadError(event.reason?.name)) {
        reloadOnce();
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // sessionStorage unavailable (private mode) — reload guard just won't persist
    }

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
