# Academy feature: functional and technical spec (source: RefactoredMwafqMobile, Expo RN)

`R` below means `C:\Users\lenovo\Desktop\comnbine\RefactoredMwafqMobile\src`. All paths are absolute under it.

---

## 0. File map

- API: `R\features\common\academy\api\{req.ts,res.ts,route.ts,route.types.ts}`
- Shared types: `R\shared\types\academyCourse.types.ts` (CourseListItem, getCourseListPayload), `R\shared\types\payment.types.ts` (payment payloads)
- Enums: `R\features\common\academy\enums\questionType.enum.ts`, `R\shared\enums\academyPayment.enum.ts`, `R\shared\enums\paymentTarget.enum.ts`, `R\shared\enums\courseTarget.enum.ts`, `R\features\common\academy\types\courseModule.types.ts`, `R\features\common\payment\enums\clientOrderItemType.enum.ts`
- Helpers: `R\features\common\academy\helpers\*` (myCourseState, quizScore, matchingHandler, numberOfCourseSections, parseVimeoVideoUrl, formatPlaybackTime, quizQuestionMapper, quizSubQuestionMapper, courseActivityTypeInString), `R\shared\helpers\durationHandler.ts`, `R\shared\helpers\pickTranslation.ts`, `R\shared\helpers\classifyPaymentOutcome.ts`, `R\shared\helpers\paymentErrorCodes.constants.ts`
- Hooks: `R\features\common\academy\hooks\*`, `R\shared\hooks\useGetCourseList.ts`, `R\shared\hooks\{useConfirmPayment,useCreateClientOrder,useCreditCardPayment,usePaymentGatewayGate,usePaymentSessionGuard,useQueryUiState,useIsAcademyEnabled}.ts`
- Stores: `R\features\common\academy\store\{courseStore,quizStore,courseProgressStore,index}.ts`, `R\shared\store\{pendingPaymentStore,academyLanguageStore,paymentSessionStore}.ts`
- Screens: `R\features\common\academy\screens\*.tsx` (9 screens)
- Routes: `R\app\(app)\(shared)\academy\_layout.tsx` plus the leaf files; `R\app\(app)\client\(mainTabs)\academy\{_layout,index}.tsx`; `R\app\(app)\companyMember\(mainTabs)\academy\{_layout,index}.tsx`
- Language: `R\i18n\academyLanguage.ts`, `R\i18n\resources.ts`, `R\shared\helpers\academyDirection.ts`, `R\shared\ui\academyScope.tsx`, `R\shared\components\AppDrawer\DrawerAcademyLanguageControl.tsx`
- Axios config (culture param): `R\api\common\clientConfig.ts`. Query defaults: `R\api\common\apiProvider.tsx`, `R\shared\hooks\api\useAxiosTanstack.ts`, `R\api\common\cachePolicy.ts`

### Route table (`R\shared\helpers\navigationHelper.ts`)
```
academy.index:                 /(app)/client/(mainTabs)/academy        (AcademyHomeScreen; companyMember has its own tab copy)
academy.courseDetails:         /(app)/(shared)/academy/courseDetails   params {CourseId, UserCourseId}
academy.lockedCourse:          /(app)/(shared)/academy/lockedCourse    params {CourseId}
academy.activityFlow:          /(app)/(shared)/academy/activityFlow    (no params; reads zustand store)
academy.payment.paymentFlow:          .../(payment)/paymentFlow        params {CourseId}
academy.payment.paymentConfirmation:  .../(payment)/paymentConfirmation params {CourseId?, totalToPay, selectedService?, reservationId?}
academy.payment.paymentStatus:        .../(payment)/paymentStatus      params {paymentId, pendingTransactionId}
academy.quizHistory.list:      .../(quizHistory)/quizHistoryList       params {quizId, userCourseId}
academy.quizHistory.details:   .../(quizHistory)/quizHistoryDetails    params {quizHistoryId, attempt}
```
Home query params: `zone` ("studying" | "browse" | ""), `filter` ("all" | "featured" | categoryId string), `search`. Deep link `/{locale}/app/courses/:id` goes to courseDetails with `{CourseId}` only (`R\shared\helpers\deepLink.ts` ~L265).

### Route guards (`R\app\(app)\(shared)\academy\_layout.tsx`)
- Every academy screen sits behind `Stack.Protected guard={isAcademyEnabled}`, the dashboard toggle `enable:academy`. It reads `DashboardPermissionAreaEnum.academy = 1`, `DashboardPermissionAcademyTogglesEnum["enable:academy"] = 1`, and fails open.
- `courseDetails`, `lockedCourse` and `paymentFlow` also need `Capability.ViewAcademyBrowse (3)`.
- `paymentConfirmation` also needs `Capability.ViewAwaitingCoursePayment (4)`.
- `activityFlow`, `paymentStatus` and quiz history need no capability.
- Auth-required routes (`R\shared\helpers\protectedRoutes.ts`) are only `activityFlow` and `(quizHistory)`. Browse, lockedCourse, paymentFlow and paymentConfirmation are public to guests. The sign-in wall is the Pay button.
- Permission matrix (`R\shared\permissions\matrix.ts`):
  - Client: `ViewAcademyBrowse`, `ViewAwaitingCoursePayment`, `ViewRelatedUsers`
  - CompanyMember: none
  - ServiceProvider: none

---

## 1. Screens

### 1.1 AcademyHome (`R\features\common\academy\screens\AcademyHomeScreen.tsx`)

**Header:** `AcademyHeader` (title "Academy", subtitle "Training and certification", GraduationCap icon, drawer trigger).

**Zones and default selection.** There are two swipeable tabs, Studying (shows the count `learning.totalCount`) and Browse. Zone selection:
```
zone = !canBrowse ? "studying"
     : isGuest   ? (pickedZone ?? "browse")
     : (pickedZone ?? (learning.uiState === "empty" ? "browse" : "studying"))
```
- A role without `ViewAcademyBrowse` (CompanyMember) gets no tabs, only StudyingZone. Browse components are not mounted at all.
- A guest who opens Studying sees a StateView panel ("Your courses live here" / "Sign in to see the courses you own…" / "Sign in" button). The sign-in returns to `{pathname: academy.index, params:{zone:"studying"}}`.
- `useMyLearning` is disabled for guests, so no 401.
- Pull-to-refresh refetches all `coursesRoute` queries.

**StudyingZone** (`components\home\StudyingZone.tsx`). Data comes from `useMyLearning` (`hooks\useMyLearning.ts`), which calls `getMyCourses` (pageSize 20, infinite). The courses are partitioned:
- `awaitingPayment` = `payment?.status === 1` (`PAYMENT_STATUS_PENDING`)
- `paid` = everything else
- `completed` = paid with `isCourseCompleted`
- `studying` = paid and not completed
- `resume` = `pickResumeCourse(studying)`: highest `progressPercent`, then highest `rank`, then lowest `id`
- `inProgress` = studying minus resume

Row order:
1. `ResumeCourseCard`, if there is one
2. Heading "Awaiting payment" plus a `PendingPaymentRow` per course (only with the `ViewAwaitingCoursePayment` capability)
3. Heading "In progress" plus `EnrolledCourseRow` (inProgress variant)
4. Heading "Completed" plus `EnrolledCourseRow` (completed variant, "Course Completed" badge instead of the progress bar)

Infinite scroll uses `onEndReachedThreshold` 0.4.

States:
- loading
- offline-empty ("You are offline / Your courses will load…")
- error-empty (retry)
- empty ("Your courses will appear here…", with a "Browse courses" action that switches zone, only when browse is allowed)
- stale strip ("Offline · showing saved courses")

**ResumeCourseCard** (`components\home\ResumeCourseCard.tsx`):
- Course name (2xl)
- `lastLecture.name` with a play icon
- Progress bar with "{{percent}}% complete"
- "{{count}} lectures" (`totalLectures`)
- Duration from `durationHandler({totalHours})`
- Full-width "Continue Learning" button
- Tapping it goes to `getMyCourseHref(course)`

**EnrolledCourseRow:** name, progress bar (or completed badge), chevron. Links to `getMyCourseHref`.

**PendingPaymentRow:** name, "Still to pay", `getAmountOwed(payment)` with a riyal icon, and a "Continue Payment" button. It links to `getMyCourseHref`, which for pending courses goes to paymentConfirmation.

**`getMyCourseHref`** (`helpers\myCourseState.ts`):
- pending: `paymentConfirmation {CourseId: courseId, totalToPay: getAmountOwed(payment), reservationId: course.id}`
- otherwise: `courseDetails {CourseId: courseId, UserCourseId: course.id}`

**Browse zone.** Vertical stack with gap-3:
- `CourseSearchField` (`components\common\CourseSearchField.tsx`)
  - Placeholder "Search courses" in the academy language
  - Clear (X) button
  - Debounced 350ms before it reaches the feed
  - Blurs on keyboard hide
- `CourseFilterRail` (`components\common\CourseFilterRail.tsx`)
  - Chips: "All Courses" (filter "all"), "Featured" (filter "featured"), then one chip per category from `getCourseCategories({pageSize:30})`
  - A category chip is shown only if `category.hasCourse && label`, where `label = category.translations?.[0]?.name ?? category.parentName`
  - Active chip is filled primary
- `CourseFeed` (`components\common\CourseFeed.tsx`)
  - `useGetCourseList(payload, 10)`, infinite, `keepPreviousData`
  - payload:
    - `{featured:true}` if filter is "featured"
    - `{CategoryId:n}` if filter is a number
    - `{search:q}` if the trimmed search is non-empty
    - always `Target: CourseTarget.B2C + CourseTarget.Both` (= 6), `pageSize`, `academyLanguage`
  - Empty states:
    - searching: "No courses found / Nothing matched "{{query}}"…" with a "Clear search" action
    - filter "all": "No courses yet / New courses are added regularly…"
    - other filters: "Nothing in this category" with a "Show all courses" action that resets the filter to "all"
  - Also offline, error (retry) and stale states
  - Infinite scroll threshold 0.5

**CourseCard** (`R\shared\components\CourseCard.tsx`). Always links to **lockedCourse** `{CourseId: course.id}`, even when the user owns the course.
- Thumbnail `fullImagePath`, falling back to the logo
- `categoryName`
- Sparkles icon if `isFeatured ?? featured`
- Name = `translations?.[0]?.name ?? course.name`
- "{{count}} lectures"
- Duration
- Price:
  - Bulk: `price + sadadPrice + certifiedExamPrice`, else `price`
  - Suffix "Full Price" (Bulk) or "Starts from" (Seperated); none for CourseOnly
  - If price is 0 or less, shows "Free" in green

"Featured" is purely the `featured=true` filter on `Course/List`. There is no separate carousel or tier.

### 1.2 CourseDetails, owned course (`screens\CourseDetailsScreen.tsx`)

- Params: `CourseId`, `UserCourseId`
- Calls `getCourseByUserId({CourseId, UserCourseId, academyLanguage})`
- On data, calls `courseStore.initializeFromCourse(course, userCourseId)`, which also initialises progress/locks
- States: loading, offline-empty ("This course will load as soon as you are back online."), error-empty (retry), not found ("Course not available / We could not open this course…")
- Body is a pull-to-refresh scroll view containing:

1. **CourseHero** (`components\courseDetails\CourseHero.tsx`)
   - Gradient background, no image (the detail endpoints return no cover)
   - `name` (3xl)
   - `description` rendered as **HTML**
   - `tags` split on "," as chips
   - "{{count}} lectures" (`totalLectures`)
   - Duration (`totalHours`)
2. **CourseSummaryCard** variant "owned" (`CourseSummaryCard.tsx`)
   - Progress bar (`courseProgressPercentage`)
   - "{{sectionsCount}} sections . {{itemsCount}} items"
   - "Continue Learning" links to activityFlow. It does not set an activity, so the store's `lastActiveActivity` is used.
   - Counts:
     - `numberOfCourseSections = lessons.length + quizzes.length + (attachments>0 ? 1 : 0)`
     - `numberOfCourseItems = Σ lesson.lectures + Σ lesson.quizzes + course.quizzes + attachments.length`
     - `attachments = fullAttachmentsPath.split(",").filter(Boolean)`
3. **WhatYouWillLearn**: `whatWeWillLearn.split(",")`, trimmed, one check-mark line each. Hidden if empty.
4. **CourseCurriculum** (`CourseCurriculum.tsx`)
   - Heading "Course Curriculum"
   - If there is no `userCourseId`, a lock banner: "Join this course to unlock the lessons below."
   - Then `LessonSection` per lesson, `ExamRow` per `course.quizzes` entry, and `AttachmentSection`
   - The accordion allows one section open at a time (`courseProgressStore.expandedSection`; the attachments section id is -1)
   - **LessonSection:**
     - Header shows the number badge (index+1), `lesson.name`, and "{{count}} of {{total}} completed"
     - `total = lectures + quizzes`; `done = floor(total * userProgress / 100)`
     - Progress bar uses `lesson.userProgress`
     - When expanded:
       - An `ActivityRow` per lecture: title, "Lecture · {duration}" (from `videoLengthInMinutes`)
       - An `ActivityRow` per quiz: "Quiz · {timerMintues}", plus a "History" chip (links to quizHistory list) if `quiz.isComplete`
     - `isLocked = isActivityLocked(id, type) || !userCourseId`
   - **ActivityRow** tap behaviour:
     - locked: toast "This module is locked"
     - attachment: opens `EXPO_PUBLIC_API_URL + filePath` in the browser
     - otherwise: `setLastActiveActivity(id, "lecture" | "quiz")` then navigates to activityFlow
     - Status icon: lock, green check (completed), or chevron
   - **ExamRow:**
     - Trophy badge, `exam.title`
     - "Final Exam" label if `isExam`
     - Duration from `timerMintues`
     - "History" chip if `isComplete`
     - Locked when `isActivityLocked(id, isExam ? "exam" : "quiz") || !userCourseId`; the locked toast reads "This exam is locked"
   - **AttachmentSection:** "Course attachments", "number of attachments: N"; rows show the basename; tap opens `API_URL + path`

### 1.3 LockedCourse, not owned (`screens\LockedCourseScreen.tsx`)

- Params: `CourseId`
- Calls `getCourseView({courseId, academyLanguage})`
- Same layout and states as CourseDetails, except:
  - The summary card variant is "locked". It shows the price (same Bulk/Seperated/CourseOnly rules, "Starts from" / "Full Price", or "Free") and a "Buy Now" button that links to `paymentFlow {CourseId}`.
  - The curriculum gets `userCourseId={undefined}`, so every row is locked and the enrol banner shows.
- The course store is not initialised on this screen.

### 1.4 ActivityFlow (`screens\ActivityFlowScreen.tsx`)

**Entry and data.** Everything comes from `courseStore`: `activities`, `lastActiveActivity`, `userCourseId`, `rawCourseData`. The starting index is the index of `lastActiveActivity`, or 0. The idle timeout is suspended while the screen is open.

**Header:**
- title: lecture `name` or quiz `title`
- subtitle: "Topic {{current}} of {{total}}"
- the title may wrap to 2 lines
- back chevron: one topic back
- X: `closeFlow`, which goes back to courseDetails, or replaces to it when there is no history

**Not ready** (no activities, current activity or userCourseId): "Nothing to open yet / Open a course from your list first…" with a "Go to my courses" action to `academy.index`.

**Lecture:**
- `LecturePlayer` is pinned under the header, outside the scroll area.
- `LectureAttempt` body:
  - Caption row: duration (`videoLengthInMinutes`) and a "Completed" badge if `isCompleted`
  - "In this lecture" plus `description` as HTML (`textContent` is not rendered)
  - `LectureAttachments` from `fullAttachmentsPath`, a comma list:
    - Heading "Download Resources" and the count
    - Each row shows the decoded basename minus extension, the uppercase extension, and a download icon
    - Opens `EXPO_PUBLIC_API_URL + path`
  - `ActivityNavBar`:
    - Label: "Continue to Next Topic", or "Finish the Course" (green) when it is the last activity
    - When `!canProceed`: a lock box with the same label and "Finish the video to continue."
- `canProceed = lecture.isCompleted || !parseVimeoVideoUrl(lecture.videoUrl) || isPlaybackUnobservable` (the Vimeo bridge reported `unavailable`).

**LecturePlayer / VideoControls / VimeoPlayer** (`components\activityFlow\LecturePlayer.tsx`, `VideoControls.tsx`, `components\common\VimeoPlayer.tsx`):
- The Vimeo embed is built as HTML with an iframe `https://player.vimeo.com/video/{id}?h={hash}&autoplay=0&playsinline=1&dnt=1` plus, for custom chrome, `controls=0&title=0&byline=0&portrait=0&keyboard=0`. It uses the `player.js` API.
- The embed origin/baseUrl comes from `EXPO_PUBLIC_VIMEO_EMBED_ORIGIN`, because the videos are domain-restricted. On the web, the site domain must be on Vimeo's allowlist.
- Events: `ended`, `play`, `pause`, `timeupdate {seconds,duration}`, `loaded {duration}`, `bufferstart`, `bufferend`, `unavailable` (player.js missing or `player.ready()` rejected), `rateUnsupported` (`setPlaybackRate` rejected, e.g. not a Vimeo Plus account).
- Commands: play, pause, seek (`setCurrentTime`), muted, rate.
- Custom controls:
  - tap layer toggles the controls
  - play/pause, or replay when ended (seek to 0 then play)
  - skip ±10s (`SKIP_SECONDS`)
  - scrub slider
  - mute
  - speed cycles `[0.75, 1, 1.25, 1.5, 2]`; the control is hidden if rate is unsupported
  - fullscreen toggle
  - time readout `formatPlaybackTime` (m:ss or h:mm:ss)
  - buffering spinner
- Controls auto-hide after 3000ms while playing, not while scrubbing, paused or ended.
- If the bridge dies, the embed is rebuilt with Vimeo's own controls (`chrome="vimeo"`) and the custom overlay is removed.
- Fullscreen shows a top row with an exit chevron and the title. A hardware back press exits fullscreen first.
- `parseVimeoVideoUrl` accepts `vimeo.com/ID`, `vimeo.com/ID/HASH`, `?h=HASH`, `player.vimeo.com/video/ID?h=`, channel paths, or a bare ID. The last numeric path segment is the id. A query `h` wins over a path hash. The hash must be alphanumeric.

**Lecture progress reporting.** This happens **only once, on the Vimeo `ended` event**. There is no periodic reporting.
```
onLectureVideoEnded: if (!current || current.isCompleted || !userCourseId) return;
  POST Lecture/SetProgress {UserCourseId, LectureId} -> onSuccess invalidate ["coursesRoute-getCourseByUserId"]
  markActivityAsComplete(id, type)   // local, optimistic
```
Pressing "Continue" calls `onActivityComplete`: it marks the activity complete locally, then moves to the next index if that activity is not locked, otherwise exits to courseDetails. **Gap:** when a lecture has no valid video or the bridge is dead, "Continue" marks it complete only locally. SetProgress is never called.

**Quiz or exam** (`QuizActivityLoader` inside ActivityFlowScreen, plus `components\activityFlow\QuizAttempt.tsx`):
- Calls `getQuizById({Id, UserCourseId, academyLanguage})`. It is enabled only if both ids are present, and the response is unwrapped with `raw.value ?? raw`.
- Loading shows a spinner.
- Failure: offline shows "This quiz will load as soon as you are back online."; otherwise "We could not open this quiz" with retry.
- No questions: "This quiz cannot be started / Its questions could not be loaded…"
- Layout:
  - `QuizProgress`: "Question {{current}} of {{total}}", progress bar, and `QuizTimer`. The timer shows mm:ss, turns red under 60s, and is hidden when untimed.
  - The active question component (see §4)
  - `QuizQuestionGrid`: shown only when there are 2 or more questions
    - "Quick Navigation" with numbered 44dp squares; tap jumps to a question
    - Square states: current (primary), answered (green), pending (grey), with a legend
    - A video container counts as answered only when all of its sub-questions are answered
  - `QuizNavBar`: "Previous" (disabled on the first question), "Next", and "Submit" on the last question ("Loading" while submitting or resolving)
- Submit validation: `countUnanswered` skips video or container nodes and counts leaf questions with no answers. If any are missing, a warning toast shows "Answer every question first / {{count}} still need an answer." If metadata is missing: "We could not submit your answers."
- The timer ticks through `setInterval(tick, 1000)`. At 0: stop, `isAttemptInProgress = false`, alert "Time is up / …your answers were not submitted…", confirm "Back to the course", then `closeFlow`. **It does not auto-submit.**

**Exit guard** (`hooks\useQuizExitGuard.ts`):
- Back (hardware, chevron or swipe):
  - in fullscreen: exits fullscreen
  - when there is a previous activity: goes to the previous activity (same screen)
  - otherwise: leaves the flow
- If a quiz attempt is in progress (`quizStore.isAttemptInProgress`), both stepping back and leaving first ask a destructive confirm: "Leave without submitting? / Your answers are not saved yet…" with "Leave" and "Stay". Any dismiss counts as Stay.
- Deliberate exits go through `exitFlow(href?)`, which skips the step-back logic.
- On a web implementation this maps to `beforeunload` and a router guard.

**Orientation:** landscape is allowed only while a lecture is open.

### 1.5 QuizHistoryList (`screens\QuizHistoryListScreen.tsx`)

- Params: `quizId`, `userCourseId`
- `userId` comes from the user store
- Calls `getQuizHistory({userId, quizId, UserCourseId, PageSize:10, academyLanguage, pageNumber})`, infinite
- Next page exists when `lastPage.value.data.length === PAGE_SIZE`; next page number is `pages.length+1`
- A timezone note is the list header
- `AttemptCard` (`components\quizHistoryDetails\AttemptCard.tsx`):
  - "Attempt #{{index+1}}" (index in the list, and the list is newest first)
  - `formatDateTime(startTime)`
  - Percentage badge
  - "{attemptScore} / {quizScore}"
  - Duration = `computeTimeBetween(startTime, endTime)` minutes
  - "View Details"
  - Green if passing (80% or more), red otherwise. It never prints "Passed" or "Failed".
  - Links to details `{quizHistoryId: id, attempt: number}`
- States: loading, offline ("Your attempts will load…"), error (retry), empty ("No attempts yet / Once you sit this quiz…"), stale strip

### 1.6 QuizHistoryDetails (`screens\QuizHistoryDetailsScreen.tsx`)

- Calls `getQuizAttemptById({Id: quizHistoryId, academyLanguage})` and uses `data.value`
- States: loading, offline, error, "Attempt not available"
- **QuizHistoryHeader:**
  - Trophy, "Quiz Completed!"
  - `{attemptScore}/{quizScore}` (5xl), "Your Score:"
  - Two tiles: CORRECT = `attemptScore`; INCORRECT = `max(0, quizScore - attemptScore)`. These are points, not question counts.
- **DetailedResults** (`DetailedResults.tsx`):
  - Builds `answersMap` from questionId to answers
  - Renders top-level questions only (`!parentQuestionId`), from `attempt.qustions` (the API really spells it that way)
  - A video question gets `relatedQuizQuestions`, or if that is empty, the questions whose `parentQuestionId === video.id`. It receives **all** answers.
  - Other questions receive `answersMap.get(id)`.
  - Renderer is chosen by `quizQuestionHistoryMapper`.
- Per-type result rendering:
  - **SingleChoice** (also TrueOrFalse, labelled "TRUE OR FALSE")
    - The user's answer is `quizQuestionAnswers.find(id === answers[0].answerId)`
    - Correct when `userAnswer.isCorrect`
    - Shows "Your Answer: X" in green or red, or "No answer provided"
    - Shows the description
  - **MultipleChoice**
    - `userAnswers` = options whose id is among the answers
    - All correct when every chosen option `isCorrect` AND the number chosen equals the number of correct options
    - Lists each chosen option with a check or cross
  - **Matching** (`MatchingQuestionHistory.tsx`)
    - Left column = answers with `relatedToAnswerId === null`
    - For each left option, `correctB` = the answer whose `relatedToAnswerId === left.id`
    - The user's answer is the one whose `answerId === left.id`, falling back to `answerId === correctB.id`
    - The pair is correct when `userAnswer.isCorrect`
    - All correct when every pair is correct
    - Shows "Group match #n" with A: left text and B: the **correct** B text
    - Colours: `A_COLOR "#2b7fff"`, `B_COLOR "#ad46ff"`
  - **Video** (`VideoQuestionHistory.tsx`)
    - Player from `translations.find(t => t.videoUrl).videoUrl`
    - "Answer the following questions:" then each sub-question via `quizSubQuestionHistoryMapper`, with its own answers
    - All correct when every sub-question has at least one answer and all of them are `isCorrect`

### 1.7 PaymentFlow (`screens\PaymentFlowScreen.tsx`)

- Params: `CourseId`
- Calls `getCourseView({courseId})`
- `sellingPlan = paymentSettings.sellingPlan ?? CourseOnly`
- Local state: `wantsCertified`, `wantsSadad`
- **Seperated (2):**
  - Title "Choose Your Plan", subtitle "Select what you'd like to purchase"
  - Three `PlanOptionRow`s:
    - "Course Training" `price`: required, always selected, lock icon, "Included". Tapping it shows the toast "Required / Course training is required and cannot be removed."
    - "Certificate Exam" `certifiedExamPrice`: optional checkbox
    - "SADAD Exam" `sadadPrice`: optional checkbox
- **Bulk (4):**
  - Title "Full Package", subtitle "Includes all options below"
  - Three read-only `PriceLine`s
- **CourseOnly (1):** title "Course Training" and one price line
- Total and selected service:
```
total = Seperated ? price + (cert?certifiedExamPrice:0) + (sadad?sadadPrice:0)
      : Bulk ? price + certifiedExamPrice + sadadPrice
      : price
selectedService = !Seperated ? 0 (BulkOrCourseOnly)
      : sadad&&cert ? 7 : sadad ? 3 : cert ? 5 : 1
```
- An elevated "Total" line, then "Next" links to `paymentConfirmation {CourseId, totalToPay: total, selectedService}`
- States: loading; offline ("The price will load…"); error or not found ("Price not available / We could not load this course's price…" with retry)

### 1.8 PaymentConfirmation (`screens\PaymentConfirmationScreen.tsx`)

- Displays "Review your payment", "Proceed to Payment", a card with "Total" and `totalToPay.toFixed(2)` plus the SAR icon, and a "Next" button.
- The button is disabled while busy or when `!(totalToPay > 0)`.
- Pressing it:
  1. `usePaymentGatewayGate().guard()`. If the dashboard toggle `enable:payment-gateway` is off, it shows the alert "Payments Temporarily Unavailable" and stops.
  2. If the user is not authenticated, `promptSignIn` with a return to this same screen and params.
  3. If `totalToPay` is not above 0, the danger toast "Price not available". **There is no free-course enrolment path anywhere in the app.** A course priced 0 shows "Free" but cannot be acquired through this flow.
  4. `clientOrderId`:
     - taken from the `reservationId` param when resuming (this is actually `getMyCourseResponse.id`, a UserCourse id; the code flags it as an unconfirmed backend contract)
     - or from a previous attempt
     - otherwise `POST Client/ClientOrder/CreateClientOrder {courses:[{courseId:Number(CourseId), selectedService}]}` and the response's `value.clientOrderId`
     - an error if it is still missing: "We couldn't find what this payment is for…"
  5. `POST Payment/Payment/PaymentCreditCardPayment` (multipart) with `TargetId = clientOrderId` and the billing fields from the user profile. Missing fields are sent as `"EmptyValue"`. The response gives `{pendingTransactionId, amount, pubKey:{pubkey}}`. A pending payment record is persisted at this point. If `amount` is not above 0, the error "We couldn't get the amount to charge".
  6. Open the Moyasar card form in a bottom sheet (85%):
     - `publishableApiKey = pubKey`
     - `amount = round(serverAmount * 100)` in halalas; always the **server** amount, never `totalToPay`
     - `currency = getCurrencyIsoCode()` (SAR)
     - `merchantCountryCode "SA"`
     - `description "Course Payment - {courseId} "`
     - networks: mada, visa, mastercard, amex
     - `saveCard: false`
  7. On a Moyasar success result (not an error): close the sheet and `router.replace(paymentStatus, {paymentId: result.id, pendingTransactionId})`. On a Moyasar error, the form stays open for a retry.
- While the card form is open:
  - A screenshot guard is active.
  - A 5-minute payment session guard runs (`PAYMENT_SESSION_DURATION_MS`, invisible). On expiry it closes the sheet, resets the attempt, and shows the toast "session expired".

### 1.9 PaymentStatus (`screens\PaymentStatusScreen.tsx`)

- Runs **once** on mount (ref-guarded): `useConfirmPayment.handleConfirmPayment({paymentId, pendingTransactionId, targetType: PaymentTarget.UserCourse})`, which calls `POST Payment/Payment/CheckPaymentStatus {paymentId, pendingTransactionId, userId}`.
- If either param is missing, the result is "failure".
- Status is one of `"loading" | "success" | "failure" | "unverified"`:
  - loading: spinner, "Verifying Payment..."
  - success: "Payment Successful! / Your course has been added successfully…" and "Continue" (replaces to `academy.index`)
  - unverified: clock icon, "Payment Not Confirmed / We couldn't confirm your payment yet. Don't pay again…", a "Confirm Again" button (re-calls confirm; it does not charge again), and an outlined "Continue"
  - failure: "Payment Failed / There was an issue…" and "Continue"
- On settled it invalidates `["coursesRoute-getMyCourses"]` with `refetchType: "all"`.

---

## 2. API endpoints (verbatim)

Base URL: `${EXPO_PUBLIC_API_URL}api/`.
- Every request gets `Authorization: Bearer <token>` when a token exists.
- The request interceptor appends `?culture=` (or `&culture=`) to every URL. The value is `params.academyLanguage` when present (academy hooks always pass it), otherwise the app i18n language.
- `academyLanguage` is also sent as a query param, since it is part of `params`.
- Infinite queries add `pageNumber` (starting at 1).

| # | Method | URL | Params/body | Response |
|---|---|---|---|---|
| 1 | GET | `Academy/Course/List` | `getCourseListPayload` + `academyLanguage` (query) | `GenericListResponse<CourseListItem[]>` |
| 2 | GET | `Academy/CourseCategory/List` | `getCourseCategoriesPayload` (defaults `pageNumber:1, pageSize:50, orderDirection:true`; the rail passes `pageSize:30`) | `GenericListResponse<CourseCategory[]>` |
| 3 | GET | `Academy/Course/GetCourseByUserId` | `getCourseByUserIdPayload` + academyLanguage | `GenericListResponse<GetCourseByUserIdResponse>` (the value itself is the course object) |
| 4 | POST | `Academy/UserQuizAttempt/Create` | multipart/form-data (below) | `SubmitQuizResponse` (`value` = new attempt id) |
| 5 | GET | `Academy/UserQuizAttempt/List` | `getQuizHistoryPayload` + `PageSize` + `pageNumber` + academyLanguage | `GenericListResponse<getQuizHistoryResponse>` (really `value: {pageNumber, pageSize, totalRecords, totalPages, data: QuizHistory[]}`) |
| 6 | GET | `Academy/UserQuizAttempt/GetById` | `{ Id: number }` + academyLanguage | `getQuizAttemptByIdResponse` |
| 7 | GET | `Academy/Quiz/GetById` | `getQuizByIdPayload` + academyLanguage | `QuizResponse` (typed bare; the code accepts `raw.value ?? raw`) |
| 8 | POST | `Academy/Lecture/SetProgress?userCourseId={UserCourseId}&LectureId={LectureId}` | body `{}` (JSON) | `any` |
| 9 | GET | `Academy/Course/View` | `getCourseViewPayload` (`courseId`, `academyLanguage`) | `getCourseViewResponse` |
| 10 | GET | `Academy/UserServices/MyCourses` | `getMyCoursesPayload` (`pageSize:20`, `pageNumber`, academyLanguage) | `GenericListResponse<getMyCourseResponse[]>` |
| 11 | POST | `Client/ClientOrder/CreateClientOrder` | JSON `CreateClientOrderPayload` | `GenericResponse<CreateClientOrder>` |
| 12 | POST | `Payment/Payment/PaymentCreditCardPayment` | multipart: `TargetId, Email, Address, City, State, Country, Postcode, Firstname, Lastname`. Every empty field becomes `"EmptyValue"`. `TargetType` is NOT sent. | `GenericResponse<PaymentCreditCardPayment>` |
| 13 | POST | `Payment/Payment/CheckPaymentStatus` | JSON `CheckPaymentStatusPayload` | `GenericResponse<boolean>` (`true` = settled; `false` with `isSuccess:true` = declined) |
| 14 | GET | `Client/ClientOrder/GetClientOrder?clientOrderId=` | — | `GenericResponse<ClientOrder>` (not used by the academy) |

**Submit quiz form fields (#4):**
```
UserCourseId, UserId, QuizId, StartTime (ISO), EndTime (ISO), [Id if set],
Answers[i].questionId, Answers[i].answerId, Answers[i].matchedWithAnswerId (only if not null)
```
The `Answers` array is flattened from the store with `getAllAnswers()`, which walks sub-questions recursively. It emits one entry per selected answer: a multiple-choice question produces several entries with the same `questionId`, and each matching pair is one entry `{answerId: leftId, matchedWithAnswerId: rightId}`.

### Envelopes (`R\api\types.ts`)
```ts
export type GenericListResponse<T> = {
  value: { pageNumber: number; pageSize: number; totalRecords: number; totalPages: number; data: T; };
  isSuccess: boolean; isFailure: boolean;
  error: { code: string; message: string; };
};
export type GenericResponse<T> = {
  value: T; isSuccess: boolean; isFailure: boolean;
  error: { code: string; message: string; actionCode: string | null; };
  actionCode: string | null;
};
export type ErrorResponse = { type: string; title: string; status: number; errors: { [key: string]: string }; traceId: string; code?: string; message?: string; };
```

### Request types (`R\features\common\academy\api\req.ts`)
```ts
export type getCourseByUserIdPayload = { UserCourseId: number; CourseId: number; };
export type submitQuizPayload = {
  Id?: number; UserCourseId: number; UserId: string; QuizId: number;
  StartTime: string; EndTime: string;
  Answers: { questionId: number; answerId: number; matchedWithAnswerId: number | null; }[];
};
export type getQuizHistoryPayload = {
  UserCourseId: number; userId: string; quizId: number; isExam?: boolean; score?: number;
  Search?: string; OrderBy?: string; OrderDirection?: boolean; PageNumber?: number; PageSize?: number;
};
export type getQuizByIdPayload = { Id: number; UserCourseId: number; };
export type setLectureProgressPayload = { UserCourseId: number; LectureId: number; };
export type getCourseCategoriesPayload = { pageNumber?: number; pageSize?: number; orderDirection?: boolean; academyLanguage?: string; };
export type getCourseViewPayload = { courseId: number; academyLanguage?: string; };
export type getMyCoursesPayload = { pageNumber?: number; pageSize?: number; };
// R\shared\types\academyCourse.types.ts
export type getCourseListPayload = {
  userId?: string; status?: boolean; rank?: number; Target?: string; CategoryId?: number;
  featured?: boolean; search?: string; pageNumber?: number; pageSize?: number;
  orderBy?: string; orderDirection?: boolean; Ids?: number[];
};
```
`Target` is sent as the number `6`, which is `CourseTarget.B2C(2) + CourseTarget.Both(4)`.

### Response types (`R\features\common\academy\api\res.ts`, verbatim)
```ts
export interface Course {
  name: string; description: string; tags: string; whatWeWillLearn: string; rank: number; status: boolean;
  fullAttachmentsPath?: string;          // owned endpoint only, comma-separated
  courseProgressPercentage?: number;     // owned endpoint only
  lastLecture?: Lecture;                 // owned endpoint only
  paymentSettings?: PaymentSetting;      // View endpoint only
  totalLectures: number; totalHours: number; lessons: Lesson[]; quizzes: Quiz[];
}
export interface GetCourseByUserIdResponse extends Course { id: number; UserCourseId: number; }
export interface Lesson { id: number; courseId: number; rank: number; userProgress: number; name: string; description: string; lectures: Lecture[]; quizzes: Quiz[]; }
export interface QuestionAnswer { id: number; attemptId: number; questionId: number; answerId: number; isCorrect: boolean; }
export interface getQuizAttemptByIdResponse {
  value: { id: number; userId: string; fullName: string; quizId: number; quizName: string; startTime: string; endTime: string;
    attemptScore: number; quizScore: number; qustions: QuizQuestion[]; answers: Array<QuestionAnswer>; };
  isSuccess: boolean; isFailure: boolean; error: { code: string; message: string; };
}
export interface Lecture { id: number; lessonId: number; videoUrl: string; rank: number; isCompleted: boolean; videoLengthInMinutes: number;
  textContent: string | null; attachments: string | null; fullAttachmentsPath: string; name: string; description: string; }
export interface Quiz { id: number; timerMintues: number; isExam: boolean; courseId: number; lessonId: number | null; title: string; description: string | null; isComplete: boolean; }
export interface QuizResponse { id: number; isExam: boolean; timerMinutes: number; score: number; courseId: number; courseName: string; lessonId: number; lessonName: string;
  isComplete: boolean; questions: QuizQuestion[]; translations: QuizTranslation[]; isSuccess: boolean; isFailure: boolean; error: ApiError; }
export interface ApiError { code: string; message: string; }
export interface QuizTranslation { id: number; langId: number; quizId: number; title: string; description: string; }
export interface QuizQuestion { id: number; type: number; score: number; quizId: number; quizName: string; translations: QuestionTranslation[];
  quizQuestionAnswers: QuizQuestionAnswer[]; parentQuestionId: number | null; relatedQuizQuestions: QuizQuestion[] | null; }
export interface QuestionTranslation { id: number; langId: number; questionId: number; text: string; description: string | null; videoUrl: string | null; }
export interface QuizQuestionAnswer { id: number; quizQuestionId: number; isCorrect: boolean; order: number; image: string; relatedToAnswerId: number | null; translations: AnswerTranslation[]; }
export interface AnswerTranslation { id: number; answerId: number; langId: number; text: string; }
export interface SubmitQuizResponse { value: number; isSuccess: boolean; isFailure: boolean; error: ApiError; }
export interface MyCoursePayment { status: number; sellingPlan: number; selectedService: number | null; price: number; certifiedExamPrice: number;
  sadadPrice: number; transactionId: string | null; createdAt: string; paidAt: string | null; }
export interface MyCourseLecture { id: number; videoUrl: string; lessonId: number; rank: number; videoLengthInMinutes: number; textContent: string | null;
  fullAttachmentsPath: string; name: string; description: string; }
export interface getMyCourseResponse { id: number; courseId: number; courseName: string; courseDescription: string | null; fullAttachmentsPath: string;
  rank: number; status: boolean; isUserPassExam: boolean; isArkanBooked: boolean; sentLinkDate: string; progressPercent: number; isCourseCompleted: boolean;
  courseStartTime: string | null; courseCompleteTime: string | null; totalLectures: number; totalHours: number; lastLecture: MyCourseLecture | null; payment: MyCoursePayment | null; }
export type QuizHistory = { id: number; userId: string; fullName: string; quizId: number; quizName: string; startTime: string; endTime: string;
  attemptScore: number; quizScore: number; questions: null | Array<QuizQuestion>; answers: Array<QuizQuestionAnswer> | null; };
export interface getQuizHistoryResponse { value: { pageNumber: number; pageSize: number; totalRecords: number; totalPages: number; data: Array<QuizHistory>; };
  isSuccess: boolean; isFailure: boolean; error: { code: string; message: string; }; }
export interface PaymentSetting { sellingPlan: number; price: number; certifiedExamPrice: number; sadadPrice: number; }
export interface Value { name: string; description: string; tags: string; whatWeWillLearn: string; rank: number; status: boolean; totalLectures: number; totalHours: number;
  userCourseId?: any; paymentSettings: PaymentSetting; lessons: any[]; quizzes: any[]; }
export interface Error { code: string; message: string; }
export interface getCourseViewResponse { value: Value; isSuccess: boolean; isFailure: boolean; error: Error; }
export interface CourseCategoryTranslation { id: number; langId: number; categoryId: number; name: string; description: string; }
export interface CourseCategory { id: number; parentId: number | null; rank: number; status: boolean; fullImagePath: string; hasChild: boolean; hasCourse: boolean;
  parentName: string | null; translations: CourseCategoryTranslation[]; }
// R\shared\types\academyCourse.types.ts
export interface CourseListItem { id: number; userCourseId?: number; rank: number; status: boolean; isFeatured?: boolean; target?: number; categoryId?: number;
  categoryName?: string; featured?: boolean; fullImagePath?: string; paymentSettings?: CourseListItemPaymentSettings | null; translations?: CourseListItemTranslation[];
  name?: string; description?: string; tags?: string; fullAttachmentsPath?: string; totalLectures?: number; totalHours?: number; courseProgressPercentage?: number; }
export interface CourseListItemTranslation { id: number; langId: number; courseId: number; name: string; description: string | null; tags: string | null;
  whatYouWillLearn?: string | null; attachment?: string | null; }
export interface CourseListItemPaymentSettings { id: number; sellingPlan: number; price: number; certifiedExamPrice: number; sadadPrice: number; }
```
Note: `Course/View` exposes `userCourseId?: any` on its `Value` type, but nothing in the UI uses it.

### Payment types (`R\features\common\payment\api\*`, `R\shared\types\payment.types.ts`)
```ts
export type PaymentCreditCardPaymentPayload = { TargetType: PaymentTarget; TargetId: string; Firstname?: string; Lastname?: string; Email?: string;
  Address?: string; City?: string; Country?: string; State?: string; Postcode?: string; };
export type CreateClientOrderPayload = {
  reservation?: { serviceProviderBranchId: number; dateChosen: string; ownerId: string; reservationServices: { serviceProviderBranchServiceId: number; slotTimeId: number; }[]; };
  courses?: { courseId: number; selectedService: number; }[];
};
export type GetClientOrderPayload = { clientOrderId: string; };
export type CheckPaymentStatusPayload = { paymentId: string; pendingTransactionId: string; userId: string; /* required by DTO model binding, 400 otherwise */ };
export type PaymentCreditCardPayment = { pendingTransactionId: string; amount: number /* major units, tax incl., server-computed */; pubKey: { pubkey: string; }; };
export type ClientOrderItem = { id: number; itemType: ClientOrderItemType; reservationId: string | null; userCourseId: number | null; selectedService: number;
  description: string; unitAmount: number; taxAmount: number; lineTotal: number; courseName: string | null; };
export type ClientOrder = { id: string; items: ClientOrderItem[]; };
export type CreateClientOrder = { clientOrderId: string; total: number; };
```
Payment error codes are read from `response.data.code`. A `"Missing resource: "` prefix is stripped before matching:
```
InvalidPaymentTargetCode, InvalidPaymentTargetReferenceCode, InvalidReservationIdCode, InvalidUserCourseIdCode,
InvalidPaymentTargetIdFormatCode, ReservationNotFoundCode, PaymentAlreadyCompletedCode, InvalidPaymentAmountCode,
PendingTransactionNotFoundCode, PendingTransactionNotOwnedByUserCode
```

---

## 3. Enums

```ts
enum QuestionType { SingleChoice = 1, MultipleChoice = 2, Matching = 4, Video = 8, TrueOrFalse = 16 }   // TrueOrFalse renders as SingleChoice
enum CourseLectureOrQuizType { LECTURE = 1, QUIZ = 2, ATTACHMENT = 3 }
enum CourseModuleAvailability { AVAILABLE = 1, LOCKED = 2, COMPLETED = 3 }   // declared, unused
type ActivityType = "lecture" | "quiz" | "exam"
type AcademyZone = "studying" | "browse"
type CourseFilter = "all" | "featured" | number
enum CourseSellingPlan { CourseOnly = 1, Seperated = 2, Bulk = 4 }
enum CourseSelectedService { BulkOrCourseOnly = 0, CourseOnly = 1, CoursePlusSadad = 3, CoursePlusCertified = 5, CoursePlusSadadPlusCertified = 7 }
enum PaymentTarget { Reservation = 1, UserCourse = 2 }
enum CourseTarget { B2B = 1, B2C = 2, Both = 4 }
enum ClientOrderItemType { Service = 1, ServiceGroup = 2, Course = 3 }
PAYMENT_STATUS_PENDING = 1        // MyCoursePayment.status; no other status values are defined client-side
PASS_THRESHOLD_PERCENT = 80
PaymentOutcomeKind = "settled" | "declined" | "unverified" | "blocked"
Capability.ViewAcademyBrowse = 3, Capability.ViewAwaitingCoursePayment = 4
BackendLangId { English = 1, Arabic = 2 }   // no ids for ur/ne/bn/hi
ACADEMY_LANGUAGES = ["en","ar","ur","ne","bn","hi"]
```

---

## 4. Business rules

### Activity sequencing and locking (`store\courseStore.ts`, `store\courseProgressStore.ts`)

**Flattening** (`initializeFromCourse`). Activities are built in this order and then sorted by `rank` ascending:
- Per lesson: lectures with `rank = lesson.rank*1000 + lecture.rank`
- Per lesson: non-exam quizzes with `rank = lesson.rank*1000 + 900 + quizIndex`
- Course-level non-exam quizzes where `lessonId === null`: `rank = 999999 + quizIndex`
- All exams (from lessons and course level): `rank = 999999 + quizIndex`, where the index counts across all quizzes
- `lessonRank` of 0 is falsy, so such a lesson's quizzes fall back to the course-level rank.

**Starting activity** (`lastActiveActivity`):
1. The activity matching `course.lastLecture.id` (lecture)
2. Otherwise the first `!isCompleted` activity
3. Otherwise the last activity

**Locks:**
- `availableActivity` is the first activity with `!isCompleted`.
- **Every activity after it is locked**, keyed as `"type:id"`, even activities after it that are already completed.
- Activities before it are open for review.
- If everything is complete, nothing is locked.
- `setLastActiveActivity` refuses a locked activity.
- `markActivityAsComplete` sets `isCompleted`, sets the next incomplete activity after it (or the last one) as active, and recomputes locks.
- So yes: the learner must finish the current lecture (video `ended`) or quiz (a passed or accepted attempt) before the next one unlocks.

**Edge bugs to be aware of:**
- `ActivityRow` passes `"quiz"` even for a lesson quiz that is an exam.
- `LessonSection` checks lock state with `"quiz"`, while exams are stored as `"exam"`.
- Multiple-choice and matching sub-questions inside a video question read answers only from top-level `state.questions`, so their selection UI may not reflect state. Single choice uses the recursive `getQuestionAnswer`.

### Progress
- Course and lesson progress are server-provided: `progressPercent` (my courses), `courseProgressPercentage` (owned course), `lesson.userProgress`.
- No client-side calculation, except the lesson "{done} of {total}" = `floor(total*userProgress/100)`.
- Values are clamped to 0–100 for display.

### Lecture progress
- Sent only on the Vimeo `ended` event, as `POST Lecture/SetProgress`, once per lecture, skipped if already completed.
- There is no heartbeat, no position tracking, and no resume position.

### Quiz scoring (`helpers\quizScore.ts`)
```ts
getAttemptScorePercentage = Math.round(((attemptScore||0)/(quizScore||1))*100) || 0
isPassingAttempt = percentage >= 80
```
- The pass mark is a client constant; the API provides none.
- The server grades. The client does not score answers.

### Quiz outcome after submit (`hooks\useQuizOutcome.ts`)
- After `submitQuiz` succeeds (`value` = new attempt id), the hook re-fetches `UserQuizAttempt/List` (PageSize 10, the same query key as the history screen).
- It finds the attempt by id, falling back to the highest id.
- The submit mutation also invalidates and removes the inactive `coursesRoute-getQuizHistory` queries.
- Outcomes:
  - Not found: alert "Answers submitted" then continue (the activity completes).
  - Passed: alert "You passed / You scored X%…" then continue.
  - Failed with no earlier passing attempt: alert "You did not pass / You scored X%, and 80% is needed…" with "Try again". This resets the attempt in place: same questions, answers cleared, back to question 1, new startTime, timer reset.
  - Failed with an earlier passing attempt: confirm with "Try again" / "Continue anyway". "Continue anyway" completes the activity; a dismiss retries.

### Attempts
- No attempts limit exists client-side.

### Timer
- `timerMinutes ?? timerMintues`, in minutes. The value is 0 when untimed.
- `remainingSeconds = minutes*60`, ticking every second.
- At 0: the attempt is **not** submitted; the learner is told and sent back to the course.

### Exam vs quiz
- Both use the same UI and the same endpoints.
- An exam (`isExam`) is placed at the very end of the sequence, shown as an `ExamRow` card with a "Final Exam" label, and has type `"exam"`.
- A course-level non-exam quiz also renders as an `ExamRow`, without the label.

### Question types
- **Single / TrueOrFalse**
  - Lettered options A, B, C…
  - Selecting runs `clearQuestionAnswer` then `answerQuestion`, so re-selecting replaces.
  - Text comes from `translations[0].text` / `.description`; option text from `option.translations[0].text`.
- **Multiple**
  - Checkboxes with the hint "Select all that apply".
  - `answerQuestion` toggles the answer id.
- **Matching** (`helpers\matchingHandler.ts` `splitOptions`)
  - Answers are split by array index: even indexes go to the left column (A), odd to the right (B).
  - Each column is shuffled with a deterministic seeded Fisher–Yates. The seed is `answers.reduce((h,a)=>(h*31+a.id)|0, 17) || 1` and the generator is Mulberry32; one generator shuffles both columns.
  - Tap flow: tapping an item in one column then an item in the other column records `answerQuestion(qId, leftId, rightId)`. Tapping the same item again deselects it.
  - The store keeps one pair per left `answerId`, and re-pairing replaces it.
  - Matched items disappear from the columns and show in the "Group match #n" list, with an X that calls `answerQuestion(qId, leftId)` to remove the pair.
  - A "How to Match" instruction box is shown.
  - In history, the correct pairing is `rightAnswer.relatedToAnswerId === leftAnswer.id`. Left items are those with `relatedToAnswerId === null`.
- **Video** (`QuestionVideo.tsx`)
  - A container: the Vimeo player (default Vimeo chrome) from `translations.find(t => t.videoUrl).videoUrl`, then the title and description, "Answer the following questions:", and each `relatedQuizQuestions` entry rendered through `quizSubQuestionMapper`.
  - Nesting is one level only, and a Video sub-question falls back to single choice.
  - Watching the video is NOT required.
  - The container itself holds no answer. It counts as answered when all of its sub-questions are.

### Store seeding
- Seeding creates `UserQuestion { question, answers: [], subQuestions: relatedQuizQuestions?.map(q => ({question:q, answers:[]})) }`.

### Certificate
- There is no certificate feature in the client. The only related data are `getMyCourseResponse.isUserPassExam`, `isArkanBooked` and `sentLinkDate`, which are unused, and the "Certificate Exam" add-on (`certifiedExamPrice`).

### Course state (`helpers\myCourseState.ts`)
- Pending means `payment?.status === 1`.
- `getAmountOwed = price + (selectedService in [3,7] ? sadadPrice : 0) + (selectedService in [5,7] ? certifiedExamPrice : 0)`. It uses a membership test per value, not bitwise.
- Completed means `isCourseCompleted`.
- Pending courses route to paymentConfirmation; all others route to courseDetails.

### Scope: company member vs client
- Both role tabs render the same `AcademyHomeScreen` wrapped in `AcademyScopeShell` (`components\AcademyScopeShell.tsx`), which is `AcademyScopeProvider` plus `SpecialSectionLayout`.
- The shell sets the RTL/LTR `direction` from the academy language, and `Text` switches to the academy language and font.
- "Scope" here is about language and direction. The client/companyMember difference comes only from Capabilities:
  - CompanyMember has no Browse zone (Studying only, no tabs).
  - CompanyMember has no "Awaiting payment" group.
  - CompanyMember cannot reach courseDetails, lockedCourse, paymentFlow or paymentConfirmation (`Stack.Protected`).
  - Note: courseDetails is behind `ViewAcademyBrowse`, so a CompanyMember tapping an owned course would hit a guarded route.

### Multi-language
- The academy content language is independent of the app UI language (en/ar).
- It is stored in the persisted zustand store `academy-store` (`R\shared\store\academyLanguageStore.ts`).
- When unset ("system"), it is the device OS locale if that is one of `en, ar, ur, ne, bn, hi`, otherwise `en`.
- It is picked in the drawer (`DrawerAcademyLanguageControl.tsx`, labels English / العربية / اردو / नेपाली / বাংলা / हिन्दी) and in Settings.
- Content language reaches the server as `culture=<academyLanguage>` (and the `academyLanguage` param) on every academy request, and it is part of every query key.
- **The server returns translations already filtered to that culture.** The client reads `translations[0]` everywhere; it does not pick by `langId`.
- UI strings come from `ta(key)`, which is `i18n.t(key, {lng: academyLanguage, ns: "academy"})`, using `R\features\common\academy\translations\{en,ar,ur,ne,bn,hi}.ts`. All six files share the same key tree, typed `AcademyEn`.
- RTL is `i18n.dir(lang) === "rtl"`, so ar and ur are RTL.
- Some toasts (the locked-module messages and payment errors) still use the app-language `translate()`.

### Caching
- Default staleTime is 1 minute.
- Normal queries poll every 3 minutes. Infinite queries do not poll.
- `refetchOnMount: false`.
- Only transport failures are retried.
- The unfiltered `getCourseList` and `getCourseCategories` are "catalog" queries: 1h staleTime, 24h gcTime, persisted to disk. Filtered or searched variants are not.
- `paymentRoute` responses are never cached.

---

## 5. Stores

### `courseStore` (`R\features\common\academy\store\courseStore.ts`)

State:
- `activities: CourseActivity[]`
- `lastActiveActivity: CourseActivity | null`
- `rawCourseData: GetCourseByUserIdResponse | null`
- `userCourseId: number | null`

Actions:
- `initializeFromCourse(course, userCourseId)`
- `setLastActiveActivity(id, type)`: refuses locked activities; sets null if not found
- `markActivityAsComplete(id, type)`
- `getLastActiveActivity()`
- `reset()`

Types:
```ts
LectureActivity { id; type:"lecture"; rank; isCompleted; lessonId; lessonName; name; description; videoUrl; videoLengthInMinutes; textContent: string|null; attachments: string|null; fullAttachmentsPath }
QuizActivity    { id; type:"quiz"; rank; isCompleted; lessonId: number|null; lessonName: string|null; courseId; title; description: string|null; timerMinutes }
ExamActivity    { id; type:"exam"; rank; isCompleted; courseId; title; description: string|null; timerMinutes }
```

### `courseProgressStore`

State:
- `expandedSection: number | null` (accordion)
- `availableActivity: {id, type} | null`
- `lockedActivityKeys: Set<"type:id">`

Actions: `setExpandedSection`, `initializeProgress(activities)`, `isActivityLocked(id, type)`, `isAvailableActivity(id, type)`, `reset`.

### `quizStore`

State:
- `questions: UserQuestion[]`, where `UserQuestion {question: QuizQuestion; answers: UserAnswer[]; subQuestions?: UserQuestion[]}` and `UserAnswer {answerId: number; matchedWithAnswerId?: number|null}`
- `activeQuestionIndex`
- `startTime` / `endTime` (ISO)
- `quizId`, `userCourseId`, `userId`
- `isAttemptInProgress`
- `remainingSeconds: number|null`, `isTimerRunning`

Actions:
- `setQuestions` (also stamps `startTime = now`)
- `setActiveQuestionIndex`, `navigateToNext`, `navigateToPrevious` (bounded), `isQuestionAnswered(index)`
- `answerQuestion(questionId, answerId, matchedWithAnswerId?)`, recursive into sub-questions:
  - with a match id: upsert by `answerId`
  - without: toggle `answerId`
- `clearQuestionAnswer`
- `getAllAnswers()`: a flat list, recursive
- `getQuestionAnswer`: recursive
- `setStartTime`, `setEndTime`, `setMetadata`, `setIsAttemptInProgress`, `setRemainingSeconds`
- `startTimer`, `stopTimer`, `tick` (decrement while running and above 0; stop at 0)
- `initializeQuiz`, `reset`

Lifecycle:
- None of the three academy stores is persisted.
- All three are reset on sign-out (`store\index.ts`, `registerSignOutHandler`).

### Shared stores used by the academy
- `usePendingPaymentStore`, persisted as `"pending-payment-store"`: `pending: {pendingTransactionId, paymentId: string|null, targetType, targetId, amount, createdAt(ISO UTC)} | null`, with `startPendingPayment`, `attachPaymentId`, `clearPendingPayment`, and `getResumablePayment` (requires `paymentId`, age at most 7 days).
- `useAcademyLanguageStore`, persisted as `"academy-store"`: `academyLanguage: AcademyLanguage | undefined`.
- `usePaymentSessionStore`: `expiresAt`; the session lasts 5 minutes.

---

## 6. Course payment summary

- **Plans:** see `sellingPlan` in §1.7.
  - CourseOnly: pays `price`.
  - Bulk: pays everything, `selectedService = 0`.
  - Seperated: course is required, SADAD and certificate exam are optional add-ons, `selectedService` is 1, 3, 5 or 7.
- Catalogue and summary price displays: Bulk shows the sum ("Full Price"); Seperated shows the base price ("Starts from"); 0 shows "Free".
- **Free courses:** no enrol endpoint exists client-side, and PaymentConfirmation blocks a total of 0 or less. The website would need a backend enrol API.
- **Sequence:**
  1. `CreateClientOrder {courses:[{courseId, selectedService}]}` returns `clientOrderId`.
  2. `PaymentCreditCardPayment {TargetId: clientOrderId, billing fields…}` returns `{pendingTransactionId, amount, pubKey.pubkey}`. The pending record is persisted.
  3. The Moyasar card form charges `round(amount*100)` in SAR. Moyasar returns a `payment.id`, which is attached to the pending record.
  4. On paymentStatus, `CheckPaymentStatus {paymentId, pendingTransactionId, userId}` is called once.
- **The server does not use a webhook or redirect URL.** The client must call CheckPaymentStatus. On the web, use the Moyasar web form with a `callback_url` pointing at a status page that reads `id` and calls CheckPaymentStatus.
- **Outcome classification** (`R\shared\helpers\classifyPaymentOutcome.ts`):
  - `value:true` is settled.
  - `value:false` is declined (retry allowed).
  - No response or status 500 and above is unverified. The pending record is kept and "Confirm Again" is offered; never show this as a failure.
  - Codes `PendingTransactionNotFoundCode` or `PaymentAlreadyCompletedCode` count as settled.
  - Any other known code is blocked.
  - An unknown 4xx is unverified.
  - Settled invalidates `coursesRoute-getMyCourses`.
- **Status polling:** there is none. It is one confirm call plus a manual "Confirm Again".
- **Pending resume (two mechanisms):**
  - (a) `PendingPaymentResumer`, mounted in `R\app\(app)\_layout.tsx` and implemented by `R\features\common\payment\hooks\useResumePendingPayment.ts`. Once per app start, if the persisted record has a `paymentId` and is at most 7 days old, it replays `CheckPaymentStatus`. Settled shows the alert "A payment you started earlier has gone through". Declined or blocked shows a toast. Unverified stays silent and keeps the record. A record without a `paymentId` is dropped.
  - (b) Server-side pending enrolments (`MyCourses` with `payment.status === 1`) appear under "Awaiting payment" with the amount owed. Tapping one opens PaymentConfirmation with `reservationId = UserCourse id`, which is used as `TargetId`, skipping order creation. The code comments flag this as unconfirmed with the backend.
- **Guards:** the dashboard payment-gateway toggle (press-time alert, fails open), sign-in at press time, and the 5-minute hidden session plus screenshot block while the card form is open.
