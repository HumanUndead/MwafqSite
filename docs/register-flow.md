# Register Flow — Design, API, and Data Contract

## Status

The personal "Register" form (`RegisterForm.tsx`) is **built and fully wired**, but currently **not mounted**. The `/register` route renders `RegisterFlow.tsx`, which is hardcoded to show `CompanyCreateForm` only:

```tsx
// src/modules/auth/components/RegisterFlow.tsx
export function RegisterFlow() {
  return <CompanyCreateForm />;
}
```

The `RegisterForm` + personal-registration step is commented out in the same file. The API routes and hooks below are live and reachable directly (e.g. via curl or by re-enabling the component) — they are not deprecated, just unmounted from the UI.

> Base URL note: register/OTP endpoints currently read from `MWAFQ_API_BASE_URL` (default `https://stagingapi.mwafq.com/`) in `src/shared/constants/config.ts`. Per request, all example commands below use:
> ```
> INFRASTRUCTURE_URL=https://infrastructure.mwafq.com
> ```
> as the upstream base — swap in whichever base URL matches the environment you're testing.

## Plan: move Register into the SSO project

Intent: relocate the register + OTP-verify flow into the SSO project (`infrastructure.mwafq.com`), so that:

- This site (Mwafq Site) **stops owning** the register form and register/OTP API calls.
- The SSO project handles registration and OTP verification entirely on its own side.
- **Nothing is persisted back to this project** — no cookies, no token, no user record created here.
- On successful OTP verification, the SSO project **redirects the browser** to:
  ```
  https://site.mwafq.com/en/login
  ```
  so the user logs in normally (via the existing SSO login flow) after registering.

This turns Mwafq Site's role in registration into "none" — it becomes purely a redirect target. The sections below describe the **current** implementation (still live in this repo) for reference while migrating, plus the new Register endpoint confirmed for the SSO side.

---

## 1. Design — Form Fields

Component: `src/modules/auth/components/RegisterForm.tsx`

| Field | Input type | Client validation |
|---|---|---|
| First name | text | min 2 chars |
| Last name | text | min 2 chars |
| Identity number (Iqama/ID) | text (numeric, 10 digits) | `^\d{10}$` |
| Phone number | tel | Saudi format `^05\d{8}$` (auto-normalized as user types) |
| Date of birth | date | optional, max = today |
| Password | password | 8+ chars, upper, lower, number, special char |
| Confirm password | password | must match password |
| Profile image | file (optional) | any image type |

Password strength is shown live via a checklist (`PasswordRequirementList`) driven by `getPasswordChecks()` in `src/modules/auth/passwordRules.ts`:

```ts
export const PASSWORD_MIN_LENGTH = 8;
// checks: minLength, uppercase, lowercase, number, special
```

### Flow steps (`useRegister` hook state machine)

```
'form' → submit → 'otp' (OTP modal opens) → verify → 'done' (or onComplete callback)
```

1. **form** — user fills `RegisterForm`, submits.
2. **otp** — on success, an `OtpModal` opens targeting `response.data.userName` (the identity number). User can verify or resend.
3. **done** — on successful OTP verification: success toast shown, redirect to home (unless a custom `onComplete` was passed in, e.g. to chain into `CompanyCreateForm`).

> This describes the **current** implementation only. Once Register moves to the SSO project (see section 2), step 3 is replaced entirely: the SSO project discards everything and redirects to `https://site.mwafq.com/en/login` — this site never receives a token or user payload from registration.

---

## 2. New SSO-side API (target state)

**Confirmed with backend:** the register + OTP APIs are **exactly the same** endpoints, paths, and payload shapes as the current implementation (section 3 below) — same `/api/Authenticate/Auth/...` routes, same `multipart/form-data` register body, same query-param OTP calls. **The only thing that changes is the base URL**, which moves from `MWAFQ_API_BASE_URL` to:

```
INFRASTRUCTURE_URL=https://infrastructure.mwafq.com
```

### 2.1 Register — `POST {INFRASTRUCTURE_URL}/api/Authenticate/Auth/Register`

```bash
INFRASTRUCTURE_URL=https://infrastructure.mwafq.com

curl -X POST "$INFRASTRUCTURE_URL/api/Authenticate/Auth/Register" \
  -F "PhoneNumber=0512345678" \
  -F "FirstName=John" \
  -F "LastName=Doe" \
  -F "CountryID=14" \
  -F "IdentityNumber=1234567890" \
  -F "Id=" \
  -F "Password=YourStrongPass123!" \
  -F "ConfirmPassword=YourStrongPass123!" \
  -F "DateOfBirth=1990-01-01"
```

### 2.2 Resend OTP — `POST {INFRASTRUCTURE_URL}/api/Authenticate/Auth/Resend`

```bash
INFRASTRUCTURE_URL=https://infrastructure.mwafq.com

curl -X POST "$INFRASTRUCTURE_URL/api/Authenticate/Auth/Resend?UserName=1234567890"
```

### 2.3 Verify OTP — `GET {INFRASTRUCTURE_URL}/api/Authenticate/Auth/VerifyOTP`

```bash
INFRASTRUCTURE_URL=https://infrastructure.mwafq.com

curl "$INFRASTRUCTURE_URL/api/Authenticate/Auth/VerifyOTP?UserName=1234567890&OTP=123456"
```

**Target behavior on success:** on successful OTP verification, the SSO project must **discard everything** — no token, no cookie, no user payload kept or handed back to Mwafq Site — and simply redirect the browser to:

```
https://site.mwafq.com/en/login
```

The `/en/` locale segment is just the default — Mwafq Site resolves `en` vs `ar` from the locale cookie already stored in the browser (see `src/proxy.ts` / `src/i18n`), so the SSO project doesn't need to know or pass the user's language; it can always redirect to the same URL and the site's own locale handling takes over from there.

### Open items before this migration is final

- Confirm whether the SSO project's own register form/UI wraps these calls, or if Mwafq Site still needs to render a form pointed at the new base URL.

---

## 3. Current implementation (this repo, still live)

All calls go through local Next.js API routes (`src/app/api/auth/...`), which validate/normalize input, then forward to the upstream API and set cookies where relevant. This section stays for reference during the migration above — once Register moves to the SSO project, this flow should be removed from Mwafq Site.

### 3.1 Register — `POST /api/auth/register`

Client: `authApi.register(data: RegisterDto)` in `src/modules/auth/api/authApi.ts`. Sends `multipart/form-data`.

**Client → local route fields:**

| Field | Notes |
|---|---|
| `PhoneNumber` | normalized to local `0XXXXXXXXX` format before send |
| `FirstName` | trimmed |
| `LastName` | trimmed |
| `CountryID` | hardcoded `14` (Saudi Arabia) |
| `IdentityNumber` | trimmed |
| `RelatedTo` | empty string |
| `Password` | raw |
| `ConfirmPassword` | raw |
| `DateOfBirth` | optional, ISO date string |
| `Img` | optional file |

**Local route validation** (`src/app/api/auth/register/route.ts`) before forwarding upstream:
- Required: phone, first name, last name, identity number, password, confirm password → 400 if missing.
- `isStrongPassword(password)` must pass → 400 `"Password does not meet all requirements."`
- `password === confirmPassword` → 400 `"Passwords do not match."`

**Upstream call:**

```
POST {INFRASTRUCTURE_URL}/api/Authenticate/Auth/Register
Content-Type: multipart/form-data
```

Upstream fields sent: `PhoneNumber`, `FirstName`, `LastName`, `CountryID=14`, `IdentityNumber`, `Id` (empty unless resuming), `Password`, `ConfirmPassword`, optional `DateOfBirth`, optional `Img`.

#### curl — local route

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -F "PhoneNumber=0512345678" \
  -F "FirstName=John" \
  -F "LastName=Doe" \
  -F "IdentityNumber=1234567890" \
  -F "Password=YourStrongPass123!" \
  -F "ConfirmPassword=YourStrongPass123!" \
  -F "DateOfBirth=1990-01-01"
```

#### curl — upstream directly

```bash
INFRASTRUCTURE_URL=https://infrastructure.mwafq.com

curl -X POST "$INFRASTRUCTURE_URL/api/Authenticate/Auth/Register" \
  -F "PhoneNumber=0512345678" \
  -F "FirstName=John" \
  -F "LastName=Doe" \
  -F "CountryID=14" \
  -F "IdentityNumber=1234567890" \
  -F "Id=" \
  -F "Password=YourStrongPass123!" \
  -F "ConfirmPassword=YourStrongPass123!" \
  -F "DateOfBirth=1990-01-01"
```

**Success response (local route):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "phoneNumber": "0512345678",
    "userName": "1234567890",
    "registrationId": "…or null…",
    "raw": { "…upstream payload…": true }
  }
}
```

**Failure response shape:**

```json
{
  "success": false,
  "message": "…upstream or validation message…",
  "code": "…upstream error code, if any…",
  "data": null
}
```

---

### 3.2 Resend OTP — `POST /api/auth/otp/resend`

Client: `otpApi.resendUserNameOtp(userName: string)`.

```
POST {INFRASTRUCTURE_URL}/api/Authenticate/Auth/Resend?UserName={userName}
```

```bash
curl -X POST http://localhost:3000/api/auth/otp/resend \
  -H "Content-Type: application/json" \
  -d '{"userName":"1234567890"}'
```

```bash
INFRASTRUCTURE_URL=https://infrastructure.mwafq.com
curl -X POST "$INFRASTRUCTURE_URL/api/Authenticate/Auth/Resend?UserName=1234567890"
```

---

### 3.3 Verify OTP — `GET /api/auth/otp/verify`

Client: `otpApi.verifyUserNameOtp(userName, otp)`.

```
GET {INFRASTRUCTURE_URL}/api/Authenticate/Auth/VerifyOTP?UserName={userName}&OTP={otp}
```

On success, the local route extracts the upstream payload and returns `{ user, token, raw }`, setting the relevant auth cookies on this response. This is **current-implementation-only** behavior — once Register moves to the SSO project, none of this applies to Mwafq Site; see section 2.

```bash
curl "http://localhost:3000/api/auth/otp/verify?UserName=1234567890&OTP=123456" -i
```

```bash
INFRASTRUCTURE_URL=https://infrastructure.mwafq.com
curl "$INFRASTRUCTURE_URL/api/Authenticate/Auth/VerifyOTP?UserName=1234567890&OTP=123456"
```

This is **current-implementation-only** behavior. Once Register moves to the SSO project, verification no longer returns anything to Mwafq Site — the SSO project discards the result and redirects straight to `https://site.mwafq.com/en/login` (see section 2).

---

## 4. What Register "Takes" — Summary Payload

### Target state (SSO project)

1. **Register call** — first name, last name, identity number (10 digits), Saudi phone number, strong password + confirm, optional DOB, optional profile image.
2. **OTP resend (optional)** — identity number (`userName`) only, if the user needs a new code.
3. **OTP verify** — identity number (`userName`) + the 6-digit OTP code.

After step 3, the SSO project discards everything and redirects the browser to `https://site.mwafq.com/en/login`.

### Current implementation (this repo, for reference)

Same three steps as above, except step 3 currently returns a user + token to Mwafq Site and sets auth cookies before redirecting to `ROUTES.HOME` (or handing off to a caller-supplied `onComplete`, e.g. to continue into company creation) — see section 3 for details.
