# Deep linking (Universal Links / App Links)

Shared links under `/app/*` open the Mwafq mobile app when it is installed, and
fall back to a store page on the web when it is not.

## 1. Identifiers

| Platform | Value                       | Source                               |
| -------- | --------------------------- | ------------------------------------ |
| Android  | `com.kensoftware.mwafq`     | `src/modules/deep-linking/config.ts` |
| Android  | SHA-256 signing fingerprint | `src/modules/deep-linking/config.ts` |
| iOS      | `MMW8FUN7RD.com.mwafq.b2c`  | `src/modules/deep-linking/config.ts` |
| iOS      | App Store id `6806986285`   | `src/modules/deep-linking/config.ts` |

Everything else derives from these. Change them in one place.

## 2. Association files

Two route handlers, both prerendered static and served as `application/json`:

- [src/app/.well-known/assetlinks.json/route.ts](../src/app/.well-known/assetlinks.json/route.ts)
- [src/app/.well-known/apple-app-site-association/route.ts](../src/app/.well-known/apple-app-site-association/route.ts)

Payloads are built in
[src/modules/deep-linking/associations.ts](../src/modules/deep-linking/associations.ts).
The AASA `paths` list is generated from `locales`, so it stays in sync when a
locale is added: `/app`, `/app/*`, `/en/app`, `/en/app/*`, `/ar/app`, `/ar/app/*`.

Route handlers rather than files in `public/` — they guarantee the
`Content-Type`, which matters because `apple-app-site-association` has no
extension and would otherwise be served as `application/octet-stream`.

### Serving requirements (each fails silently if missed)

1. Exactly `https://site.mwafq.com/.well-known/<file>`
2. `Content-Type: application/json`
3. **No redirect** — both platforms refuse a redirected file
4. No auth, no bot protection (Cloudflare "under attack" mode blocks Apple's
   fetcher)

Requirement 3 is the trap for this codebase: the locale proxy redirects every
unmatched path to `/<locale>/...`. `/.well-known` is excluded twice in
[src/proxy.ts](../src/proxy.ts) — from the `matcher` (so the proxy never runs)
and by an early `return` inside it (so it stays correct if the matcher changes).
Do not remove either.

### Verify after deploy

```bash
curl -sI https://site.mwafq.com/.well-known/assetlinks.json
curl -sI https://site.mwafq.com/.well-known/apple-app-site-association
```

Expect `200`, `content-type: application/json`, and no `location` header.

## 3. Web fallback pages

- [src/app/[locale]/(marketing)/app/page.tsx](<../src/app/[locale]/(marketing)/app/page.tsx>) — `/app`
- [src/app/[locale]/(marketing)/app/[...path]/page.tsx](<../src/app/[locale]/(marketing)/app/[...path]/page.tsx>) — every `/app/...` path

Both render `AppLinkPage` from `@/modules/deep-linking`.

People with the app rarely see these — the OS matches the URL against the
verified domain and opens the app before any HTTP request happens. When that
first layer misses (in-app webviews such as WhatsApp or Instagram, an Android
install whose App Links were never verified), the page itself retries the
handoff on mount, so the visitor still lands in the app or the store without
tapping anything. See §4.

The catch-all means any path shared in future already has a live fallback; no
route work is needed per link type. Pages are `noindex` and `/app` is in the
`robots.txt` disallow list.

## 4. Automatic handoff and store fallback

[src/modules/deep-linking/hooks/useAppHandoff.ts](../src/modules/deep-linking/hooks/useAppHandoff.ts)
detects the platform on mount and immediately navigates away:

- **Android** — `window.location.replace(<intent:// URL>)`. Chrome opens the
  app, or follows `browser_fallback_url` to Play Store.
- **iOS** — the App Store. Reaching the page means the Universal Link already
  failed and there is no way to retry it from JavaScript.
- **Desktop / unknown** — no navigation; the card stays.

The attempt is claimed in `sessionStorage`, keyed by pathname. Without that
guard, backing out of the store re-fires the redirect and traps the visitor.
Blocked storage (private mode) degrades to "attempt once, no back guard".

[AppLinkActions.tsx](../src/modules/deep-linking/components/AppLinkActions.tsx)
then renders the manual retry, for desktop and for browsers that swallowed the
automatic attempt (Firefox on Android ignores `intent://`):

- **Android** — primary button is an `intent://` URL for the current page:

  ```
  intent://site.mwafq.com/en/app/x?y=1#Intent;scheme=https;package=com.kensoftware.mwafq;S.browser_fallback_url=<encoded Play Store URL>;end
  ```

  `scheme=https` reuses the App Link, so no custom URL scheme is needed. Chrome
  opens the app if installed, otherwise follows `browser_fallback_url`.

- **iOS** — App Store button, plus the Smart App Banner
  (`<meta name="apple-itunes-app">`, emitted via Next's `itunes` metadata field
  in [metadata.ts](../src/modules/deep-linking/metadata.ts)).

- **Desktop / unknown** — both store links.

### iOS App Store id

`6806986285`, taken from the App Store Connect URL
(`appstoreconnect.apple.com/apps/<id>/...`). Committed as the default in
`config.ts`, overridable via `NEXT_PUBLIC_IOS_APP_STORE_ID`.

**Known state: the app is under review, not released.** Until it goes live the
automatic iOS redirect, the App Store button and the Smart App Banner all point
at a store page that does not resolve — `itunes.apple.com/lookup?id=6806986285`
returns `resultCount: 0` on
both the US and SA storefronts. This was accepted deliberately so nothing has to
change at release; the links start working on their own the moment the app
publishes.

To hide the iOS half in a given environment, set
`NEXT_PUBLIC_IOS_APP_STORE_ID=''`. Note `NEXT_PUBLIC_*` is inlined at build
time — setting it on an already-running server does nothing, and a rebuild is
required.

The Android half works today.

## 5. Native-side work (does not ship over the air)

- iOS: Associated Domains capability with `applinks:site.mwafq.com`, matching
  Team ID + bundle id, native rebuild
- Android: `<intent-filter>` with `android:autoVerify="true"`, signing cert
  matching the fingerprint above, native rebuild. It must claim **all three**
  path prefixes, mirroring the AASA list — a filter with only `/app` misses a
  shared `/en/app/...` link and hands it to the browser:

  ```xml
  <data android:scheme="https" android:host="site.mwafq.com" android:pathPrefix="/app" />
  <data android:scheme="https" android:host="site.mwafq.com" android:pathPrefix="/en/app" />
  <data android:scheme="https" android:host="site.mwafq.com" android:pathPrefix="/ar/app" />
  ```

## 6. Open questions

- The two apps use unrelated identifiers (`com.kensoftware.mwafq` vs
  `com.mwafq.b2c`). Confirm both are the B2C app.
- Which concrete `/app/...` paths will be shared? The catch-all covers them, but
  mapping them to real web content (rather than the generic handoff card) is
  follow-up work.
