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

10. **UI** — `PageEntrance` (Framer Motion): subtle fade-up on first visit per route per session. Primary actions use brand blue (`brand-600` / `blue-600`).

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
