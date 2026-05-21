---
name: project-map
description: Use when the user asks where something lives, how this Next.js 16 project is organized, or "where do I put X". Returns the module/route/i18n/auth layout for the Mwafq Site app router project.
---

# Project map — Mwafq Site

Stack: Next.js 16 App Router + React 19 + TS 5 + Tailwind 4 + shadcn (base-nova) + Framer Motion + zustand. Alias `@/*` → `src/*`.

## Where things go

| Concern                    | Location                                             |
| -------------------------- | ---------------------------------------------------- |
| Pages / route entries      | `src/app/[locale]/(group)/<path>/page.tsx`           |
| Feature UI + hooks + types | `src/modules/<feature>/`                             |
| shadcn primitives          | `src/components/ui/`                                 |
| Cross-feature UI / lib     | `src/shared/{components,lib,hooks,constants,types}/` |
| i18n config + helpers      | `src/i18n/`                                          |
| Translation dictionaries   | `src/locales/{en,ar}.ts`                             |
| Middleware (locale + auth) | `src/proxy.ts`                                       |
| Local API routes           | `src/app/api/<feature>/route.ts`                     |
| Global styles + tokens     | `src/app/globals.css`                                |
| Styling / motion rules     | `docs/styling-and-motion.md`                         |

## Route groups under `src/app/[locale]/`

- `(marketing)` — public site (home, about, contact, courses)
  - `(profile)` — authenticated profile pages (academy-courses, my-reservations, personal-info)
  - `(academy)` — academy pages (courses)
- `(auth)` — login, register, forgot-password
- `(dashboard)` — dashboard area (protected)

Top-level `src/app/page.tsx` only redirects to the locale-prefixed home.

## Feature module skeleton (`src/modules/<feature>/`)

```
<feature>/
  <Feature>Page.tsx | <Feature>View.tsx   ← entry used by app/
  components/                             ← feature UI
  hooks/                                  ← use* client hooks
  api/                                    ← client fetch wrappers (http)
  server/                                 ← `import 'server-only'`; upstream calls
  types/                                  ← *.types.ts
  store/                                  ← zustand store (optional)
  *.shared.ts                             ← safe for server + client
  index.ts                                ← small public surface
```

Pages in `app/` stay thin — validate `locale`, fetch, render `<FeaturePage />`.

## Data flow

- Client → `http.get/post/...` from `@/shared/lib/http` → local `app/api/*` → upstream `MWAFQ_API_BASE_URL` (`productionapi.mwafq.com`). Auto Bearer from `token` cookie.
- Server → `modules/*/server/*` calls upstream directly. Response envelope: `UpstreamApiResponse<T>` (`{ value, isSuccess, isFailure, error }`).
- Client envelope returned to UI: `ApiResponse<T>` (`{ data, message, success, code }`). Failures throw `ApiError` with `code`.

## i18n

- Locales: `en` (default), `ar` (RTL). Source-of-truth shape: `src/locales/en.ts`. Dictionary type = `DeepWiden<typeof en>`.
- Server reads: `getDictionary(locale)` or `getTranslations(namespace)` from `@/i18n/server`.
- Client reads: `useTranslations(namespace)`, `useLocale()` from `@/i18n/DictionaryProvider`.
- Direction: `isRtl(locale)` from `@/i18n/config`.

## Routing helpers

- `ROUTES` constant: `@/shared/constants/routes`. Add new paths here.
- Build hrefs: `getLocalizedRoute(locale, ROUTES.X)` from `@/i18n/routing`.
- Never hardcode `/en/...` or `/login`.

## Auth

- Cookies (`@/modules/auth/session.shared`):
  - `token` — JWT, `httpOnly:false` (client `http` reads to set Bearer)
  - `mwafq-session` — server session, `httpOnly:true`
- Either presence ⇒ authenticated (per `src/proxy.ts`).
- Protected path prefixes: `PROTECTED_PREFIXES` in `src/proxy.ts`. Add new ones there.
- Client store: `useAuthStore` from `@/modules/auth` (zustand, persisted).
- Server current user: `getCurrentUser()` from `@/modules/auth/server/authSession`.

## Styling & motion (must follow)

- Tailwind utilities for UI chrome. Merge with `cn()` from `@/shared/lib/cn`.
- No CSS modules / `<style>` for ordinary chrome — add to `docs/styling-and-motion.md` exceptions if you must.
- Animations: Framer Motion. For reveal-on-view / reveal-on-load patterns use `ScrollReveal` from `@/shared/components/motion/ScrollReveal`.
- Respect `prefers-reduced-motion` (use `useReducedMotion()` in custom motion components).
- Read [docs/styling-and-motion.md](docs/styling-and-motion.md) for variants and examples.

## Commands

- `npm run dev` / `dev:https` / `build` / `start`
- `npm run lint` / `format` / `format:check`

## Hot pitfalls

- Next 16: `params`, `cookies()`, `headers()` are async — always `await`.
- Translation keys: add to BOTH `en.ts` and `ar.ts`; missing-key fallback is `en`.
- New protected routes need an entry in `PROTECTED_PREFIXES`.
- Don't import `server-only` files from client components.
