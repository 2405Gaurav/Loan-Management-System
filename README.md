# CreditSea — Loan Management System

Full-stack LMS built for the CreditSea assignment: borrowers apply for loans; internal teams manage the lifecycle through role-based ops modules.

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind + Framer Motion · Express 5 + TypeScript · MongoDB + Mongoose · JWT + bcrypt

---

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Server

```bash
cd server
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET (never commit .env)
npm install
npm run seed    # creates one user per role (see credentials below)
npm run dev     # http://localhost:5000
```

### 2. Client

```bash
cd client
cp .env.example .env.local
# Optional: NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev     # http://localhost:3000
```

### 3. Verify

- Health: `GET http://localhost:5000/api/health`
- Borrower flow: sign up → eligibility → upload slip → apply
- Staff: log in with a role below → `/dashboard`

---

## Seeded login credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@creditsea.com | Admin@123 |
| Sales | sales@creditsea.com | Sales@123 |
| Sanction | sanction@creditsea.com | Sanction@123 |
| Disbursement | disbursement@creditsea.com | Disburse@123 |
| Collection | collection@creditsea.com | Collect@123 |
| Borrower | borrower@creditsea.com | Borrow@123 |

---

## Project structure

```
creditsea-assignment/
├── client/                 # Next.js frontend
│   ├── app/                # Routes (/, /login, /signup, /eligibility-check, /dashboard)
│   ├── components/       # UI by domain (auth, borrower, dashboard, layout, motion)
│   ├── lib/                # API client, roles, nav, loan math
│   └── stores/             # Zustand auth state
├── server/                 # Express API
│   ├── src/
│   │   ├── controllers/    # HTTP handlers
│   │   ├── middleware/     # auth, RBAC, staff/borrower guards, upload
│   │   ├── models/         # User, Loan, Payment, Document
│   │   ├── routes/         # REST routes
│   │   ├── services/       # BRE, ops, loans, documents
│   │   └── scripts/seed.ts
│   └── uploads/            # Salary slip files (gitignored contents)
└── README.md
```

---

## Assignment coverage

| Requirement | Implementation |
|-------------|----------------|
| Borrower sign up / login | `/signup`, `/login` — bcrypt hashing, JWT |
| Personal details + BRE | `/eligibility-check` — server-side `bre.service.ts` |
| Salary slip upload | PDF/JPG/PNG, max 5 MB → `Document` model |
| Loan sliders + SI math | ₹50K–₹5L, 30–365 days, 12% p.a. — `SI = (P×R×T)/(365×100)` |
| Ops dashboard (4 modules) | `/dashboard` — Sales, Sanction, Disbursement, Collection |
| RBAC front + back | Nav guards + `authorize()` / `blockBorrowerFromOps` middleware |
| Seed script | `npm run seed` in `server/` |
| Loan lifecycle | APPLIED → SANCTIONED → DISBURSED → CLOSED (auto-close when fully paid) |

---

## API overview

| Area | Prefix | Notes |
|------|--------|-------|
| Auth | `/api/auth` | signup, login, me |
| Borrower | `/api/borrower` | profile, BRE, blocking loan |
| Documents | `/api/documents` | salary slip upload |
| Loans | `/api/loans` | borrower apply + status |
| Ops | `/api/ops` | role-scoped modules (403 if wrong role) |

**Auth:** `Authorization: Bearer <token>`

**Status codes:** `401` unauthenticated · `403` forbidden role · `400` validation · `409` duplicate PAN

---

## Design decisions (from implementation)

1. **BRE on server only** — Rules (age 23–50, salary ≥ ₹25,000, PAN regex, not unemployed) run in `bre.service.ts`. Client shows results; never trusts client for eligibility.

2. **PAN** — Regex `^[A-Z]{5}[0-9]{4}[A-Z]$`, unique sparse index, proactive 409 before save.

3. **Loan re-apply** — Blocked while a loan is APPLIED, SANCTIONED, or DISBURSED; allowed after REJECTED or CLOSED.

4. **Roles** — Enum on `User.role`; Admin bypasses module checks; borrowers blocked from `/api/ops`.

5. **HTTP semantics** — `401` no/invalid token; `403` wrong role; `409` duplicate PAN/UTR.

6. **BRE history** — `user.breHistory[]` for sales leads (field `failureReasons`, not `errors` — Mongoose reserved).

7. **Payments** — Unique UTR; amount capped to outstanding; auto-close when `totalPaid >= totalRepayment`.

8. **Auth UX** — Zustand + persisted token; profile menu with initials; password min 6 chars.

9. **Env & security** — `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` only on server; client uses `NEXT_PUBLIC_API_URL` (no secrets). `.env` files gitignored. CORS restricted to `CLIENT_ORIGIN`.

10. **UI** — Hero and `PageEntrance` use Framer Motion (staggered intro on each page load; route changes re-animate via `key={pathname}`). Primary actions use brand blue (`brand-600` / `blue-600`).

11. **Live sync** — Ops modules, borrower dashboard, and eligibility page poll the API every **8 seconds** while the tab is visible, and refetch on window focus / tab visibility. A “Live sync on · Last updated …” badge shows the last successful fetch. Implemented in `client/hooks/use-live-refresh.ts`.

---

## Role-by-role flows

### Borrower (signup → eligibility → dashboard)

1. **Sign up / log in** at `/signup` or `/login`. JWT stored in Zustand; staff users are redirected to `/dashboard`, borrowers to eligibility or dashboard as appropriate.
2. **Eligibility check** (`/eligibility-check`) — gated wizard:
   - **Personal details** → server runs BRE (`bre.service.ts`): age 23–50, salary ≥ ₹25,000, valid PAN, not unemployed. Failures append to `user.breHistory[]` with `failureReasons`.
   - **Salary slip** — PDF/JPG/PNG, max 5 MB, only after BRE passes.
   - **Loan config** — amount ₹50K–₹5L, tenure 30–365 days; SI interest shown client-side, persisted on apply.
3. **Apply** creates a loan in **APPLIED** status. Re-apply is blocked while any loan is APPLIED, SANCTIONED, or DISBURSED; allowed after **REJECTED** or **CLOSED**.
4. **Borrower dashboard** (`/dashboard` as borrower) shows `BorrowerLoanOverview`: status, amounts, sanction/reject notes, repayment progress when disbursed.

### Sales (`/dashboard` → Sales module)

Tracks **pre-sanction leads**: registered borrowers who have not yet reached a terminal loan state in ops queues, or are still in onboarding.

**Lead timeline** (built server-side in `sales-lead-timeline.ts`, rendered in `SalesLeadTimeline`):

| Step | ID | Meaning |
|------|-----|---------|
| 1 | `registered` | Account created (always done) |
| 2 | `bre` | Eligibility check — `current` if no attempts; `done` if passed; `failed` if attempts exist but not passed; expandable BRE attempt history |
| 3 | `salary-slip` | `upcoming` until BRE passes; `current` when BRE passed but no slip; `done` when uploaded |
| 4 | `loan-apply` | `upcoming` until BRE + slip; `current` when ready but no loan; `done` when applied (shows status); `failed` if latest loan is **REJECTED** |

Sales users **view only** — no approve/disburse actions. List refreshes live so new registrations and BRE outcomes appear without reload.

### Sanction (`/dashboard` → Sanction module)

- Queue: loans in **APPLIED** status.
- **Approve** → **SANCTIONED** (visible to Disbursement).
- **Reject** → **REJECTED** with required reason (borrower may re-apply later; Sales timeline shows failed loan step).

### Disbursement (`/dashboard` → Disbursement module)

- Queue: loans in **SANCTIONED** status.
- **Disburse** → **DISBURSED** (principal released; repayment tracking begins).

### Collection (`/dashboard` → Collection module)

- Queue: **DISBURSED** loans with outstanding balance.
- Select a loan → record payment (UTR, amount, date). UTR is unique; amount capped to outstanding.
- When `totalPaid >= totalRepayment`, loan auto-closes as **CLOSED**.
- Payment history for the selected loan refreshes with the queue.

### Admin (`/dashboard`)

- Sees **all four ops modules** (Sales, Sanction, Disbursement, Collection) via tab navigation in `dashboard-shell.tsx`.
- Same APIs as specialists; RBAC middleware allows Admin on every ops route.

### Loan lifecycle (system-wide)

```
APPLIED → SANCTIONED → DISBURSED → CLOSED
    ↘ REJECTED (terminal for that application; borrower may apply again later)
```

---

## Live data sync (frontend)

| Surface | Data refreshed | Mechanism |
|---------|----------------|-----------|
| Sales module | `GET /api/ops/sales/leads` | `useLiveRefresh` + silent reload |
| Sanction module | Sanction queue | same |
| Disbursement module | Disbursement queue | same |
| Collection module | Collection queue + selected loan payments | same |
| Borrower dashboard | `GET /api/borrower/profile` | same |
| Eligibility check | Borrower profile / blocking loan flags | same (when logged in as borrower) |

- **Interval:** 8 seconds (only when `document.visibilityState === "visible"`).
- **Triggers:** window `focus`, `visibilitychange` to visible.
- **UX:** Initial load shows a loading state; background polls use `syncing` and do not clear the UI. `LiveSyncBadge` shows last successful update time.

Optional: set poll interval via `useLiveRefresh(fn, { intervalMs: N })` per call site (default 8000).

---

## Environment variables

**Server** (`server/.env`):

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret (required) |
| `CLIENT_ORIGIN` | Allowed CORS origin (default `http://localhost:3000`) |

**Client** (`client/.env.local`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL (default `http://localhost:5000`) |

---

## Scripts

| Command | Where | Purpose |
|---------|-------|---------|
| `npm run dev` | server / client | Development |
| `npm run build` | server / client | Production build |
| `npm run seed` | server | Seed all roles |
| `npm start` | server | Run compiled API |

---

## License

ISC (assignment submission).
