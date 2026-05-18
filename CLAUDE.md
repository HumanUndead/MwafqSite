@AGENTS.md

# Mwafq Site — project map

Next.js 16 + React 19 + TS 5. Tailwind 4 + shadcn (base-nova). Framer Motion. Zustand. Path alias `@/*` → `src/*`.

## Stack

- next 16.2.6 (App Router, async `params`/`cookies`/`headers`)
- react 19.2 / react-dom 19.2
- tailwindcss 4 (PostCSS, no `tailwind.config`; tokens in `src/app/globals.css`)
- shadcn ui (`components.json` style `base-nova`, components in `src/components/ui`)
- framer-motion 12
- zustand 5 (with `persist` for auth)
- `@base-ui/react`, `embla-carousel-react`, `lucide-react`, `gsap` (rare)

## Top-level layout

- `src/app/` — App Router only. Pages stay thin: read `params`, fetch, hand off to module.
- `src/modules/<feature>/` — Feature code. UI + hooks + api client + server services + types.
- `src/shared/` — Cross-feature: `components/`, `lib/`, `hooks/`, `constants/`, `types/`.
- `src/components/ui/` — shadcn primitives (do not edit casually).
- `src/i18n/` — Locale config, routing helpers, dictionary loader, `DictionaryProvider`.
- `src/locales/{en,ar}.ts` — Translation dictionaries. `en` is the source of truth for shape.
- `src/proxy.ts` — Middleware: locale redirect, auth gating, sets `x-mwafq-locale`.
- `docs/styling-and-motion.md` — Tailwind + Framer Motion rules. Follow.
- `.cursor/rules/` — Cursor-only rules; project conventions also live here.

## Routing model

- All app routes live under `src/app/[locale]/`. The `[locale]` segment is mandatory.
- Route groups: `(marketing)`, `(auth)`, `(dashboard)`. Profile pages nest under `(marketing)/(profile)/`.
- Locale prefix is injected by `src/proxy.ts` middleware. Pages must never assume `/` root.
- Build hrefs with `getLocalizedRoute(locale, ROUTES.X)` from `@/i18n/routing` + `@/shared/constants/routes`. Never hardcode `/en/...`.
- Add new paths to `src/shared/constants/routes.ts`. Add to `PROTECTED_PREFIXES` or `AUTH_PATHS` in [src/proxy.ts](src/proxy.ts) if applicable.

## i18n

- Two locales: `en` (default), `ar` (RTL). Source of truth: `src/locales/en.ts`. `Dictionary` type is `DeepWiden<typeof en>`.
- Server: `getDictionary(locale)` or `getTranslations(namespace)` from `@/i18n/server`.
- Client: `useTranslations(namespace)` and `useLocale()` from `@/i18n/DictionaryProvider`.
- Always edit `en.ts` AND `ar.ts` together with matching shape. `ar.ts` may override partial keys; missing keys fall back to `en` via deep merge in `dictionaries.ts`.
- Direction: `isRtl(locale)` from `@/i18n/config`. Layout already sets `<html dir>`.

## Feature module convention

A module under `src/modules/<feature>/` typically has:

- `<Feature>Page.tsx` or `<Feature>View.tsx` — entry component called from `app/`
- `components/` — feature-only UI
- `hooks/` — client hooks (`use*`)
- `api/` — client fetch wrappers using `http` from `@/shared/lib/http`
- `server/` — server-only logic (top of file: `import 'server-only'`)
- `types/` — feature types
- `store/` — zustand stores (only if needed)
- `index.ts` — public re-exports (keep surface small)
- `*.shared.ts` — code safe for both server + client (no `server-only`)

Pages in `app/` should stay thin: validate `locale`, fetch, render `<FeaturePage />`.

## Data & API

- Client: `http.get/post/put/delete` from [src/shared/lib/http.ts](src/shared/lib/http.ts). Auto-attaches `Authorization: Bearer <cookie:token>`. Returns `ApiResponse<T>` (`{ data, message, success, code }`).
- Errors throw `ApiError` (has `code`); UI converts via `getLocalizedAuthErrorMessage` etc.
- Server: services in `modules/*/server/` call upstream `https://productionapi.mwafq.com` (overridable via `MWAFQ_API_BASE_URL`) using `fetch` + `upstreamRequest` helpers. Upstream envelope: `UpstreamApiResponse<T>` (`{ value, isSuccess, isFailure, error }`).
- Local API routes live in `src/app/api/<feature>/route.ts` — they wrap upstream + set cookies.
- Images: only allow-listed remote hosts in `next.config.ts`.

## Auth

- Cookies (`src/modules/auth/session.shared.ts`):
  - `token` — JWT, `httpOnly: false` so client `http` can attach Bearer.
  - `mwafq-session` — server session payload, `httpOnly: true`.
- Both cookies set together by login API route; both cleared on logout. The proxy treats either as authenticated.
- Client store: `useAuthStore` (zustand, persisted as `auth-storage`).
- Server reads current user via `getCurrentUser()` in `modules/auth/server/authSession.ts`.

## Styling & motion (binding)

- Tailwind utilities for chrome. No CSS modules / `<style>` unless documented in `docs/styling-and-motion.md`.
- Merge classes with `cn()` from `@/shared/lib/cn`.
- Animations: Framer Motion. Use `<ScrollReveal>` from `@/shared/components/motion/ScrollReveal` for reveal-on-view or reveal-on-load patterns. Respect `prefers-reduced-motion` (use `useReducedMotion()` in custom motion components).

## Conventions

- Path alias `@/*` only. Never relative `../../`.
- Server-only files start with `import 'server-only'`. Anything imported by a client component must NOT pull `server-only`.
- Client components use `'use client'` at the top.
- Prettier: single quotes, semis, `trailingComma: 'es5'`. ESLint: `next/core-web-vitals` + TS.
- Keep files small. Modular boundaries: domain (`types`) / app (`hooks`, server services) / infrastructure (`api`, `http`) / presentation (`components`).

## Commands

- `npm run dev` — dev server (`next dev`)
- `npm run dev:https` — dev with experimental HTTPS
- `npm run build` — production build
- `npm run lint` — eslint
- `npm run format` / `format:check` — prettier
- `node_modules/` may not be installed; `npm install` first if missing.

## Pitfalls

- Next 16 breaking changes: `params`, `cookies()`, `headers()` are async — `await` them.
- Never hardcode `/login` etc. — use `ROUTES` + `getLocalizedRoute`.
- When adding a translation key, add it to BOTH `en.ts` and `ar.ts` with the same shape.
- When adding a protected route, also register it in `PROTECTED_PREFIXES` in `src/proxy.ts`.
- `AGENTS.md` is `.gitignore`d locally; treat CLAUDE.md as the canonical project guide.
