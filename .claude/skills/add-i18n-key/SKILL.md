---
name: add-i18n-key
description: Use when adding, renaming, or removing a translation key, or when introducing user-facing strings. Ensures both `src/locales/en.ts` and `src/locales/ar.ts` stay in sync with the dictionary type.
---

# Add an i18n key

`src/locales/en.ts` is the SOURCE OF TRUTH. Its inferred type becomes `Dictionary` (via `DeepWiden`). If a key is missing in `ar.ts`, it falls back to `en` (deep merge in `src/i18n/dictionaries.ts`).

## Procedure

1. **Choose a namespace.** Top-level keys = namespaces (e.g. `auth`, `home`, `navigation`). Reuse an existing one; create a new top-level only for a genuinely new area.

2. **Edit `src/locales/en.ts`.** Add the key with the final English copy. Keep nesting consistent with siblings. Arrays of objects must keep the same object shape across locales.

3. **Edit `src/locales/ar.ts`.** Add the same key path with Arabic text. The shape MUST match `en.ts`. Partial overrides are allowed — leave a sub-tree unset only if you genuinely want `en` to leak through.

4. **Reference it.**
   - Server: `const t = await getTranslations('namespace')` from `@/i18n/server`.
   - Client: `const t = useTranslations('namespace')` from `@/i18n/DictionaryProvider`.

5. **RTL check.** If the new copy contains punctuation or mixed numbers, glance at the page with `?` swapped to `/ar/...` once. Layout already toggles `dir` via `isRtl()`.

## Rules

- Never hardcode user-facing strings in components — always through the dictionary.
- Do NOT widen types manually; `Dictionary` is derived from `en.ts`.
- Interpolation tokens like `{{year}}` are literal strings — replace at the call site.
- When removing a key, remove from BOTH files.

## Example

`src/locales/en.ts`:
```ts
auth: {
  login: {
    submit: 'Sign in',
    welcomeBack: 'Welcome back',
  },
  ...
}
```

`src/locales/ar.ts`:
```ts
auth: {
  login: {
    submit: 'تسجيل الدخول',
    welcomeBack: 'مرحبًا بعودتك',
  },
  ...
}
```

Usage:
```tsx
'use client'
import { useTranslations } from '@/i18n/DictionaryProvider'
const auth = useTranslations('auth')
return <button>{auth.login.submit}</button>
```
