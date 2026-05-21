---
name: add-localized-route
description: Use when adding a new page route under `src/app/[locale]/`. Covers route-group choice, registering the path in `ROUTES`, protecting it via the proxy, and wiring the page to its module.
---

# Add a localized route

All app routes live under `src/app/[locale]/`. The locale segment is required — middleware (`src/proxy.ts`) handles redirect/sticky behavior. Hrefs must use `getLocalizedRoute()`.

## Steps

1. **Pick the route group**:
   - `(marketing)` — public site (home, about, contact)
     - `(marketing)/(profile)` — authenticated profile pages
     - `(marketing)/(academy)` — academy pages
   - `(auth)` — login / register / forgot-password (auth shell layout)
   - `(dashboard)` — protected dashboard (auth-gated layout)

   Choose by which layout the page should inherit. Create a new group only if the layout truly differs.

2. **Create the page**: `src/app/[locale]/(group)/<segment>/page.tsx`. Keep it thin:

```tsx
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { MyFeaturePage } from '@/modules/<feature>/MyFeaturePage';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  return <MyFeaturePage locale={locale as Locale} />;
}
```

- `params` is a Promise in Next 16 — always `await`.
- Validate `hasLocale()` and `notFound()` on miss.

3. **Register the path** in `src/shared/constants/routes.ts`:

```ts
export const ROUTES = {
  ...,
  MY_NEW_PAGE: '/my-new-page',
} as const
```

4. **Protect (if needed)** in `src/proxy.ts`:
   - Auth-required → add to `PROTECTED_PREFIXES`
   - Auth-only (redirect away if signed in, like login) → add to `AUTH_PATHS`

5. **Link to it** with the helper, never hardcoded:

```tsx
import Link from 'next/link'
import { useLocale } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { ROUTES } from '@/shared/constants/routes'

const locale = useLocale()
<Link href={getLocalizedRoute(locale, ROUTES.MY_NEW_PAGE)}>...</Link>
```

6. **Add metadata** (optional) via `generateMetadata` in the page or its group layout, pulling copy from the dictionary (`getDictionary(locale)`).

7. **Add translation keys** for any new UI strings — see the `add-i18n-key` skill.

## Rules

- Routes ALWAYS go under `[locale]/`. Never put pages at `src/app/<path>/page.tsx` (that exists only for the top-level locale redirect).
- Never hardcode `/en/...` or raw paths in hrefs / `router.push` — use `getLocalizedRoute(locale, ROUTES.X)`.
- `params`, `cookies()`, `headers()` are async in Next 16 — `await` them.
- If your page calls upstream data, fetch in the module's `server/` service and pass through props, not in the page file directly.
- Route groups (`(name)`) don't appear in the URL; segments do.
