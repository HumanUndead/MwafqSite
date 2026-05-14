# Styling and motion (project guide)

This document is the **instruction manual** for how we style UI and handle animation in this repo. Agents and contributors should follow it together with `AGENTS.md`.

---

## Rules (must follow)

1. **Tailwind for UI styles**  
   Use Tailwind utility classes for layout, spacing, sizing, color, typography, borders, flexbox, grid, and responsive behavior. Do **not** add CSS modules (`.module.css`) or scoped `<style>` blocks for ordinary component chrome unless there is **no practical Tailwind equivalent** and you document the exception at the bottom of this file.

2. **Framer Motion for animation**  
   Use **Framer Motion** for motion: scroll-into-view reveals, load-delayed reveals, staggered children, layout animations, and intentional micro-interactions. Do **not** implement the same behavior with CSS-only patterns such as `.reveal` + `.in`, global `@keyframes` for “enter” transitions, or a manual `IntersectionObserver` that only toggles classes for fade/slide—use Motion (or the shared wrapper below) instead.

3. **Shared scroll reveal**  
   When behavior matches “animate once when in view” or “animate once after `window` load + delay” (as used on the profile sidebar), prefer **`ScrollReveal`** from `@/shared/components/motion/ScrollReveal` instead of duplicating logic.

4. **Reduced motion**  
   Respect accessibility: `ScrollReveal` already respects `prefers-reduced-motion`. For custom `motion` components, use `useReducedMotion()` from Framer Motion and skip or simplify animation when it returns true.

5. **Global CSS**  
   `src/app/globals.css` is allowed for Tailwind import, design tokens on `:root`, and **keyframes that Tailwind references** (e.g. `animate-[...]`). Do not grow one-off component styles there; keep them in Tailwind at the component.

---

## Instructions — Tailwind

- Merge classes with **`cn()`** from `@/shared/lib/cn`** when variants or props change the class string (avoids conflicting utilities).
- Prefer **theme tokens** from `@theme` / `globals.css` when they exist; otherwise use **arbitrary values** (e.g. `rounded-[28px]`, `text-[#6b7196]`) to match design until tokens are added.
- Use **`wrap-break-word`** (or project-preferred overflow wrap utility) for long user-generated text instead of ad-hoc CSS.

---

## Instructions — Framer Motion

- Import from **`framer-motion`** (`motion`, `useInView`, `useReducedMotion`, `AnimatePresence`, etc.) in **client** components (`'use client'`).
- **`ScrollReveal`** (`src/shared/components/motion/ScrollReveal.tsx`):
  - **`variant`**: `'y'` (default) — fade + slide up; `'x'` — fade + slide from the side; `'word'` — masked line rise (hero-style words).
  - **`instant`**: show final state immediately (like the old `.pkg` shortcut).
  - **`revealAfterLoadMs`**: after `window` **load** + N ms, animate in **without** relying on intersection (profile sidebar pattern).
  - Default (no `revealAfterLoadMs`): **`useInView`** with **once**, **amount `0.12`**, **margin `0px 0px -50px 0px`**, **1s** transition, ease **`[0.22, 1, 0.36, 1]`** (matches previous CSS).
- **`variant="word"`** still uses a tiny CSS module for overflow/inline display on the wrapper; the motion itself is Framer. If you remove that file, re-express those few rules with Tailwind on the same nodes.

### Minimal examples

```tsx
'use client';

import { motion } from 'framer-motion';

export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

```tsx
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';

export function SidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <ScrollReveal
      variant="y"
      revealAfterLoadMs={200}
      className="sticky top-[110px] flex flex-col gap-1 rounded-[28px] border-2 border-[#e5e7f0] bg-white p-[14px]"
    >
      {children}
    </ScrollReveal>
  );
}
```

---

## Anti-patterns

- Large **inline `style={{}}`** objects for static layout/visuals that Tailwind can express.
- **Duplicating** `ScrollReveal`’s intersection / load / reduced-motion logic in a new hook without a strong reason.
- **Animating layout** with only CSS `transition` on `height`/`max-height` for complex collapses where Motion’s layout animations would be clearer (case-by-case; still use Tailwind for non-animated properties).

---

## Documented exceptions

_Add rows here when Tailwind or Motion is not used, with reason and owner/date._

| Area | Exception | Reason |
|------|-----------|--------|
| — | — | — |
