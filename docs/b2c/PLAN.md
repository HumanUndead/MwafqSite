# B2C services + academy migration plan

Source of truth for behaviour: the mobile app (RefactoredMwafqMobile). Specs extracted from it:

- [mobile-services-spec.md](mobile-services-spec.md): catalogue, basket, reservation flow, payment, family, reservations
- [mobile-academy-spec.md](mobile-academy-spec.md): browse, course details, purchase, learning flow, quizzes, history

Both apps share one backend.

## Decisions (confirmed)

| Topic | Decision |
|---|---|
| Order API | `Client/ClientOrder/CreateClientOrder` for services and courses. Pay with `TargetId = clientOrderId`. Legacy `CreateReservation` / `CreateUserCourse` are removed from the site. |
| Academy language | Academy-only language picker: en, ar, ur, ne, bn, hi. Persisted per browser. Sent as `culture=` on academy requests. Academy UI strings in all 6 languages. RTL for ar and ur. |
| Quiz timer expiry | Match mobile: no submit. Show "Time is up", then return to the course. |
| Family | Full management like mobile, plus the buyer picker in checkout. |

## Defaults

- Favorites are stored locally (there is no API). Limit 20 per type.
- Free courses (price <= 0) show "Free" but cannot be bought, because the backend has no free-enrol endpoint.
- Scope is B2C client only. No company-member academy scope.
- A settled payment clears the draft and the basket.
- Moyasar hosted form, card methods only: mada, visa, mastercard, amex.
- Feature toggles come from `General/B2CManagement/List`. A missing area counts as enabled.
- The quiz is fetched with `Academy/Quiz/GetById?Id&UserCourseId`.

## Academy approach (user direction)

The academy keeps the site's existing flow (`modules/academy`, `modules/auth` course pages,
`modules/profile-academy`) and closes the gaps against mobile inside those components.
No parallel academy screens.

Academy language: `AcademyScope` nests a `DictionaryProvider` whose `academy*` namespaces
follow the `mwafq-academy-lang` cookie (en/ar from the site dictionaries, ur/ne/bn/hi from
`src/locales/academy/*`). Academy API routes send that language as `culture`.

## Phases

0. Foundation
   - Fix the upstream and media base URLs.
   - Add a `checkout-payment` module:
     - route handlers for create-order, credit-card and check-status
     - outcome classifier and error codes
     - Moyasar form
     - `/[locale]/payment/callback`
     - pending-payment store and resumer
     - 5-minute payment session
   - Feature toggles.
1. Catalogue and basket
   - `/services` with Services and Groups tabs, search, favorites filter.
   - Basket store with the exclusivity rules, a basket drawer, the group details sheet.
   - Home featured rails.
   - Turn on the buy CTAs.
2. Family
   - Related / belongs-to lists.
   - Link an existing user.
   - Create a new member.
   - Handle requests (accept / reject).
   - Unlink.
3. Checkout wizard
   - Steps: family, facility, time, course (groups only, academy toggle), confirm.
   - Draft with a 24-hour TTL and resume.
   - Leave dialog.
   - Branch list and map.
   - Weekly slots.
   - Course plans.
   - Pay.
4. Reservations
   - Tabs: examinations (upcoming toggle) and results.
   - Full details via `Reservation/Reservation/GetById`.
5. Academy browse
   - Search, chips (all / featured / categories), paginated feed with Target=6.
   - Price rules.
   - Public course details showing the locked curriculum.
6. Academy purchase
   - Plan, then confirm, then `CreateClientOrder` with courses, then pay, then status.
   - Resume awaiting-payment courses.
7. My learning
   - Resume card, awaiting payment, in progress, completed.
8. Learning flow
   - Sequencing and locks (also guarded on direct URLs).
   - Vimeo player with custom controls.
   - SetProgress on ended.
   - All question types, timer, grid, outcome and retry, exit guard.
9. Quiz history
   - Server-paged list and a details page.
10. i18n en/ar, SEO, `proxy.ts` protected routes, lint and build, QA.

## Known site bugs fixed along the way

- Hardcoded `https://api.mwafq.com` in `ServiceGroupService.ts`, `servicesService.ts` and `api/services/service-groups`.
- Client components read the server-only `MWAFQ_API_BASE_URL`. Media and attachment URLs are wrong.
- `checkPaymentStatus` treats `success` as paid.
- No 3DS redirect handling. Missing services callback page.
- Duplicate reservations on retry.
- Stray expression in `services/loading.tsx`.
- Placeholder ratings, loremflickr images, demo reservation cards, `href='#'` links.
