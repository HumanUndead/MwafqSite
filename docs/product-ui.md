# Product UI — profile, academy, auth

Binding for the signed-in product surfaces: profile pages (personal info,
academy courses, reservations, family, favorites), every academy page, the
login page and the OTP modal. Marketing pages keep their own look.

Order of priorities: clarity → hierarchy → usability → consistency →
accessibility → looks. If an element does not help the user do something,
remove it.

## Building blocks

Import from `@/shared/components/product`:

| Component | Use |
| --- | --- |
| `PageHeader` | One per page. `title` (h1), one-line `description` (what the page is for), `actions` (the page's primary action, max 2 buttons). |
| `Panel` / `PanelHeader` | The only surface. White, `border border-[#e5e7f0]`, `rounded-2xl`, `p-5 sm:p-6`. `flush` for edge-to-edge row lists. **Never put a Panel inside a Panel.** Inside a panel, group with dividers (`divide-y divide-[#eef0f7]`) and spacing. |
| `StatusBadge` | Status text with tone `neutral / info / success / warning / danger`. Max one per row. |
| `EmptyState` | Inside a Panel. Title says what is empty; description says what to do; one action. |
| `ErrorState` | Load failure. Title + retry. Uses `role=alert`. |
| `Notice` | Inline info/warning above content (e.g. "you can't see this member's courses yet"). |
| `Skeleton` | Loading blocks. Loading states mirror the real layout (same panels, same row heights). |
| `InfoList` / `InfoItem` | Label/value pairs (personal info, reservation details). |
| `productTabsListClass` / `productTabsTriggerClass` | shadcn `Tabs` with `variant='line'`. Underline tabs, scroll sideways on mobile. `productCountClass` for counts. |

Buttons: `Button` from `@/shared/components/ui/Button` (custom) with:

| Variant | Size | Use |
| --- | --- | --- |
| `product` | `control` (44px) | The one primary action in a view. |
| `productSecondary` | `control` / `compact` (36px) | Secondary actions. |
| `productText` | `compact` | Low-priority / row actions ("View details"). |
| `productDanger` | `compact` | Destructive row action (always behind `ConfirmDialog`). |

For links that look like buttons: `buttonVariants({ variant, size })` on `next/link`.
Use `Modal` / `ConfirmDialog` from `@/shared/components/ui` for dialogs.

## Tokens

- Page background `#f3f4f8`. Surfaces `#ffffff`. Border `#e5e7f0`; inner dividers `#eef0f7`; input border `#d9ddea`.
- Text: primary `#1e2364`; secondary `#6b7196` (only on white or `#f3f4f8`); tertiary label on tinted bg `#4a5078`.
- Primary action / selected: `#1e2364`. Accent (progress, active tab line, focus on light): `#00a8f1`.
- **Link text is `#0077ad`**, not `#00a8f1` (`#00a8f1` on white fails contrast for text).
- Status colors only via `StatusBadge` / `Notice` tones.
- No gradients, glass, blur, glows, decorative blobs, or colored shadows. No `shadow-*` on panels. Dialogs and popovers may use `shadow-xl`.

## Type

LamaSans; weights **400 / 600 / 700 only** (no `font-extrabold`, no negative tracking).

| Role | Class |
| --- | --- |
| Page title (h1) | `PageHeader` → 24px / 28px bold |
| Section / panel title | `PanelHeader` → 17px bold |
| Item title (row, card) | `text-[15px] font-bold` (or 16px in roomy cards) |
| Body | `text-[15px]` / `text-[14px]` leading-6 |
| Meta, labels | `text-[13px] font-semibold text-[#6b7196]` |

Numbers: `tabular-nums`. Dates, times, phone numbers and IDs inside Arabic text: wrap in `<bdi>` or `dir='ltr'`.

## Layout & spacing

- Page stack: `flex flex-col gap-6` (header → panels).
- Panel internals: `gap-4` / `gap-5`; list rows `py-4` with `px-5 sm:px-6` when the panel is `flush`.
- Radius: panels 16px (`rounded-2xl`), controls/buttons 12px (`rounded-xl`, from size), media 12px, badges 6px. No `rounded-[28px]` pills on content.
- Lists of items: prefer rows in a flush Panel (`divide-y`) over a grid of cards. Use a card grid only when items are visual (course covers, services).
- Icons: lucide only, `size-4`/`size-5`, `aria-hidden`. Only where they carry meaning (status, location, date in a fact list, empty state). Not next to every label.

## Responsive

- Design mobile on purpose: rows stack (title → meta → actions), actions become full-width (`max-sm:w-full`), tabs scroll sideways, filters stay one row.
- Touch targets ≥ 44px for primary actions (`size='control'`); dense row actions use `compact` (36px) with enough gap.
- Long Arabic names/titles: `min-w-0` on flex children + `break-words` / `line-clamp-2`. Never `truncate` a name without a full-text alternative.

## RTL

Logical utilities only (`ps/pe/ms/me/start/end/text-start`). Directional icons (`ChevronRight`, `ArrowLeft`…) get `rtl:rotate-180`. Progress bars fill from the start side. Test `/ar` first.

## States

Every data view handles: loading (layout-matched `Skeleton`), empty (`EmptyState`), error (`ErrorState` + retry), and success feedback after actions (existing `toast`). Disabled buttons keep their label and show why nearby when it isn't obvious.

## Motion

Almost none. `transition-colors duration-150` on interactive elements. No `ScrollReveal` on product pages, no hover lift/scale, no entrance animations. Keep progress transitions with `motion-reduce:transition-none`.

## Copy

All strings from the dictionaries; edit `src/locales/en.ts` and `ar.ts` together. Specific button labels ("Add family member", "View reservation") over vague ones ("Manage", "More"). Arabic copy should read naturally, not as a literal translation.
