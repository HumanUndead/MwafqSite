/** Tailwind class for in-page section anchors below the fixed marketing header. */
export const sectionScrollMarginClass =
  'scroll-mt-[104px] max-[560px]:scroll-mt-20';

export function getFixedHeaderScrollOffset(extraGap = 12): number {
  const header = document.querySelector('header');
  if (!header) {
    return window.innerWidth <= 560 ? 80 : 104;
  }

  const rect = header.getBoundingClientRect();
  const styleTop = Number.parseFloat(getComputedStyle(header).top) || 0;
  return rect.height + styleTop + extraGap;
}

export function scrollToSectionId(
  id: string,
  behavior: ScrollBehavior = 'smooth'
): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  const offset = getFixedHeaderScrollOffset();
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

export function scrollToSectionIdWithRetries(
  id: string,
  behavior: ScrollBehavior = 'smooth'
) {
  const attempt = () => scrollToSectionId(id, behavior);

  attempt();
  requestAnimationFrame(() => {
    requestAnimationFrame(attempt);
  });

  const delays = [80, 180, 400, 800];
  const timers = delays.map((delay) => window.setTimeout(attempt, delay));
  return () => timers.forEach((timer) => window.clearTimeout(timer));
}
