# B2C Services → Basket → Reservation → Checkout → Payment: full spec (RefactoredMwafqMobile)

All paths below are under `C:\Users\lenovo\Desktop\comnbine\RefactoredMwafqMobile\src\`.

## 0. Architecture and transport basics

- **HTTP client:** `api/common/clientConfig.ts` and `api/common/client.tsx`.
  - Axios base URL is `${EXPO_PUBLIC_API_URL}api/`. The default timeout is 10 s.
  - The request interceptor adds `Authorization: Bearer <token>` when a token exists.
  - It also appends `culture=<i18n.language>` to every URL (using `&` or `?`). Values are `en` or `ar`, or the academy language on academy calls.
- **Route groups:** `apiRoutes = { authRoute, generalRoute, homeRoute, paymentRoute, coursesRoute, ordersRoute }`.
  - `homeRoute` is `features/client/home/api/route.ts`.
  - `paymentRoute` is `features/common/payment/api/route.ts`.
  - `authRoute` is `features/common/auth/api/route.ts`. The family / related-user calls are here.
- **Response envelopes** (`api/types.ts`):
```ts
export type GenericResponse<T> = {
  value: T; isSuccess: boolean; isFailure: boolean;
  error: { code: string; message: string; actionCode: string | null };
  actionCode: string | null;
};
export type GenericListResponse<T> = {
  value: { pageNumber: number; pageSize: number; totalRecords: number; totalPages: number; data: T };
  isSuccess: boolean; isFailure: boolean;
  error: { code: string; message: string };
};
export type ErrorResponse = { type: string; title: string; status: number; errors: { [key: string]: string }; traceId: string; code?: string; message?: string; };
```
- **Pagination:** backend list endpoints default to 10 per page. The app's infinite queries send `pageNumber` starting at 1. The next page is requested while `pageNumber < totalPages` (`shared/hooks/api/useAxiosTanstack.ts`).
- **Image and file URLs** (`shared/helpers/imageUrl.ts`):
  - Images: `${EXPO_PUBLIC_API_URL}${imageId}${ext}`. Extensions are `_200x200.png`, `_500x250.webp`, `_1920x1080.webp`, `_1000x600.webp`, `_960x960.webp`. Icons and logos use `_200x200.png`.
  - Attachments and downloads: `${EXPO_PUBLIC_API_URL}${path}`.
- **Error handling** (`api/common/apiErrorHandler.ts`):
  - Toasts: 400 ("first `errors[key]`" or generic), 403, 404, 422, 500, and 600. Identical toasts within 3 s are shown once.
  - 401 triggers sign-out. POST, PUT and DELETE calls also show a "session ended" toast.
  - Timeouts and network errors show a toast, except when offline.
  - 600 is the payment "business error" status. Its body is a **bare** `{ code, message, actionCode }`, not the envelope. `code` may carry the prefix `"Missing resource: "`, which must be stripped. The code maps to app copy (section 5.9).
  - Silent paths (no toast): `DeletePushToken`, `MobileVersions/Check`, `Auth/getUserByToken`, `General/Article/`, `General/ArticleCategory/`.

---

## 1. Screens and navigation, in order

### 1.1 Entry: catalogue and basket (browsing is public; booking needs sign-in)

**Home** (`features/client/home/screens/HomeScreen.tsx`) contains:
- `UpcomingAppointments`, signed-in users only. It calls `GetMyReservations` with `status=2`, i.e. Accept.
- `HomeServices` rail: `Service/Service/List?IsFeatured=true&Target=1&PageSize=20`. Shows up to 12 tiles, which are display-only. "View all" goes to `/home/serviceList`.
- `HomeServiceGroups` rail: `Service/ServiceGroup/List?IsFeatured=true&Target=1&PageSize=20`. "View all" goes to `/home/serviceList?tab=serviceGroups`.
- The tab-bar middle button pushes `routes.home.serviceList`.

**Catalogue** (`features/client/home/screens/ServiceCatalogScreen.tsx`, route `app/(app)/client/(mainTabs)/home/serviceList.tsx`) has two tabs, `services` and `serviceGroups`. The URL param `tab` selects the tab.

**Services tab** (`components/ServiceCatalogList.tsx`):
- Search box with a 350 ms debounce; URL param `servicesSearch`.
- Result count taken from `totalRecords`.
- "Favorites only" chip; URL param `servicesFavoritesOnly`. When on, it sends `Ids=` from the local favorites store.
- Infinite list of `ServiceListRow`s, 20 per page. Each row has:
  - `FavoriteButton` (heart)
  - `AddToBasketButton` (+ / check)
- A floating `BasketButton` appears when `basket.services.length > 0`. It shows the count, capped at "99+".
  - Tapping it opens `BasketModal`, a bottom sheet listing the basket services (`Service/Service/List?Ids=..`). Each row has a remove button.
  - Sheet buttons: **Continue** and **Clear basket** (asks for confirmation, then shows a toast).
  - Continue runs `requireAuth.guard(enterReservationFlow, familySelect)`. A signed-out user gets a "Sign-in required" confirmation, then login with a returnTo.

**Service groups tab** (`components/ServiceGroupCatalogList.tsx`):
- Same search, count and favorites UI. URL params are `groupsSearch` and `groupsFavoritesOnly`.
- Each `ServiceGroupCard` has:
  - A body, and a "view services" row, that both open `ServiceGroupDetailsSheet`. The sheet calls `Service/ServiceGroup/GetById` and lists `serviceGroupServices[].serviceName`, with a Select or Deselect button. Select is disabled when the group has no services.
  - A heart.
  - A radio circle that selects or deselects the group.
- `ServiceGroupContinueBar` floats when a group is selected. It shows the group name and "N services". Continue follows the same auth guard, then `enterReservationFlow`.

**Basket rules** (`shared/store/basketStore.ts`, persisted to storage key `basket-store`):
- State is `{ services: number[]; serviceGroups: number[]; courses: number[]; reservationDraft: ReservationDraft | null }`.
- Services are a multi-select toggle (`toggleBasketItem`).
- Service groups are **single-select** (`setExclusiveBasketItem`). Selecting the same id again deselects it.
- **The basket holds either one service group or N individual services, never both.**
  - Adding a service while a group is selected (`shared/hooks/useServiceBasketGuard.ts`) asks "Replace your selected service group {name}?". On confirm, the group is cleared and the service is added.
  - Selecting a group while services exist (`features/client/home/hooks/useServiceGroupSelection.tsx`) asks "Replace {count} selected services with {name}?". On confirm, services are cleared and the group is set.
  - Removing an item never asks for confirmation.
- There is no per-service provider in the basket. **One branch serves the whole basket**, picked in step 2.
- There is no per-buyer basket. **One owner (family member) per reservation**, picked in step 1.
- There is **no quantity** field.
- `courses` in the basket is unused by this flow. The course is picked inside the flow, for groups only.
- The basket ids never expire. The draft expires after 24 h (section 2.3).
- Sign-out clears baskets, the draft and favorites.

**`enterReservationFlow()`** (`shared/helpers/reservationFlow.ts`):
1. Calls `getResumableReservationDraft()`.
2. Pushes every step route up to and including the saved `stepId`, so Back walks down the flow one step at a time.
3. With no draft, it pushes only `familySelect`.

### 1.2 The reservation process

Routes are under `app/(app)/client/(mainTabs)/home/(reservationProcess)/`. Their `_layout.tsx` wraps the Stack in `ReservationProcessProvider`.

Step order (`shared/helpers/reservationDraft.ts` → `RESERVATION_FLOW_ORDER`):

| # | stepId | Screen file | Shown when |
|---|---|---|---|
| 1 | `familySelect` | `features/client/reservations/screens/FamilySelectScreen.tsx` | Always |
| 2 | `medicalFacilitySelect` | `.../MedicalFacilitySelectScreen.tsx` | Always |
| 3 | `appointmentSelect` | `.../AppointmentSelectScreen.tsx` | Always |
| 4 | `courseSelect` | `.../CourseSelectScreen.tsx` | **Only** when `reservation.service.serviceGroupId` is set **and** the dashboard academy toggle is on (see note) |
| 5 | `appointmentConfirm` | `.../AppointmentConfirmScreen.tsx` (renders `components/AppointmentConfirmationCard.tsx`) | Always |

Note on the course step:
- The academy toggle comes from `General/B2CManagement/List`: an item with `type=1` (academy) and `featureToggles & 1`.
- **If the permission list has no item for that area, the gate reads as enabled** (fails open).
- Individual-services bookings therefore have 4 steps and group bookings have 5.
- `(reservationProcess)/reservations.tsx` is not a step. It is an old list of home-info reservations.

There is no separate service-selection step. The flow books the basket as it was when the patient pressed Continue.

**Shared step chrome:**
- **Header** (`components/ReservationStepHeader.tsx`):
  - Title, and a Back button from step 2 onwards.
  - A segmented progress bar with "Step {step} of {total}".
  - An X "Leave this reservation?" action sheet:
    - **Save for later** keeps the draft and goes to the catalogue (the services tab, or the groups tab for a group booking).
    - **Discard reservation** clears both basket slices and the draft, then goes to home.
    - **Keep going** closes the sheet.
  - The message wording depends on the case (group / N services / empty).
  - On step 1, Android hardware back also opens this dialog.
  - Every step focus records `stepId` into the draft.
- **Bottom bar** (`components/ReservationStepBar.tsx`) is never disabled.
  - `ready=false` shows a hint line; pressing it flashes `blockedMessageTx`.
  - `ready=true` performs the step's action.

**Step 1: Book for** (`FamilySelectScreen` and `components/FamilySelect.tsx`)
- A `BookingSummaryCard` "You're booking" shows the first 4 of `serviceNames` as chips, then "+N more". For a group booking this is the group name.
- The member list is:
  - "You" (the signed-in user, `value=user.id`)
  - Every `relatedUsers.relatedToUsers[]`, using `value=user.userId` (GUID) and `label=fullName ?? ""`. **The app does not filter by status**, so pending and rejected relations also appear.
- The default selection is `appStore.selectedFamilyMember` (persisted), otherwise `user.id`.
- A tap writes `appStore.setSelectedFamilyMember(value)` and `setOwnerSelection(value)`.
- A footer dashed card "Add Family Member" links to `/(shared)/(addRelatedUser)/addExistRelatedUser`.
- Ready when `selectedFamilyMember || user.id`.
- Continue pushes `medicalFacilitySelect`.

**Step 2: Select Medical Facility** (`MedicalFacilitySelectScreen`)
- Query: `GetBranches`.
  - Individual services send `serviceIds=` repeated for each id.
  - A group sends `serviceGroupIds={groupId}`.
  - The map view also sends `latitude` / `longitude` for the map centre, rounded to 4 decimals and debounced 350 ms.
- The list keeps the backend order. It is never re-sorted by distance.
- Refetches on focus; supports pull-to-refresh.
- A List/Map toggle, plus a "{count} facilities" label.
- Each card (`components/MedicalFacilityCard.tsx`) shows:
  - Logo, or the first letter of the name.
  - Name.
  - Distance from the device GPS (Haversine km, 2 decimals), shown only when location permission is granted.
  - Address.
  - `totalPrice`, the total for this basket at this branch.
  - A radio circle.
  - Open weekday chips (`BranchWeekDays`) built from the `closingDays` bit flags.
  - A "Directions" button that opens Google Maps at the branch coordinates.
- Tapping the selected card again deselects it.
- Continue stores `setFacilitySelection({ serviceProviderBranchId, facilityName, isClosedToday, closingDays, scheduleOffs, price: parseFloat(totalPrice.toFixed(2)) })`, then pushes `appointmentSelect`.
  - `isClosedToday` is `closingDays.includes(CustomDays value of today)`.
- Hint before selection: "Pick a facility to continue". After selection it shows the facility name.

**Step 3: Select Appointment** (`AppointmentSelectScreen`, `components/TimeSlots.tsx`, `SlotServiceCard.tsx`, `AppointmentDatePicker.tsx`, `MonthCalendarSheet.tsx`)
- Query: `GetWeeklyAvailableTimeSlotsForBranch?serviceProviderBranch={branchId}`.
  - A group adds `&serviceGroupId={groupId}`.
  - Individual services add `&serviceId=a&serviceId=b…`.
- The response is a **weekly pattern keyed by English weekday name** (`day: "Sunday"`), not by date.
- The date picker is a one-week strip (Sunday start) with paging, plus a month sheet. Its bounds are today to today+180 days.
- `isDateBookable(date)` (`helpers/appointmentAvailability.ts`) returns false when the date:
  - is before today;
  - is today while `isClosedToday`;
  - is after today+180;
  - falls on a weekday in `closingDays` (bit flags: 1=Sat, 2=Sun, 4=Mon, 8=Tue, 16=Wed, 32=Thu, 64=Fri);
  - matches a `scheduleOffs[].date` (compared on its `YYYY-MM-DD` part);
  - is a weekday with no slots in the response.
- The screen auto-selects the first bookable date once the slots have loaded and nothing is selected yet.
- Slots for the chosen day are the entries where `slotTimesGroupedByDay.day === dayjs(date).locale('en').format('dddd')`.
- Grouping: they are grouped by `serviceProviderBranchServiceId` (`toGroupedServices`). Each group becomes a card showing:
  - the service name (`serviceGroupName || serviceName`) and its `price`;
  - a paged grid of from–to chips, 4 rows x 2 columns (1 column at large font).
- Selection allows **one slot per `serviceProviderBranchServiceId`**. Picking another slot in the same group replaces the earlier one; tapping the selected slot unselects it.
- Changing the date does **not** clear chosen slots.
- Ready when `chosenCount > 0 && chosenCount === distinct serviceProviderBranchServiceIds that day`.
- Hints:
  - "Choose an available date" when the day has no services.
  - "{n} still need a time" while some are missing.
  - When ready: "Next: add a course" or "Next: review and pay".
- On Next it computes:
  - `totalPrice = Σ slot.price`
  - `taxPrice = Σ slot.taxPrice`
  - It stores `{ dateChosen: "YYYY-MM-DD", selectedSlots, totalPrice, taxPrice }`, then pushes `courseSelect` or `appointmentConfirm`.

**Step 4: Select Course** (optional, groups only) (`CourseSelectScreen`)
- Query: `client/client/GetServiceGroupCourses?serviceGroupId={id}`.
- If the academy toggle is off, the screen immediately goes back (or replaces with `appointmentSelect`).
- Course cards show `translations[0].name`, `categoryName`, `fullImagePath` and `paymentSettings.price`. Tapping the selected card deselects it.
- Each course has a selling plan, `paymentSettings.sellingPlan` (`CourseSellingPlan`):
  - `Seperated` (2): the course price is required. "Certified Exam" (`certifiedExamPrice`) and "Sadad Service" (`sadadPrice`) are optional toggles. Total = `price + (certified ? certifiedExamPrice : 0) + (sadad ? sadadPrice : 0)`.
  - `Bulk` (4): total = `price + certifiedExamPrice + sadadPrice`, shown as a breakdown.
  - `CourseOnly` (1): total = `price`.
- The `CourseSelectedService` sent to the backend:
  - `Seperated` plan: sadad + certified = 7, sadad only = 3, certified only = 5, neither = 1.
  - `Bulk` or `CourseOnly` plan: 0.
- The bar reads "Skip this step / Optional" with no course selected, and "Next / {total}" with one.
- Next stores `{ courseId, selectedCertified, selectedSadad, courseSelectedService, courseTotalPrice: planTotal>0 ? planTotal : undefined }`, then pushes `appointmentConfirm`.

**Step 5: Confirm and Pay** (`AppointmentConfirmationCard`)
- **Booking for** section: shows the **signed-in user's** avatar and name (not the selected family member), and the facility name.
- **Date & time** section: `dateChosen`, then for each slot its label (`serviceName || serviceGroupName`), time range and price. With a single slot, the UTC offset is shown inline. A timezone note follows.
- **Price card** (`ConfirmPriceCard`): base price, tax, total course price (only if > 0), and total.
  - `basePrice = appointment.totalPrice ?? Σslot.price`
  - `taxAmount = appointment.taxPrice ?? Σslot.taxPrice`
  - `totalWithTax = basePrice + taxAmount + courseTotalPrice`
  - These are **display only**. The amount actually charged comes from the server.
- The bar reads "Pay now / VAT included", with a lock icon and a trailing pill showing the total. It is ready when `Math.round(total*100)` is a positive integer and nothing is in flight.
- The payment sequence is in section 3.8 and section 5.

### 1.3 Other related screens

| Route | Screen |
|---|---|
| `app/(app)/client/(mainTabs)/reservations/index.tsx` | `ReservationsScreen` (section 6) |
| `app/(app)/(shared)/reservationDetails/[id].tsx` | `ReservationDetailsScreen` |
| `app/(app)/client/(mainTabs)/home/locationView.tsx` | `LocationViewScreen`, a map for a reservation, using `Reservation/Reservation/GetById` |
| `app/(app)/(shared)/relatedUsers.tsx` | `features/common/profile/screens/ProfileRelatedUsersScreen.tsx` |
| `app/(app)/(shared)/(addRelatedUser)/addExistRelatedUser.tsx` | `AddExistingRelatedUserScreen` |
| `app/(app)/(shared)/(addRelatedUser)/addNewRelatedUser.tsx` | `AddNewRelatedUserScreen` |
| `app/(app)/(shared)/profile/requests.tsx` | `MyRequestsScreen` (pending relation requests) |
| `app/(app)/client/(mainTabs)/profile/favorites.tsx` | `FavoritesScreen` |

---

## 2. Flow state

### 2.1 Types (verbatim, from `shared/types/reservationDraft.types.ts`)
```ts
export type ReservationStepId = "familySelect" | "medicalFacilitySelect" | "appointmentSelect" | "courseSelect" | "appointmentConfirm";
export type ReservationScheduleOff = { date: string };
export type ReservationSelectedSlot = {
  slotTimeId: number; serviceProviderBranchServiceId: number;
  serviceId: number | null; serviceName: string | null;
  serviceGroupId: number; serviceGroupName: string;
  from: string; to: string; price?: number; taxPrice?: number;
};
export type ReservationServiceSelection = { serviceIds: number[]; serviceNames: string[]; serviceGroupId?: number };
export type ReservationFacilitySelection = {
  serviceProviderBranchId?: number; facilityName?: string; isClosedToday?: boolean;
  closingDays: number[]; scheduleOffs: ReservationScheduleOff[]; price?: number;
};
export type ReservationAppointmentSelection = { dateChosen?: string; selectedSlots: ReservationSelectedSlot[]; totalPrice?: number; taxPrice?: number };
export type ReservationCourseSelection = { courseId?: number; selectedCertified: boolean; selectedSadad: boolean; courseSelectedService?: CourseSelectedService; courseTotalPrice?: number };
export type ReservationProcessState = {
  service: ReservationServiceSelection | null; facility: ReservationFacilitySelection | null;
  appointment: ReservationAppointmentSelection; course: ReservationCourseSelection; ownerId: string | null;
};
export type ReservationDraft = { state: ReservationProcessState; stepId: ReservationStepId; savedAt: string /* UTC ISO */ };
```
Picker-side types, from `features/client/reservations/types/reservationProcess.types.ts`:
```ts
export type ReservationPickerTimeSlot = { slotTimeId: number; from: string; to: string; price: number; taxPrice: number; serviceId: number | null; serviceProviderBranchServiceId: number; serviceGroupId: number | null; serviceName: string | null; serviceGroupName: string | null };
export type ReservationMedicalSelection = { id: number; name: string; isClosedToday: string; closingDays: string; scheduleOffs: string; price: number };
export type GroupedService = { serviceProviderBranchServiceId: number; serviceName: string; price: number; taxPrice: number; slots: TimeSlot[] };
```

### 2.2 Context (`features/client/reservations/context/reservationProcessContext.tsx`)

Initial state: `{ service: null, facility: null, appointment: { selectedSlots: [] }, course: { selectedCertified: false, selectedSadad: false }, ownerId: null }`.

**Seeding on entry.** If there is no resumable draft:
- **Group basket:** `service = { serviceIds: [groupId], serviceNames: [groupName], serviceGroupId: groupId }`. The name comes from `Service/ServiceGroup/GetById`.
- **Services basket:** `service = { serviceIds, serviceNames }`, with names from `Service/Service/List?Ids=…`.
- A seed only fills `service` while it is still null. The flow is a snapshot taken on entry.

**Mutators:**

| Mutator | Effect |
|---|---|
| `setServiceSelection(s)` | Sets `service` and **resets** facility, appointment and course |
| `setFacilitySelection(f)` | Sets `facility` and **resets** appointment and course |
| `setAppointmentSelection(partial)` | Merges into `appointment`. `selectedSlots` is kept unless it is provided |
| `setCourseSelection(partial)` | Merges into `course` |
| `setOwnerSelection(id)` | Sets `ownerId` |
| `markReservationStep(stepId)` | Updates the draft step. Called on every step focus |
| `sealReservationDraft()` | Stops persisting ("Save for later") |
| `resetReservationProcess()` | Clears the draft and the state. Used by Discard and by payment settled or unverified |

Every state change is written through to `basketStore.reservationDraft`, and `savedAt` is refreshed on each write.

### 2.3 Draft resume rules (`shared/helpers/reservationDraft.ts`)
- TTL is 24 h from the last write. Expired drafts are dropped at hydration.
- The draft must match the basket:
  - A group draft matches when `serviceGroupId === basket.serviceGroups[0]`.
  - A services draft matches when there are no groups and it has the same set of ids.
- If `appointment.dateChosen` is before today: the appointment is dropped (`{ selectedSlots: [] }`), and a `stepId` past `appointmentSelect` is clamped back to `appointmentSelect`.

---

## 3. API endpoints

All paths are relative to `${EXPO_PUBLIC_API_URL}api/`, and every call also carries `culture=`.

### 3.1 Catalogue

**`GET Service/Service/List`** (`homeRoute.getServiceList`)
- Query: `OrderDirection=true` (always), `IsFeatured=true` (optional), `Search`, `Target` (always 1 = B2C), `PageNumber`, `PageSize`, `Ids` repeated per id.
- Response: `GenericListResponse<ServiceListItem[]>`.
```ts
export type GetServiceListPayload = { search?: string; isFeatured?: boolean; target?: number; pageNumber?: number; pageSize?: number; ids?: number[] };
export type ServiceTranslation = { id: number; langId: number; serviceId: number; name: string; description: string };
export type ServiceListItem = { id: number; icon: string; translations: ServiceTranslation[] };
```
- Translation choice uses `langId`: 1 = English, 2 = Arabic (`pickTranslation`).
- `description` can contain HTML; the app strips tags.

**`GET Service/ServiceGroup/List`** (`getServiceGroupList`)
- Same query parameters as the service list.
- Response: `GenericListResponse<ServiceGroupListItem[]>`.
```ts
export type ServiceGroupTranslation = { id: number; langId: number; serviceGroupId: number; name: string; description: string };
export type ServiceGroupListItem = { id: number; icon: string; translations: ServiceGroupTranslation[] };
```

**`GET Service/ServiceGroup/GetById?Id={id}&LangId={1|2}`** (`getServiceGroupById`)
- Response: `GenericResponse<ServiceGroupDetails>`. The real payload is larger; only these fields are typed:
```ts
export type ServiceGroupServiceItem = { id: number; serviceGroupId: number; serviceId: number; serviceName: string };
export type ServiceGroupDetails = { id: number; icon: string; translations: ServiceGroupTranslation[]; serviceGroupServices: ServiceGroupServiceItem[] };
```

**`GET client/client/GetHomePageInfo?userId={id}`** (`getHomeInfo`)
- Response: `GenericResponse<HomeInfoResponse>`.
```ts
export type HomeInfoResponse = {
  totalReservationCount: number;
  reservations: [{ id: string; serviceProviderBranchName: string; serviceProviderBranchLogo: string; serviceName: string; reservationDay: string; reservationDate: string; timeFrom: string; timeTo: string; latitude: number; longitude: number; status: number }];
  serviceGroups: [{ id: number; name: string; description: string; icon: string }];
  advertisements: [{ id: number; advertisementCategoryName: string; date: string; image: string | null; images: string | null; rank: number; isActive: boolean; videoURL: string }];
};
```

### 3.2 Medical facilities (branches)

**`GET client/client/GetBranches`** (`homeRoute.GetBranches`)
- Query: `serviceGroupIds={groupId}`, **or** `serviceIds=` repeated per id.
- Optional `latitude` and `longitude`, which must be sent together.
```ts
export type GetBranchesPayload = { serviceIds?: number[]; serviceGroupIds?: number; latitude?: number; longitude?: number };
export type GetBranchesResponse = { branches: Branch[] };
export type Branch = { id: number; name: string; address: string; logoPath: string; latitude: number; longitude: number; scheduleOffs: ScheduleOff[]; totalPrice: number; closingDays: number[] };
export type ScheduleOff = { date: string };
```
- Response: `GenericResponse<GetBranchesResponse>`.
- `totalPrice` is the basket total at that branch. `closingDays` holds `CustomDays` bit flags.

**`GET Provider/ServiceProviderBranch/List?OrderDirection=true&PageNumber&PageSize&Ids=`** (`getServiceProviderBranches`)
- Used only by the Favorites "providers" tab, which is hidden.
- Response: `GenericListResponse<{ id: number; translations: [{ name: string }] }[]>`.

### 3.3 Working days and time slots

**`GET Provider/ServiceProviderBranchSlot/GetWeeklyAvailableTimeSlotsForBranch`**
- Query: `serviceProviderBranch={branchId}`, then either `&serviceId=a&serviceId=b` (individual services) or `&serviceGroupId={groupId}` (group).
```ts
export type GetWeeklyTimeSlotsForBranchPayload = { serviceProviderBranch: number; serviceId?: number[]; serviceGroupId?: number };
export type GetWeeklyAvailableTimeSlotsForBranchResponse = { slotTimesGroupedByDay: SlotTimesGroupedByDay[] };
export type SlotTimesGroupedByDay = { day: string /* English weekday e.g. "Sunday" */; totalPrice: number | null; slotTimes: TimeSlot[] };
export type TimeSlot = {
  slotTimeId: number; serviceProviderBranchServiceId: number;
  serviceId: number | null; serviceName: string | null;
  serviceGroupId: number | null; serviceGroupName: string | null;
  price: number; taxPrice: number; from: string; to: string; // "HH:mm[:ss]"
};
```
- Response: `GenericResponse<…>`. Branch working days come from `Branch.closingDays` and `scheduleOffs`.

### 3.4 Course options attached to a service group

**`GET client/client/GetServiceGroupCourses?serviceGroupId={id}[&orderDirection=bool]`**
- Response: `GenericListResponse<ServiceGroupCourseListItem[]>`.
```ts
export interface ServiceGroupCourseTranslation { id: number; langId: number; courseId: number; name: string; description: string | null; tags: string | null; whatYouWillLearn: string | null; attachment: string | null; reviewText: string | null; isReviewActive: boolean }
export interface ServiceGroupCoursePaymentSettings { id: number; sellingPlan: number; price: number; certifiedExamPrice: number; sadadPrice: number }
export interface ServiceGroupCourseListItem { id: number; rank: number; status: boolean; isFeatured: boolean; categoryId: number; categoryName: string; target: number; fullImagePath: string; paymentSettings: ServiceGroupCoursePaymentSettings; translations: ServiceGroupCourseTranslation[] }
```

### 3.5 Price calculation and confirmation
**There is no separate price-calculation or quote endpoint.**
- Step 2 displays the price from `Branch.totalPrice`.
- Step 3 builds the total from each slot's `price` and `taxPrice`.
- Step 5 computes the display total on the client.
- The authoritative figure is `amount`, returned by `PaymentCreditCardPayment` (section 3.8). `CreateClientOrder` also returns a `total`.

### 3.6 Create order (reservation and optional course)

**`POST Client/ClientOrder/CreateClientOrder`**, sent as a JSON body (`paymentRoute.createClientOrder`).
```ts
export type CreateClientOrderPayload = {
  /** Omitted for a standalone academy course purchase. */
  reservation?: {
    serviceProviderBranchId: number;
    dateChosen: string;          // "YYYY-MM-DD" (from the date picker)
    ownerId: string;             // family member userId GUID, or the user's own id
    reservationServices: { serviceProviderBranchServiceId: number; slotTimeId: number }[];
  };
  courses?: { courseId: number; selectedService: number /* CourseSelectedService */ }[];
};
export type CreateClientOrder = { clientOrderId: string; total: number };   // GenericResponse<CreateClientOrder>
```
- The booking flow always sends `reservation`, with one entry per selected slot.
- It adds `courses: [{ courseId, selectedService }]` only when a course was picked and `courseSelectedService !== undefined`.
- The backend error `Reservations.OwnerNotAllowed` means the owner is missing or not linked to this user.
- The academy's standalone purchase sends only `courses` (`features/common/academy/screens/PaymentConfirmationScreen.tsx`).
- The old `CreateReservation` endpoint (multipart, 120 s timeout) survives only in comments and docs. It is no longer called.

**`GET Client/ClientOrder/GetClientOrder?clientOrderId={id}`** (`getClientOrder`)
- Has a hook (`useGetClientOrder`) but **no screen uses it**.
- Response: `GenericResponse<ClientOrder>`, where `ClientOrder = { id: string; items: ClientOrderItem[] }`.
```ts
export type ClientOrderItem = { id: number; itemType: ClientOrderItemType; reservationId: string | null; userCourseId: number | null; selectedService: number; description: string; unitAmount: number; taxAmount: number; lineTotal: number; courseName: string | null };
```

### 3.7 Coupons and discounts
**None.** Nothing in the codebase matches coupon, discount, promo or voucher. The only mention is a comment saying announcements are not discounts.

### 3.8 Payment (Moyasar credit card; no Apple Pay or STC Pay in this flow)

The payment has three stages.

**(1) Open a pending transaction: `POST Payment/Payment/PaymentCreditCardPayment`**
- Sent as `multipart/form-data`.
- Fields: `TargetId` (the `clientOrderId`), `Email`, `Address`, `City`, `State`, `Country`, `Postcode`, `Firstname`, `Lastname`.
- **An empty or missing billing field must be sent as the literal `"EmptyValue"`.** An empty string causes a 400 such as "City field is required".
- `TargetType` is **not** sent. It is kept on the client only.
```ts
export type PaymentCreditCardPaymentPayload = { TargetType: PaymentTarget; TargetId: string; Firstname?: string; Lastname?: string; Email?: string; Address?: string; City?: string; Country?: string; State?: string; Postcode?: string };
export type PaymentCreditCardPayment = {
  pendingTransactionId: string;
  amount: number;              // major units, tax included, SERVER computed — charge exactly this
  pubKey: { pubkey: string };  // Moyasar publishable key (lower-case inner key)
};
```
- The mobile app fills the billing fields from the user profile: `firstName`, `lastName`, `email`, `address`, `cityName`, `countryName`, `postCode`. `State` is never provided, so it is always sent as "EmptyValue".

**(2) Charge the card on the client with the Moyasar SDK** (`react-native-moyasar-sdk` → `CreditCard`)
- `PaymentConfig` values:
  - `publishableApiKey = pubKey.pubkey`
  - `amount = Math.round(amount*100)` (halalas)
  - `currency = "SAR"`
  - `merchantCountryCode = "SA"`
  - `description = serviceNames.filter(Boolean).join(", ") || facilityName || "Medical appointment reservation"`. It must not be empty.
  - `supportedNetworks = ["mada","visa","mastercard","amex"]`
  - `creditCard: { saveCard: false, manual: false }`
- 3-D Secure runs in a webview.
- The SDK's result gives `payment.id`. SDK errors are ignored, and the user stays on the form.
- **For the web version:** use the Moyasar web form with the same publishable key and amount. The mobile app has no `callback_url`, return URL or webhook; confirmation is done by the client. A website needs a return page that reads the Moyasar payment `id` and calls step 3.

**(3) Confirm the payment: `POST Payment/Payment/CheckPaymentStatus`**
```ts
export type CheckPaymentStatusPayload = { paymentId: string; pendingTransactionId: string; userId: string /* required by model binding (400 if missing) though ignored */ };
// Response: GenericResponse<boolean>  — true = settled; false (with isSuccess:true) = declined
```
- This call is **not idempotent**. The server deletes the pending row once the payment succeeds, so confirming again returns `PendingTransactionNotFoundCode`, which means "already settled".

### 3.9 Pending-payment resume (`features/common/payment/`)
- `usePendingPaymentStore` is persisted under the key `pending-payment-store`:
```ts
export type PendingPayment = { pendingTransactionId: string; paymentId: string | null; targetType: PaymentTarget; targetId: string; amount: number; createdAt: string };
```
- `startPendingPayment` runs right after stage (1).
- `attachPaymentId` runs before stage (3).
- A record is resumable only when `paymentId` is set and the record is at most 7 days old.
- `PendingPaymentResumer` is mounted in the signed-in part of the app. It calls `useResumePendingPayment` once per app launch, which re-sends `CheckPaymentStatus`:
  - settled: a success alert with "Payment completed" and a "pending payment completed" description;
  - declined or blocked: a toast;
  - unverified: silent, and the record is kept for the next launch.
- It never navigates.
- A record that never reached the gateway, or has expired, is cleared.

### 3.10 Family (related users). There is no OTP when linking.

| Method | Path | Body / query | Response |
|---|---|---|---|
| GET | `Client/ClientAuthenticate/GetRelatedUsersById?userId={id}` | – | `GenericResponse<RelatedUsers>` |
| POST (multipart) | `Client/ClientAuthenticate/CreateRelatedUser` | `Username` (the other user's username / identity number / phone), `RelatedTo` (current user id) | `GenericResponse<{ value: number }>` |
| PUT (multipart) | `Client/ClientAuthenticate/UpdateRelatedUserStatus` | `Id` (relationId), `Status` (1\|2\|4) | `GenericResponse<{ value: boolean }>` |
| DELETE | `Client/ClientAuthenticate/DeleteRelatedUser?id={relationId}` | – | `GenericResponse<{ value: boolean }>` |
| GET | `Authenticate/User/GetUserByUserName?username={u}` | lookup used on the add-existing screen | `GenericResponse<UserByUserNameResponse>` |
| POST (multipart) | `Authenticate/Auth/Register` | creates a new family member (fields below) | `GenericResponse<string>` |

Related-user types:
```ts
export type CreateRelatedUserPayload = { Username: string; RelatedTo: string };
export type updateRelatedUserStatusPayload = { relationId: number; status: 1 | 2 | 4 };
type User = { id: string; firstName: string; lastName: string; email: string; phoneNumber: null; img: string; isActive: boolean };
type RelatedAndBelongingUser = { id: number /* relationId */; userId: string; fullName: string; firstName: string; lastName: string; relatedTo: string; image: string; fullNameRelatedTo: string; status: RelatedUserStatusEnum };
export type RelatedUsers = { user: User; relatedToUsers: RelatedAndBelongingUser[]; belongToUsers: RelatedAndBelongingUser[] };
export type UserByUserNameResponse = { id: string; email: string | null; userName: string; nationalityId: number | null; phoneNo: string | null; firstName: string; lastName: string; address: string | null; countryId: number; countryName: string; cityId: number | null; cityName: string | null; otp: string; roleId: number | null; serviceProviderBranchId: number | null; serviceProviderBranchName: string | null; postCode: string | null; img: string; isActive: boolean; groupId: number; dateOfBirth: string; rolepermissions: null; companyUserResponses: []; relatedTo?: string | null };
```

**Add existing member** (`features/common/profile/screens/AddExistingRelatedUserScreen.tsx`):
1. The username field is required (zod `min(1)`). Lookups are debounced 500 ms.
2. `GetUserByUserName` runs with the input normalised: a number starting `05` becomes `00966` + the rest.
3. A matching user is shown as a preview card; otherwise the screen shows "User not found".
4. "Send relation request" is enabled only when the found user has an email or userName. It calls `CreateRelatedUser(Username=input, RelatedTo=me)`.
5. Afterwards the related-users query is refreshed, a toast is shown, and the app goes to `/relatedUsers`.

**Add new member** (`AddNewRelatedUserScreen.tsx` and `useCreateNewRelatedUser.ts`):
- Form fields (`shared/schemas/signup.schema.ts`):
  - `firstName`, `lastName` (required)
  - `phoneNumber` (email or Saudi mobile)
  - `identityNumber` (required)
  - `dateOfBirth` (required, must be a valid date)
  - `termsAccepted` (must be true)
- It then calls `Register` as multipart with `Id="EmptyValue"`, `FirstName`, `LastName`, `DateOfBirth`, `PhoneNumber`, `IdentityNumber` and `CountryID="14"` (hardcoded).
- Then it calls `CreateRelatedUser(Username=identityNumber, RelatedTo=me.id)`, shows a toast, and goes to `/relatedUsers`.
- No sign-out and no OTP happen for a related user. A normal self-registration does both.

**Manage members:**
- **Related-users screen:**
  - "Related" tab: `relatedToUsers`.
  - "Belongs to" tab: `belongToUsers`.
  - Each tab is split into Accepted (2) and Rejected (4) sections, with a delete (unrelate) option that asks first.
  - An add action sheet offers "Link existing member" or "Create related user".
- **My Requests screen:**
  - Sent: `relatedToUsers` with status Pending (1), deletable.
  - Received: `belongToUsers` with status Pending, with Accept (sets status 2) and Reject (sets status 4) buttons.

### 3.11 Reservations list and details
Covered in section 6.

### 3.12 Dashboard feature toggles

**`GET General/B2CManagement/List`** returns `GenericResponse<{ id: number; type: number; featureToggles: number }[]>`.

| Area (`type`) | Toggle bit |
|---|---|
| academy = 1 | `enable:academy` = 1 |
| payment = 2 | `enable:payment-gateway` = 1 |
| onboarding = 4 | `enable:onboarding` = 1 |
| account = 8 | `enable:delete-account` = 1; `enable:self-registration` = 2 |

- A toggle is on when `(featureToggles & bit) === bit`.
- A missing area reads as **enabled**.

---

## 4. Enums

| Enum (file) | Values |
|---|---|
| `ServiceTarget` (`shared/enums/serviceTarget.enum.ts`) | B2C=1, B2B=2, OSH=4. The app always sends 1 |
| `OrdersStatus` (reservation status, `shared/enums/orderStatus.enum.ts`) | New=1, Accept=2, Cancel=4, Reject=8, CheckIn=16, InProgress=32, Complete=64, NoShow=128, delayed=256. Bit flags, so `status` filters can be OR-ed |
| Status display text (`helpers/getReservationResultStatusText.ts`) | 1 New, 2 Accepted, 4 Cancelled, 8 Rejected, 16 CheckedIn, 32 InProgress, 64 Completed, 128 NoShow, 256 Delayed |
| Status colours | 1 primary, 32 warning, 64 success, anything else secondary |
| `PaymentTarget` (`shared/enums/paymentTarget.enum.ts`) | Reservation=1, UserCourse=2. Client-side only |
| `ClientOrderItemType` (`features/common/payment/enums/clientOrderItemType.enum.ts`) | Service=1, ServiceGroup=2, Course=3 |
| `CourseSellingPlan` (`shared/enums/academyPayment.enum.ts`) | CourseOnly=1, Seperated=2, Bulk=4 |
| `CourseSelectedService` (same file) | BulkOrCourseOnly=0, CourseOnly=1, CoursePlusSadad=3, CoursePlusCertified=5, CoursePlusSadadPlusCertified=7 |
| `RelatedUserStatusEnum` | Pending=1, Accepted=2, Rejected=4 |
| `CustomDays` (`shared/types/index.ts`; `closingDays` flags) | Saturday=1, Sunday=2, Monday=4, Tuesday=8, Wednesday=16, Thursday=32, Friday=64 |
| `CourseTarget` (academy) | B2B=1, B2C=2, Both=4 |
| `Currency` | SAR=1 (ISO "SAR", 2 decimals) |
| Backend `langId` | 1=English, 2=Arabic |

- **Gender:** no gender enum exists in this flow.
- **Payment status:** there is no payment-status enum. `Reservation.paymentStatus` is a plain `number` and is not read. The payment outcome is a client classification: `"settled" | "declined" | "unverified" | "blocked"`.

---

## 5. Business rules and validations

1. **Auth.** Browsing, the basket and favorites work without sign-in. Entering the flow requires a session. The prompt is "sign-in required", then login with a returnTo pointing at `familySelect`.
2. **Owner.** `ownerId = reservation.ownerId || appStore.selectedFamilyMember || user.id`. An empty owner stops the booking.
3. **Price and VAT:**
   - Each slot carries `price` (net) and `taxPrice` (VAT amount).
   - The total is `Σprice + ΣtaxPrice + courseTotal`, labelled "VAT included".
   - Amounts are shown with 2 decimals and the SAR symbol. The charge in halalas is `Math.round(x*100)`, which must be a positive integer.
   - **Only the server `amount` from `PaymentCreditCardPayment` is charged.** If Moyasar captures a different amount, the server voids the payment and returns `InvalidPaymentAmountCode`.
   - If the server amount is 0 or less, the app shows "We couldn't get the amount to charge" and stops.
4. **Slot rules:** one slot per branch-service. The step is ready only when every distinct `serviceProviderBranchServiceId` offered that weekday has a slot. The date must pass `isDateBookable` (horizon 180 days).
5. **Location:**
   - Device GPS is used only to show distance.
   - The map sends the viewport centre to `GetBranches`, rounded to 4 decimals and debounced 350 ms.
   - "Directions" opens Google Maps at the branch coordinates.
6. **Attachments:** the booking flow has no upload. Result attachments are shown on the details screen (section 6).
7. **Payment gate:**
   - `usePaymentGatewayGate` checks the payment area bit 1 before anything else happens. If it is off, a dialog explains that online payment was turned off by the administrator and nothing was charged.
   - This check guards starting a payment, never confirming one already charged.
8. **Order reuse:** within one visit to the confirm screen, `clientOrderId` is kept after a declined or failed attempt, so a retry pays the same order. Leaving the screen loses it.
9. **Payment outcomes** (`shared/helpers/classifyPaymentOutcome.ts`, codes in `shared/helpers/paymentErrorCodes.constants.ts`):
   - **settled** (`value` true, or code `PendingTransactionNotFoundCode` / `PaymentAlreadyCompletedCode`):
     - refresh home info, the reservation list and reservation details;
     - clear the pending record;
     - show the success alert "Reservation created successfully";
     - `resetReservationProcess()`, then `router.replace(home)`.
     - **The basket ids are NOT cleared on success.** Only the draft is cleared.
   - **declined** (`value` false): toast "The card was declined. Nothing was charged." The user stays on the screen and can retry; the draft is kept.
   - **blocked** (a known 600 code): a toast with the code's message, then the same as declined.
   - **unverified** (no response, 5xx, or an unknown 4xx/600):
     - warning alert "Payment Not Confirmed / Don't pay again…";
     - the pending record is kept;
     - the draft is reset and the app goes home;
     - the next launch retries automatically.
   - **600 codes** and their messages:

     | Code | Message |
     |---|---|
     | `InvalidPaymentTargetCode` | unsupportedTarget |
     | `InvalidPaymentTargetReferenceCode`, `InvalidReservationIdCode`, `InvalidUserCourseIdCode`, `InvalidPaymentTargetIdFormatCode`, `ReservationNotFoundCode` | targetMissing |
     | `PaymentAlreadyCompletedCode` | alreadySettled |
     | `InvalidPaymentAmountCode` | amountMismatch |
     | `PendingTransactionNotFoundCode` | alreadySettled |
     | `PendingTransactionNotOwnedByUserCode` | notOwned |
10. **Payment session:**
    - While the card form is open there is a 5-minute idle timeout, refreshed by touch. It also ends immediately when the app goes to the background.
    - On expiry the sheet closes, the attempt resets, and a toast says the payment session expired.
    - Screenshots are blocked while the form is open (mobile only).
11. **Required fields for create-order:** `serviceProviderBranchId`, `dateChosen`, `ownerId`, and at least one `{ serviceProviderBranchServiceId, slotTimeId }`.
12. **Favorites limit:** 20 per category. A heart press beyond that shows a warning toast.
13. **Reservation lists** show only `isPaid=true`. An unpaid reservation is just a client order that never finished checkout.

---

## 6. Reservations list and details

**`GET client/client/GetMyReservations`** (`homeRoute.GetReservationList`)
- Query:
  - Always sent: `orderBy=dateChosen`, `orderDirection=true|false` (default true), `isPaid=true`, `ownerId`.
  - Optional: `status` (OR-ed bitmask), `pageNumber`, `pageSize` (the app uses 100).
  - Also sent, but **not** documented by the backend: `ReservationDate`, `ServiceProviderBranchId`, `Search`.
- `ownerId` is `getReservationOwnerId()`: the selected family member, or the user. The list is therefore scoped to the currently selected family member.
- Response: `GenericListResponse<Reservation[]>`.
```ts
export type ReservationService = { id: number; serviceProviderBranchServiceId: number; serviceName: string; slotTimeId: number; timeFrom: string; timeTo: string; cost: number; sellPrice: number };
export type Reservation = {
  id: string; serviceProviderBranchId: number; serviceProviderBranchName: string; serviceProviderBranchLogo: string;
  latitude: number; longitude: number; dateChosen: string; ownerId: string; status: number;
  cost: number; sellPrice: number; costTax: number; sellPriceTax: number;
  note: string | null; cancelationReason: string | null; rejectionReason: string | null;
  isFit: boolean | null; isClaimedByProvider: boolean; adminNotes: string | null;
  paymentStatus: number; enrollmentType: number;
  reservationServices: ReservationService[];
  serviceProviderCityId: number | null; serviceProviderCityName: string | null;
};
```

**Who uses the list** (`shared/hooks/useReservation.ts`):
- Home "Upcoming": `status=2`, i.e. Accept only. It is a carousel sorted by date, with a live countdown and a location-view link.
- **Reservations tab** (`features/client/reservations/screens/ReservationsScreen.tsx`) has two tabs:
  - **Examinations** (`ExaminationsList.tsx`): an "Upcoming only" chip, on by default, switches between `status=2` and every status except Accept (`509`). A "{n} records" count comes from `totalRecords`. Cards show logo, branch, city, a status badge, `dateChosen` as DD/MM/YYYY, and the first service's from–to plus the UTC offset. **This tab has no View button** (`notCompleted`).
  - **Results** (`ResultsList.tsx`): `status=64` (Complete) with `orderDirection=false`. Cards have a **View** button linking to `/reservationDetails/{id}`.
  - URL params: `tab`, `upcoming`, and `filter=upcoming` (deep link).

**`GET Reservation/Reservation/GetById?Id={reservationId}`** (`getReservationDetails`)
- Response: `GenericResponse<ReservationDetails>`.
```ts
export type ReservationServiceItem = { reservationServiceId: number; id: number; serviceName: string; from: string; to: string; sellPrice: number; costPrice: number; conditions: unknown[]; requirements: unknown[] };
export type ReservationGroupServiceItem = { from: string; to: string; sellPrice: number; services: { serviceName: string }[] };
export type ReservationStatusLog = { id: number; status: number; createdById: string; createdByName: string; createdAt: string; reservationId: string };
export type ReservationQuestionAnswer = { question: string; answer: string };
export type ReservationDetails = {
  id: string; enrollmentType: number; serviceProviderBranchId: number; serviceProviderBranchName: string; serviceProviderBranchPhone: string;
  dateChosen: string; ownerId: string; createdByName: string; createdAt: string; status: number; ownerName: string;
  cost: number; sellPrice: number; costTax: number; sellPriceTax: number;
  reservationServices: { services: ReservationServiceItem[]; groupServices: ReservationGroupServiceItem[] };
  statusLogs: ReservationStatusLog[]; reservationQuestionAnswers: ReservationQuestionAnswer[];
  acceptedDate: string | null; fullPathAttachments: string | null; cancelationReason: string | null; rejectionReason: string | null;
  ownerPhone: string; ownerIdentity: string; companyName: string; packageCode: string; isClaimedByProvider: boolean;
  companyBranchId: number | null; isfit: boolean; attachment: string | null; companyBranchName: string;
  companyPackageRequestUserId: string | null; qualityCheck: number; govPlatReg: string | null; govPlatRegNote: string | null; govPlatLogs: unknown[];
};
```

**Details screen** (`features/client/reservations/screens/ReservationDetailsScreen.tsx`) shows, in order:
1. **Summary card** (`ReservationSummaryCard`): created by, branch name, tax (`sellPriceTax`), final total (`sellPrice`).
2. **Stat tiles:** owner name, date (DD/MM/YYYY), status badge.
3. **Status reason card:** the cancellation or rejection reason, if there is one.
4. **Attachments card:** `fullPathAttachments` split on ",". Each attachment has View (opens `${API_URL}${path}` externally) and Download (saves the file).
5. **Services card:**
   - Individual services: name, from–to, `sellPrice`.
   - Service groups: "Group", from–to, `sellPrice`, and the included service names.
   - When status is Complete (64), a pill shows "Fit for Service" or "Not Fit for Service" from `isfit`.
6. **Additional information:** the question/answer pairs.
7. **Status timeline:** `statusLogs`, each with a status label, a colour dot and `createdAt` converted from UTC to local time (DD/MM/YYYY + time).

The screen supports pull-to-refresh. After a settled payment, `homeRoute-getHomeInfo`, `homeRoute-GetReservationList` and `homeRoute-getReservationDetails` are refreshed.

---

## 7. Favorites (local only; there is no favorites API)

- `shared/store/favoritesStore.ts` is persisted under the key `favorites-store`:
  - State: `{ services: number[]; serviceGroups: number[]; courses: number[]; serviceProviders: number[] }`.
  - Limit: 20 per category. It is cleared on sign-out.
- A heart (`shared/ui/FavoriteButton.tsx`) sits on every service row and group card.
- The catalogue "Favorites only" chip sends those ids as `Ids=` to the list endpoints.
- `features/common/profile/screens/FavoritesScreen.tsx` has these tabs:
  - **Services:** `Service/Service/List?Ids=…`, searchable. Rows have **no basket button** (`basket="none"`).
  - **Service groups:** `Service/ServiceGroup/List?Ids=…`. Cards are read-only, with the details sheet only.
  - **Service providers:** hidden (`Provider/ServiceProviderBranch/List?Ids=`).
  - **Courses:** hidden, and also requires the academy toggle.

---

## 8. Key files

**Home:**
- `features/client/home/api/{req,res,route,route.types}.ts`
- `features/client/home/components/{BasketButton,BasketModal,ServiceCatalogList,ServiceGroupCatalogList,ServiceGroupContinueBar,HomeServiceRail,HomeServices,HomeServiceGroups,UpcomingAppointments}.tsx`
- `features/client/home/hooks/{useServiceGroupSelection.tsx,useGetServiceList.ts,useGetServiceGroupList.ts}`

**Reservations:**
- `features/client/reservations/context/reservationProcessContext.tsx`
- `features/client/reservations/screens/*.tsx`
- `features/client/reservations/components/{FamilySelect,FamilyMemberCard,BookingSummaryCard,MedicalFacilityCard,FacilityMapView,BranchWeekDays,TimeSlots,SlotServiceCard,AppointmentDatePicker,CourseOptionCard,CoursePlanOptionRow,AppointmentConfirmationCard,ConfirmPriceCard,PaymentSheet,ReservationStepHeader,ReservationStepBar,ExaminationsList,ResultsList,TestResultCard,Reservation*Card,StatusTimeline,AttachmentsCard,AdditionalInfoCard}.tsx`
- `features/client/reservations/adapters/reservationProcessAdapter.ts`
- `features/client/reservations/helpers/{appointmentAvailability,reservationFlowSteps}.ts`

**Shared:**
- `shared/store/{basketStore,favoritesStore,pendingPaymentStore,paymentSessionStore,appStore}.ts`
- `shared/helpers/{reservationDraft,reservationFlow,getReservationOwnerId,classifyPaymentOutcome,paymentErrorCodes.constants,currency,getCustomDayValue,paymentSessionManager,imageUrl}.ts`
- `shared/hooks/{useHomeBranches,useWeeklyTimeSlotsForBranch,useServiceGroupCourses,useGetServiceGroupServices,useServiceListSearch,useServiceGroupListSearch,useReservation,useGetRelatedUsers,useCreateClientOrder,useCreditCardPayment,useConfirmPayment,usePaymentGatewayGate,useServiceBasketGuard,useRequireAuth,useIsAcademyEnabled,usePaymentSessionGuard}.ts`
- `shared/components/{ServiceListRow,ServiceGroupCard,ServiceGroupDetailsSheet,AddToBasketButton}.tsx`
- `shared/types/{catalog,payment,reservationDraft}.types.ts`

**Payment:**
- `features/common/payment/api/*`
- `features/common/payment/hooks/{useResumePendingPayment,useGetClientOrder}.ts`
- `features/common/payment/components/PendingPaymentResumer.tsx`
- `features/common/payment/enums/clientOrderItemType.enum.ts`

**Auth and profile:**
- `features/common/auth/api/{req,res,route,route.types}.ts` (related-user endpoints)
- `features/common/profile/{screens/AddExistingRelatedUserScreen,screens/AddNewRelatedUserScreen,screens/ProfileRelatedUsersScreen,screens/MyRequestsScreen,screens/FavoritesScreen}.tsx`
- `features/common/profile/hooks/{useCreateRelatedUser,useCreateNewRelatedUser,useDeleteRelatedUser,useUpdateRelatedUserStatus}.ts`
- `shared/hooks/useRegister.ts`
- `shared/schemas/signup.schema.ts`

**API infrastructure:**
- `api/common/{clientConfig.ts,client.tsx,apiErrorHandler.ts}`
- `api/types.ts`
- `api/routes/generalRoute/*` (includes `General/B2CManagement/List`)
