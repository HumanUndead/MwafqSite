---
name: ui-ux
description: Use whenever building, restyling, or reviewing any UI in this project — components, pages, forms, modals, motion, color, spacing, typography, RTL, a11y. Encodes the Mwafq design system, when to pick which component library, and the dos/don'ts that keep the UI consistent.
---

# UI/UX playbook — Mwafq Site

This is the binding style guide. It supplements `docs/styling-and-motion.md` (tailwind + motion) and the `add-i18n-key` skill (copy). Read both before doing anything user-facing.

---

## 1. Two component libraries — pick the right one

| Library                | Path                                                                                     | When                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Custom shared**      | `@/shared/components/ui/*` (Button, Card, Input, Modal, OtpInput, Spinner)               | Default for product UI. Uses brand tokens (`#1e2364`, `#00a8f1`). Variants from `@/shared/lib/variants`.                         |
| **shadcn (base-nova)** | `@/components/ui/*` (avatar, button, card, carousel, dropdown-menu, input, select, tabs) | Use when you need a primitive the shared set doesn't have (Carousel, Dropdown, Select, Tabs, Avatar). Uses OKLCH neutral tokens. |
| **Headless**           | `@base-ui/react`, `embla-carousel-react`                                                 | Only when both libraries fall short, or when shadcn is built on it.                                                              |

**Rule:** never re-implement a primitive that exists in either library. Never mix the two button systems in one component — choose one.

---

## 2. Design tokens (binding palette)

Brand colors live as hex literals in `@/shared/lib/variants.ts` and inline in components. There is no Tailwind theme yet, so use hex with arbitrary-value utilities.

| Token         | Hex                              | Use                                                   |
| ------------- | -------------------------------- | ----------------------------------------------------- |
| Brand dark    | `#1e2364`                        | Primary surfaces, headings, brand buttons, focus ring |
| Brand hover   | `#233567` / `#2a3178`            | Hover on brand surfaces                               |
| Brand accent  | `#00a8f1`                        | Links, accent CTAs (hover `#0090d1`)                  |
| Page bg       | `#f3f4f8`                        | Body / app background                                 |
| Card bg       | `#ffffff`                        | Cards, modals, sidebar                                |
| Subtle border | `#e5e7f0`                        | Card / sidebar borders, dividers                      |
| Muted text    | `#6b7196`                        | Secondary copy                                        |
| Destructive   | `red-600` / `red-500` / `red-50` | Errors (Tailwind palette)                             |
| Success       | `green-600` / `green-50`         | Confirmations                                         |

shadcn primitives use OKLCH tokens (`--primary`, `--background`, …) defined in `src/app/globals.css`. Do NOT mix the two systems in a single component — if you use a shadcn primitive, theme it via its variant API; if you use a custom component, theme it with brand hex.

---

## 3. Typography

- Body font: `LamaSans` via CSS var `--font-lama-sans` (loaded in `src/app/layout.tsx`). Tailwind already maps `font-sans` to it through the layout `className`.
- Weights available: `400` (regular), `600` (semibold), `700` (bold). Don't request weights outside this set.
- Default text color: `#1e2364` (set on `<body>`). Add `text-[#6b7196]` for muted, `text-white` only on dark/brand surfaces.
- Headings: prefer `font-bold` or `font-semibold` over custom CSS; size with arbitrary values when needed (`text-[28px]`, `text-[15px]`).

---

## 4. Spacing, radii, elevation

- Spacing: Tailwind scale by default. Use arbitrary values (`px-[30px]`, `gap-[14px]`) only when matching a specific design.
- Radii: prefer arbitrary radii from the design (`rounded-[28px]`, `rounded-[14px]`) over shadcn token radii on custom components. `rounded-full` for pills.
- Borders: `border-2 border-[#e5e7f0]` is the canonical subtle card border.
- Shadows: lean on `shadow-sm` / `shadow-md` / `shadow-xl`. Avoid hand-rolled `box-shadow` strings.

---

## 5. Composition rules

- **Merge classes with `cn()`** from `@/shared/lib/cn` whenever variants or props change the class string. Direct `clsx` is fine if no Tailwind conflicts, but `cn()` is safer.
- **Variants live in `@/shared/lib/variants.ts`** for the custom set (button, input, label, card, spinner, toast, badge, modal). Extend the existing `cva` blocks before inventing new ones.
- **Slot patterns** for icons: prefer `icon` props or children with sized SVGs, never absolute-positioned overlays.
- **One `'use client'` boundary per file.** Lift state to the smallest client island; keep parents as server components when possible.

---

## 6. RTL (Arabic) — non-negotiable

The site supports `ar` with `dir="rtl"`. Layout will break if you use directional utilities.

- Use **logical Tailwind utilities**: `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end`. Avoid `pl-*`, `pr-*`, `ml-*`, `mr-*`, `left-*`, `right-*`, `text-left`, `text-right` for content-adjacent positioning.
- `flex-row-reverse` and `space-x-reverse` are escape hatches — use sparingly and only when logical utilities don't apply.
- Icons that have directionality (chevrons, arrows): mirror with `rtl:rotate-180` or supply both icons and pick by `isRtl(locale)`.
- Test every new page at `/ar/...` before declaring it done. Confirm: alignment, icon direction, form layout, table headers, scroll/swipe directions.
- Numbers in Arabic copy: keep western numerals unless the design specifies Arabic-Indic.

---

## 7. Accessibility (baseline — every PR)

- **Keyboard**: every interactive element must be reachable by Tab and operable by Enter/Space (button primitives handle this; `<div onClick>` does not — don't).
- **Focus**: visible ring (`focus:ring-2 focus:ring-[#1e2364] focus:ring-offset-2` on brand, `focus-visible:ring-3` on shadcn). Never remove the ring without replacing it.
- **Labels**: every `<input>` has a `<label htmlFor>` or `aria-label`. Don't rely on placeholders.
- **Modals**: trap focus, close on `Esc` and backdrop click, restore focus on close. `Modal` already handles `Esc`; verify focus return.
- **ARIA**: only add `aria-*` when it changes behavior (`aria-invalid`, `aria-expanded`, `aria-busy`, `aria-live` for toasts/errors). Don't redundantly label.
- **Color contrast**: text on brand `#1e2364` is `text-white`. Text on `#f3f4f8` is `#1e2364`. Don't put `#6b7196` on `#e5e7f0` — it fails AA.
- **Images**: every `<Image>` has meaningful `alt`, or `alt=""` if purely decorative.
- **Reduced motion**: `prefers-reduced-motion` is respected by `ScrollReveal`. For ad-hoc `motion.*` components, branch on `useReducedMotion()` and skip/shorten animation.

---

## 8. Motion

Binding rules from `docs/styling-and-motion.md`:

- **Reveal-on-scroll / reveal-on-load** → `ScrollReveal` from `@/shared/components/motion/ScrollReveal`. Don't roll your own IntersectionObserver + class toggle.
  - `variant`: `'y'` (default), `'x'`, `'word'`
  - `revealAfterLoadMs`: animate in N ms after `window.load` (used by profile sidebar)
  - `instant`: skip animation
  - `transitionDelay`: stagger children
- **Other motion** → Framer Motion `motion.*` components in client files. Standard ease: `[0.22, 1, 0.36, 1]`. Standard duration: `0.35s` (micro) / `1s` (reveal).
- **No CSS keyframe reveal classes** (`.reveal`, `.in`) for new code.
- Tailwind `transition-*` is fine for hover/colors/transforms.

---

## 9. Forms

- Inputs: `Input` from `@/shared/components/ui/Input` for product forms; shadcn `Input` only if used inside a shadcn primitive.
- Pattern: controlled state with `useState`, validate on submit, surface field error inline (`text-sm text-red-600`) and via toast for non-field errors.
- Labels above the field, `htmlFor` set. Required fields visually marked AND `aria-required`.
- Submit buttons: use the `Button` `loading` prop — it disables and renders a spinner.
- Error copy: from the dictionary (`useTranslations('auth').errors.*` etc.), never hardcoded English.
- See `LoginForm.tsx` and `RegisterForm.tsx` in `@/modules/auth/components/` for the canonical pattern.

---

## 10. Feedback (toast / modal / spinner)

- **Toasts**: `toast.success`, `toast.error`, `toast.info` from `@/shared/components/feedback/Toast`. The `ToastContainer` is mounted in the root layout. Don't add a second one.
- **Modal**: `Modal` from `@/shared/components/ui/Modal`. Close on `Esc` + backdrop; pass `title` for accessible heading.
- **Spinner**: inline `size-4 animate-spin rounded-full border-2 border-current border-t-transparent`, or `Spinner` from `@/shared/components/ui`.
- **Skeletons**: not standardized yet — for now use `animate-pulse bg-[#e5e7f0]` blocks. If you need >2 in one PR, propose a shared `Skeleton` instead.

---

## 11. Buttons (canonical usage)

```tsx
import { Button } from '@/shared/components/ui/Button'

// Brand primary CTA
<Button variant='brand' size='lg' className='rounded-[14px] w-full'>Submit</Button>

// Secondary on dark hero
<Button variant='brandGhost' size='hero'>Learn more</Button>

// Loading
<Button variant='brand' loading>{submitting ? '' : 'Save'}</Button>

// Pill
<Button variant='brand' shape='pill' size='md'>Filter</Button>
```

Variants: `primary | secondary | outline | ghost | danger | brand | brandOutline | brandGhost | brandInverse`. Sizes: `sm | md | lg | hero`. Shapes: `default | pill`.

---

## 12. Cards

```tsx
<div
  className={cn(
    'rounded-[28px] border-2 border-[#e5e7f0] bg-white p-[14px]',
    'flex flex-col gap-1'
  )}
>
  ...
</div>
```

Or use the `Card` variants (`default | flat | elevated`) for simpler 2xl-radius cards. Don't sprinkle `shadow-2xl` everywhere — elevation should be intentional.

---

## 13. Layout primitives

- **Page shell**: `(marketing)` group provides `<Header>` + `<FooterSection>`. Don't re-render them inside pages.
- **Content width**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` is the canonical container.
- **Sticky elements**: anchor with `sticky top-[110px]` (matches header height).
- **Sections**: `py-16` to `py-24` on marketing sections; tighter (`py-8` to `py-12`) inside dashboard.

---

## 14. Anti-patterns (do not do)

- Hardcoding `/en/...` or `/login` instead of `getLocalizedRoute(locale, ROUTES.X)`.
- `pl-*` / `pr-*` / `text-left` / `text-right` on content that flips with RTL.
- Hardcoded user-facing strings — always via the dictionary.
- New CSS module / `<style jsx>` for chrome that Tailwind can express. Add to `docs/styling-and-motion.md` exceptions if truly needed.
- Re-implementing intersection-observer reveals instead of `ScrollReveal`.
- Inline mega-style objects (`style={{...10 props...}}`) for layout / color — those are Tailwind's job.
- Mixing custom `Button` and shadcn `Button` in the same component.
- Adding a third button/input system. Extend `variants.ts` instead.
- Disabled state without `aria-busy`/`disabled` + visual cue.
- Removing focus rings (`focus:outline-none` without a replacement ring).
- New `@keyframes` in `globals.css` for one-off uses — animate with Framer Motion.

---

## 15. Pre-merge UI checklist

Run through this before declaring UI work done:

- [ ] Renders correctly at `/en/...` and `/ar/...`
- [ ] No hardcoded user copy — all from `useTranslations()` / `getTranslations()`
- [ ] Tab order is sensible; focus ring visible on every interactive element
- [ ] Form errors localized + shown inline AND announced (toast or `aria-live`)
- [ ] `prefers-reduced-motion`: animations skipped or muted
- [ ] Tested at sm / md / lg breakpoints
- [ ] No console warnings (especially around hydration / async params)
- [ ] Images have `alt`, remote hosts allow-listed in `next.config.ts`
- [ ] No new CSS modules unless documented in `docs/styling-and-motion.md`
- [ ] `cn()` used wherever class strings depend on props
