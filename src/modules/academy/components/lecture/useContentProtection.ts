'use client';

import { useEffect, useRef } from 'react';

export type ProtectionThreat =
  | 'screenshot'
  | 'focus-lost'
  | 'devtools'
  | 'print';

/** Width/height gap between outer and inner window that means docked devtools. */
const DEVTOOLS_GAP_PX = 200;
const DEVTOOLS_POLL_MS = 1000;
/** How lopsided the two axes must be before it reads as a docked panel. */
const DEVTOOLS_RATIO_SKEW = 0.3;

function isScreenshotShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  if (key === 'printscreen') return true;
  // Windows snipping (Win+Shift+S) and macOS (Cmd+Shift+3/4/5).
  if (event.metaKey && event.shiftKey && ['s', '3', '4', '5'].includes(key)) {
    return true;
  }
  return false;
}

function isDevtoolsShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  if (key === 'f12') return true;
  const mod = event.ctrlKey || event.metaKey;
  // Ctrl/Cmd+Shift+I/J/C/K (panels), Cmd+Alt+I/J/C (macOS), Ctrl/Cmd+U (source).
  if (mod && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) return true;
  if (event.metaKey && event.altKey && ['i', 'j', 'c', 'u'].includes(key)) {
    return true;
  }
  if (mod && key === 'u') return true;
  // Save page / print from the keyboard.
  if (mod && (key === 's' || key === 'p')) return true;
  return false;
}

/**
 * Docked devtools shrink only one axis of the viewport; browser zoom scales
 * both. Comparing the outer/inner ratios per axis keeps zoomed users (e.g.
 * 125%) from being mistaken for an open inspector. Undocked devtools can't
 * be detected this way.
 */
function devtoolsLikelyOpen(): boolean {
  const { outerWidth, innerWidth, outerHeight, innerHeight } = window;
  if (!innerWidth || !innerHeight) return false;
  const widthRatio = outerWidth / innerWidth;
  const heightRatio = outerHeight / innerHeight;
  const gapLarge =
    outerWidth - innerWidth > DEVTOOLS_GAP_PX ||
    outerHeight - innerHeight > DEVTOOLS_GAP_PX;
  return gapLarge && Math.abs(widthRatio - heightRatio) > DEVTOOLS_RATIO_SKEW;
}

/**
 * Best-effort deterrents for the lecture page (a web page cannot truly block
 * OS-level capture): screenshot shortcuts, leaving the window (recorders and
 * snipping tools take focus), devtools shortcuts / docked devtools, printing,
 * and text selection, copy and the context menu. `onThreat` should pause and
 * cover the video; `onDevtoolsChange` reports devtools opening and closing.
 */
export function useContentProtection({
  enabled,
  onThreat,
  onDevtoolsChange,
}: {
  enabled: boolean;
  onThreat: (threat: ProtectionThreat) => void;
  onDevtoolsChange: (open: boolean) => void;
}) {
  const onThreatRef = useRef(onThreat);
  const onDevtoolsChangeRef = useRef(onDevtoolsChange);
  useEffect(() => {
    onThreatRef.current = onThreat;
    onDevtoolsChangeRef.current = onDevtoolsChange;
  });

  useEffect(() => {
    if (!enabled) return;

    const threat = (kind: ProtectionThreat) => onThreatRef.current(kind);

    const clearClipboard = () => {
      try {
        void navigator.clipboard?.writeText('').catch(() => {});
      } catch {
        // Clipboard API unavailable.
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isScreenshotShortcut(event)) {
        threat('screenshot');
        clearClipboard();
        return;
      }
      if (isDevtoolsShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
        threat('devtools');
      }
    };
    // PrintScreen often only reaches the page as keyup.
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'printscreen') {
        threat('screenshot');
        clearClipboard();
      }
    };
    const onBlur = () => threat('focus-lost');
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') threat('focus-lost');
    };
    const onBeforePrint = () => threat('print');
    const block = (event: Event) => event.preventDefault();

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeprint', onBeforePrint);
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('selectstart', block);
    document.addEventListener('dragstart', block);

    let devtoolsOpen = false;
    const poll = window.setInterval(() => {
      const open = devtoolsLikelyOpen();
      if (open === devtoolsOpen) return;
      devtoolsOpen = open;
      onDevtoolsChangeRef.current(open);
      if (open) threat('devtools');
    }, DEVTOOLS_POLL_MS);

    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeprint', onBeforePrint);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('selectstart', block);
      document.removeEventListener('dragstart', block);
      window.clearInterval(poll);
      document.body.style.userSelect = previousUserSelect;
    };
  }, [enabled]);
}
