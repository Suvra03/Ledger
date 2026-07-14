# Ledger — Personal Finance Tracker
## Full Project Specification

This document describes the complete product, design, and technical plan for
a personal expense-tracking app. It's written so it can be handed to any AI
tool or developer to continue, extend, or rebuild the project without losing
context.

---

## 1. Product vision

**Who it's for:** one person (the owner) tracking their own money across
multiple savings accounts — not a shared household budgeting tool, not
multi-user.

**Core problem it solves:** money is spread across 3 separate savings
accounts, and there's no single place to see, at a glance, how much is in
each account, where money went, and when.

**Design philosophy:** treat it like a digital ledger book, not a generic
fintech dashboard. Numbers are the content — precise, tabular, honest.
Nothing is decorative for its own sake. See Section 6 (Design system).

**Platform:** a mobile-first responsive web app, installable as a PWA
("Add to Home Screen"), deployed on Vercel. Native mobile app is a possible
future step, reusing the same backend.

---

## 2. Feature list

### Must-have (already built in the current version)
- Track 3+ personal savings accounts, each with its own running balance
- Log income, expense, and transfer-between-accounts transactions, each with
  amount, category, account, date, and time
- Dashboard: total balance across all accounts, per-account balance cards,
  recent activity feed
- Calendar view: month grid, shaded by how much was spent that day (heatmap),
  tap a day to see that day's transactions
- Reports: spend by category (pie chart), spend by account (bar chart),
  month-to-date income vs. expense totals, biggest category called out
- Account detail page: full transaction history for a single account
- App lock: PIN code and/or Face ID / Touch ID (via WebAuthn platform
  authenticator), configured per device, auto-relocks after 5 minutes idle
- Auth: register/login with phone number + password; forgot-password via a
  6-digit OTP code emailed to the user's registered email address
- Settings: add accounts, manage app lock, change password, log out

### Not yet built — natural next additions
- **Budgets per category** with a progress bar ("₹4,200 / ₹6,000 spent on
  Food this month") — needs a `budgets` table (user_id, category_id, month,
  limit_amount) and a progress calculation against that month's transactions
- **Recurring transactions** (salary, rent, EMIs, subscriptions) — needs a
  `recurring_transactions` table (user_id, account_id, category_id, amount,
  type, day_of_month, note) plus a Vercel Cron job that runs daily and
  inserts any transactions that are due
- **Tags** in addition to categories, for cross-cutting filters like "Goa
  trip" or "Diwali" that span multiple categories
- **Net worth trend** — a line chart of total balance across all accounts
  over time (derivable from existing transaction history, just needs a
  day-by-day balance rollup query)
- **Low balance alerts** — compare current balance to a per-account
  threshold, show a banner or push notification
- **CSV/Excel export** — query all transactions, convert client-side with a
  library like `papaparse`, trigger a file download; no new backend needed
- **Dark mode** — a second set of CSS variable values for the same design
  tokens, toggled and stored in localStorage
- **Multi-currency support** — add a `currency` column to `accounts`, store
  amounts in each account's native currency, convert only for the combined
  total (would need an FX rate source)
- **Insights page** — comparison vs. last month, spending streaks, biggest
  single transaction of the month

---

## 3. Information architecture (site map)

```
/login                      — phone + password sign in
/register                   — name, phone, email, password
/forgot-password            — phone → email OTP → new password
/dashboard                  — home: total balance, accounts, recent activity
/accounts/:id                — single account's balance + full history
/add                         — add income / expense / transfer
/calendar                    — month heatmap + tap-a-day detail
/reports                     — category pie, account bar, month totals
/settings                    — accounts, app lock, password, logout
```

Bottom navigation (mobile) has 5 items: Home, Calendar, **+ Add** (center,
raised), Reports, Settings.

---

## 4. Page-by-page detail

### 4.1 Login (`/login`)
**Purpose:** authenticate an existing user.
**Fields:** phone number (tel input), password (masked).
**Actions:** "Sign in" (primary button); "Forgot password?" link; "Create
account" link.
**Behavior:** on success, redirect to `/dashboard`. On failure, show a single
generic error ("Incorrect phone number or password") — never reveal whether
the phone number exists, to avoid account enumeration.

### 4.2 Register (`/register`)
**Purpose:** create a new account.
**Fields:** full name, phone number, email (explicitly labeled "used to
reset your password"), password, confirm password.
**Validation:** password ≥ 8 characters, password === confirm password,
phone number not already registered (server-checked).
**Behavior:** on success, the new user is auto-signed-in and redirected to
`/dashboard`. Default categories (Salary, Food, Transport, Bills, etc.) are
created automatically for the new user — see Section 5.5.

### 4.3 Forgot password (`/forgot-password`)
**Purpose:** reset a forgotten password without needing SMS.
**Flow (3 steps):**
1. Enter phone number → server looks up the associated real email → an OTP
   is emailed.
2. Enter the 6-digit code shown as "sent to j***@gmail.com" (masked).
3. Enter and confirm a new password.
**Edge cases:** wrong/expired OTP shows an inline error and lets the user
retry; unknown phone number shows a generic "no account found" message.

### 4.4 Dashboard / Home (`/dashboard`)
**Purpose:** the default landing screen — a snapshot of overall finances.
**Contents, top to bottom:**
- Greeting ("Hello, [first name]")
- Total balance across all accounts, large, in tabular monospace figures
- Horizontally scrollable row of account cards (name, bank, balance, color
  dot) — tapping one opens `/accounts/:id`
- "Recent activity" list — last 8 transactions across all accounts, each row
  showing category/type, time, account, note, and signed amount
  (green "+" for income, rust "−" for expense)
- Empty state if no accounts exist yet: a prompt to add one, linking to
  Settings

### 4.5 Add transaction (`/add`)
**Purpose:** the single fastest path to log money moving.
**Contents:**
- 3-way toggle: Expense / Income / Transfer (Expense selected by default,
  since that's the most frequent entry)
- Account selector (or "From account" + "To account" for transfers)
- Amount (numeric keypad on mobile)
- Category selector (hidden for transfers; filtered to income or expense
  categories based on the toggle)
- Date and time (defaults to now, editable — supports back-dating a
  transaction you forgot to log earlier)
- Optional note (free text, e.g. "Groceries at DMart")
- "Save transaction" button
**Behavior:** on save, briefly shows a confirmation, then returns to
Dashboard with fresh data.

### 4.6 Account detail (`/accounts/:id`)
**Purpose:** drill into one account's activity.
**Contents:** account name/bank/color, current balance (computed from
opening balance + all transactions), full chronological transaction list
(no pagination limit in the current build — add pagination if history grows
large).

### 4.7 Calendar (`/calendar`)
**Purpose:** answer "where did my money go, day by day?"
**Contents:**
- Month navigation (‹ month name year ›)
- 7-column calendar grid; each day cell is shaded by that day's total
  expense relative to the month's highest-spend day (heatmap)
- Tapping a day reveals that day's transactions below the grid, with the
  day's total shown alongside the heading
**Notes:** only expenses feed the heatmap; income/transfers are excluded
from this view intentionally, since the goal is spend awareness.

### 4.8 Reports (`/reports`)
**Purpose:** month-level insight, not just a raw list.
**Contents:**
- Income vs. expense totals for the current month, side by side
- Callout sentence naming the biggest category so far
- Pie chart: spend by category, with a matching legend/list showing exact
  amounts
- Bar chart: spend by account
**Scope:** currently hard-scoped to "this month" — a natural extension is a
date-range picker.

### 4.9 Settings (`/settings`)
**Purpose:** account and device management.
**Sections:**
- **Your accounts** — list of existing accounts; a form to add a new one
  (name, bank name, opening balance)
- **App lock** — toggle PIN (set a 4–6 digit code) and/or Face ID/Touch ID
  (registered via WebAuthn) independently; both are off by default
- **Change password** — new password field, updates immediately
- **Log out** — signs out and returns to `/login`

---

## 5. Data model

Five tables, all Postgres (Supabase), all with row-level security so a user
can only ever read/write their own rows.

### 5.1 `profiles`
| column | type | notes |
|---|---|---|
| id | uuid, PK | matches `auth.users.id` |
| name | text | |
| phone | text, unique | the user-facing login identifier |
| contact_email | text | real email, used only for OTP password resets |
| auth_email | text | synthetic internal email Supabase Auth actually uses |
| app_lock_enabled | boolean | reserved for future server-side lock state |
| created_at | timestamptz | |

### 5.2 `accounts`
| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → auth.users | |
| name | text | e.g. "HDFC Savings" |
| bank_name | text, nullable | |
| color | text | hex color for UI accents |
| opening_balance | numeric(12,2) | starting balance before any logged transactions |
| created_at | timestamptz | |

### 5.3 `categories`
| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK | |
| name | text | e.g. "Food" |
| kind | text | `income` or `expense` |

Default categories seeded automatically on profile creation: Salary, Other
Income, Food, Transport, Bills, Shopping, Health, Entertainment, Other.

### 5.4 `transactions`
| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK | |
| account_id | uuid, FK → accounts | the primary account involved |
| transfer_to_account_id | uuid, FK → accounts, nullable | only set when type = transfer |
| type | text | `income`, `expense`, or `transfer` |
| amount | numeric(12,2) | always positive; direction is implied by `type` |
| category_id | uuid, FK → categories, nullable | null for transfers |
| note | text, nullable | |
| occurred_on | date | |
| occurred_at_time | time | |
| created_at | timestamptz | |

**Balance calculation** (done in application code, not stored as a column,
so it's always consistent with the transaction log):
`balance = opening_balance + Σ(income) − Σ(expense) − Σ(transfers out) + Σ(transfers in)`

### 5.5 Automatic behavior
A Postgres trigger (`on_profile_created`) fires after every insert into
`profiles` and seeds that user's default categories — so a brand-new user
can add a transaction immediately without a manual setup step.

---

## 6. Design system ("ledger" aesthetic)

The visual direction deliberately avoids generic AI-app defaults (cream +
serif + terracotta; black + neon accent; broadsheet newspaper grid) in favor
of something literal to the subject: a hand-ruled ledger book.

**Color tokens**
| name | hex | use |
|---|---|---|
| paper | `#EDEFEA` | app background |
| surface | `#FBFCF9` | cards, inputs |
| ink | `#1F2A24` | primary text, primary buttons |
| ink-soft | `#4B5750` | secondary text |
| rule | `#D8DCD3` | borders, dividers |
| jade | `#2F6F4F` | income, positive amounts |
| rust | `#B5533C` | expense, negative amounts, destructive actions |
| gold | `#C9A227` | focus rings, highlights |

**Typography**
- Display face: **Fraunces** (serif, weights 500/600/700) — headings only,
  used with restraint
- Body face: **Inter** — UI text, labels, buttons
- Utility/data face: **IBM Plex Mono** — all monetary amounts, using
  tabular figures (`font-variant-numeric: tabular-nums`) so numbers align
  in columns like a real ledger

**Signature element:** amounts are never paired with icons or badges — they
stand alone in monospace, colored jade (income) or rust (expense), right of
a plain-text label. Transaction lists use a thin rule between rows rather
than cards-within-cards, echoing ruled ledger paper.

**Accessibility floor:** visible focus rings (gold outline), reduced-motion
respected, responsive down to a ~360px mobile viewport (this is a
mobile-first app — desktop is a secondary target).

---

## 7. Authentication design (the tricky part)

The product requirement was: **log in with phone number + password**, and
**reset password via a one-time code emailed to you** (no SMS, to avoid
per-message costs).

Supabase Auth natively supports email+password or phone+SMS-OTP — not
phone+password directly. The bridge used:

1. At registration, the phone number is converted to a synthetic internal
   email (`p<digits>@users.ledger-app.internal`) which becomes the user's
   real Supabase Auth email. The user never sees this.
2. Their real email address is stored separately in `profiles.contact_email`
   and used only for password-reset OTPs.
3. **Login:** phone number is converted to the synthetic email client-side,
   then a normal `signInWithPassword` call is made.
4. **Forgot password:** phone number is sent to a server route that looks up
   `contact_email` (using the Supabase service-role key, so this mapping is
   never exposed to the browser) → an OTP is emailed via
   `signInWithOtp({ email })` → the user verifies the code with
   `verifyOtp()`, which logs them in → `updateUser({ password })` sets the
   new password.

This whole bridge lives in two server-only routes
(`/api/auth/register`, `/api/auth/lookup-email`) that use the Supabase
service role key — never shipped to the browser.

**App lock (PIN / Face ID / Touch ID)** is a separate, second layer, local
to each device:
- A PIN is hashed (SHA-256) and stored in that device's `localStorage`; on
  each app open, the entered PIN is hashed and compared.
- Face ID/Touch ID uses the WebAuthn platform authenticator
  (`navigator.credentials.create` / `.get`) purely as a local device gate —
  it is not tied to the Supabase login session, just an extra screen before
  the app content renders.
- Auto-relocks after 5 minutes of inactivity (tracked via `sessionStorage`,
  which clears on tab close).

---

## 8. Tech stack & architecture

- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** Tailwind CSS, custom design tokens (Section 6)
- **Backend:** Supabase (managed Postgres + Auth), accessed via
  `@supabase/ssr` for cookie-based sessions across server/client
- **Charts:** Recharts (pie + bar charts on Reports page)
- **Hosting:** Vercel (serverless functions for the two API routes, static
  + SSR for everything else)
- **Auth session handling:** Next.js middleware refreshes the Supabase
  session on every request and redirects unauthenticated users away from
  app pages, and authenticated users away from auth pages
- **Row-level security:** enforced at the database level (Postgres RLS
  policies), not just in application code — even a leaked anon key can't
  expose one user's data to another

### Folder structure
```
app/
  (auth)/login, register, forgot-password/     — public auth pages
  (app)/dashboard, accounts/[id], add,
        calendar, reports, settings/           — authenticated pages,
                                                  wrapped in AppLockGate
  api/auth/register, lookup-email/             — server-only routes
components/                                    — AccountCard, TransactionRow,
                                                  BottomNav, AppLockGate
lib/
  supabase/client.ts                           — browser Supabase client
  supabase/server.ts                           — server Supabase client
                                                  + admin (service-role) client
  supabase/middleware.ts                       — session refresh + route guards
  types.ts, utils.ts
supabase/schema.sql                            — full DB schema + RLS + seed trigger
```

---

## 9. Open questions / decisions still needed

If you continue this with another AI or developer, these are the
unresolved judgment calls worth deciding explicitly:

1. **Transaction history growth** — account detail and dashboard currently
   load full/near-full history with no pagination. Fine at hundreds of
   rows; add pagination or infinite scroll before it grows into the
   thousands.
2. **Multi-device app lock** — PIN/Face ID is per-device by design (simpler,
   no server sync). If cross-device lock state is wanted later, it needs a
   server-stored flag plus a UX decision about what "device-bound biometric"
   even means across devices.
3. **Editing/deleting transactions** — not yet built. Needs decisions on
   whether edits are audited (kept as history) or just overwritten.
4. **Currency** — currently hardcoded to INR formatting throughout.
5. **Category management UI** — categories exist and are seeded by default,
   but there's no page yet to add/rename/delete custom categories.
