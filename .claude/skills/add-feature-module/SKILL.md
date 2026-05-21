---
name: add-feature-module
description: Use when creating a new feature area under `src/modules/<feature>/`. Scaffolds the standard module layout (components/hooks/api/server/types) used by `auth`, `home`, `profile-*`, etc.
---

# Add a feature module

Create `src/modules/<feature>/` following the established convention. Keep modules small and self-contained. Boundaries: domain (`types`) / app (`hooks`, server services) / infrastructure (`api`, `http`) / presentation (`components`).

## Standard skeleton

```
src/modules/<feature>/
  <Feature>Page.tsx          ← entry; default export is server component, can render client subtrees
  components/                ← feature-only UI (.tsx, may be 'use client')
  hooks/                     ← client hooks (use*.ts)
  api/                       ← thin wrappers over `http` from @/shared/lib/http
  server/                    ← server-only; top of file: `import 'server-only'`
  types/<feature>.types.ts   ← DTOs and view types
  store/<feature>Store.ts    ← zustand (optional, only if real client state)
  *.shared.ts                ← safe for both server + client (no `server-only` imports)
  index.ts                   ← public exports — keep minimal
```

## Steps

1. **Add route(s)** — see the `add-localized-route` skill. Pages in `src/app/[locale]/(group)/<path>/page.tsx` stay thin and import the module entry.

2. **Define types** in `types/<feature>.types.ts`. DTOs (request/response from API) and view types (props for components). Reuse shared types from `@/shared/types` when applicable (e.g. `User`).

3. **Client API wrapper** in `api/<feature>Api.ts`:

```ts
import { http } from '@/shared/lib/http';
import type { FooDto, FooResponse } from '../types/foo.types';

export const fooApi = {
  list: () => http.get<FooResponse[]>('/api/foo'),
  create: (data: FooDto) => http.post<FooResponse>('/api/foo', data),
};
```

4. **Server service** in `server/<feature>Service.ts` (if you call upstream from server):

```ts
import 'server-only';
import { upstreamRequest } from '@/modules/auth/server/upstreamRequest';
// ... call upstream API, unwrap UpstreamApiResponse, return view model
```

5. **Hooks** in `hooks/use<Feature>.ts` — mark as `'use client'` if it uses React state. Pattern: own `loading` / `error`, call api, push toasts via `@/shared/components/feedback/Toast`, navigate with `useRouter` + `getLocalizedRoute(locale, ROUTES.X)`.

6. **Components** in `components/`. Client components mark `'use client'`. Use:
   - `cn()` from `@/shared/lib/cn` to compose Tailwind classes
   - shadcn primitives from `@/components/ui/*`
   - `useTranslations('<namespace>')` for copy (add keys via `add-i18n-key` skill)
   - `ScrollReveal` for reveals; Framer Motion for custom motion (see `docs/styling-and-motion.md`)

7. **Page entry** `<Feature>Page.tsx`:

```tsx
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

interface Props { locale: Locale }

export async function FeaturePage({ locale }: Props) {
  const dict = await getDictionary(locale)
  // fetch via server service if needed
  return (/* JSX using dict.feature.* and components */)
}
```

8. **`index.ts`** — re-export only what other modules need. Default to NO re-exports until a real cross-module consumer appears.

## Rules

- Keep files small. Split when one component exceeds ~250 lines or covers multiple concerns.
- Never import `server-only` files from client components or hooks.
- API base/auth token is handled by `http` — do not reimplement.
- Don't introduce new state libraries; reach for `useState` first, zustand only when state is genuinely cross-component or persisted.
- Use the `ROUTES` constant for navigation; never hardcode paths.
