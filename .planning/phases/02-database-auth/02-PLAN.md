# Phase 2: Database & Authentication Plan

## Objective
Implement the production-ready PostgreSQL database schema, migration scripts, constraints, Row-Level Security (RLS) policies, and authentication client layer. Ensure strict multi-tenant isolation and duplicate prevention at the database level before any frontend or API logic is wired up.

## Inputs
- `prompt.md` (#15 Database Design, #16 Indexing, #19 Authentication, #68 Phase 2)
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `docs/TESTING.md`

## Key Requirements & Gates
1. **Relational Schema:** Tables for `categories`, `reels`, `tags`, and `reel_tags`.
2. **Shortcode Uniqueness:** Constraint `UNIQUE (user_id, instagram_shortcode)` guarantees duplicate prevention per user.
3. **Cross-User Independence:** Different users CAN save the same shortcode independently without conflict.
4. **Row-Level Security (RLS):** All tables strictly isolate rows using `auth.uid() = user_id`.
5. **Mandatory Isolation Test:** Automated test verifying User A cannot read, update, or delete User B's reels.

---

## Execution Plan & Tasks

### Task 2.1: Production Migration Scripts
- **File:** `supabase/migrations/20261008000000_init_reelvault.sql`
- **Scope:**
  - Extensions: `uuid-ossp`, `pg_trgm`.
  - Tables: `categories`, `reels`, `tags`, `reel_tags`.
  - Constraints & Indexes.
  - RLS Policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

### Task 2.2: Database Types & Supabase Scaffolding
- **Files:**
  - `src/types/database.ts` (Full typed schema definitions)
  - `src/lib/supabase.ts` (Client initialization with environment validation)
  - `src/services/auth.ts` (Authentication helpers and session wrappers)

### Task 2.3: Environment & Config
- **Files:**
  - `.env.example` (Documents `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### Task 2.4: Mandatory Multi-Tenant Isolation & Duplicate Constraint Test
- **File:** `tests/isolation-and-constraints.test.ts`
- **Scope:**
  - Simulates User A and User B contexts.
  - Tests that User B cannot read User A's reels.
  - Tests that User B cannot update or delete User A's reels.
  - Tests that User A cannot save duplicate shortcode.
  - Tests that User B CAN save the same shortcode that User A already saved.

---

## Verification Protocol
1. SQL schema passes validation syntax.
2. TypeScript types strictly reflect the PostgreSQL schema without `any`.
3. Multi-tenant isolation test suite executes and passes.
4. Duplicate error handling verified.
