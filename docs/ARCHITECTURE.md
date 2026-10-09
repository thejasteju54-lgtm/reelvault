# System Architecture: ReelVault

## 1. Architectural Overview

ReelVault is designed as a minimalist, high-performance web platform that acts as a personal "second brain" for Instagram Reels. The architecture enforces separation of concerns, multi-tenant data isolation, strict input validation, and resilient offline/optimistic updates.

### High-Level Topology

```mermaid
graph TD
    Client["Client (React / TypeScript / Vite / Tailwind or Clean CSS)"]
    Auth["Supabase Auth / Session Layer (JWT)"]
    API["Backend / Edge API Layer"]
    DB[("PostgreSQL Database (RLS Enforced)")]
    IG["Instagram (External Resource)"]

    Client -->|1. Authenticate| Auth
    Client -->|2. REST Requests + Bearer JWT| API
    API -->|3. Scoped Queries (user_id)| DB
    Client -.->|Direct Canonical Redirection| IG
    API -.->|Optional Meta Scraping (Resilient/Fallback)| IG
```

---

## 2. Component Responsibilities & Boundaries

### A. Client Responsibilities
- **UI & Micro-interactions:** Rapid bookmarking input, optimistic toggles (favorites, watch status), responsive layout (desktop sidebar, mobile bottom nav).
- **Client-Side Validation (UX Only):** Regex pre-validation on URL format to give instant typing feedback (never trusted for security).
- **Navigation & Deep Linking:** Filter states, search term debounce, category switching.
- **Instagram Launching:** Reliable external tab redirection to canonical Instagram URLs (`https://www.instagram.com/reel/<shortcode>/`).
- **State & Cache Management:** Cache queries with immediate cache invalidation on mutations; optimistic rollbacks on failure.

### B. Server / API Responsibilities
- **Authentication & Identity Scoping:** Validate JWT signature and claims on every incoming request. Extract `user_id` strictly from verified session claims.
- **URL Normalization & Canonicalization:** Parse, strip tracking parameters (`utm_*`, `igsh`, `fbclid`), extract canonical `shortcode`.
- **Duplicate Detection & Conflict Handling:** Intercept duplicates gracefully; return HTTP 409 Conflict with informative payload or restore if previously archived/trashed.
- **Safe Metadata Enrichment (Non-blocking):** Best-effort oEmbed/OG-meta fetching; save operations must **never** fail if metadata scraping times out or is throttled.
- **Data Scrubbing & Sanitization:** Sanitize notes and titles to prevent stored XSS; sanitize user tags.
- **Error Sanitization:** Never leak database internals, stack traces, or credentials to the client.

### C. Database Responsibilities (PostgreSQL)
- **Data Integrity & Relational Rules:** Foreign keys, cascade deletions for tags/associations, non-nullable constraints.
- **Row-Level Security (RLS):** Ensure policies enforce `user_id = auth.uid()` on every `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- **Uniqueness Guarantee:** Enforce composite unique index `UNIQUE(user_id, instagram_shortcode)`.
- **Query Optimization & Search:** Indexes on `(user_id, created_at DESC)`, `(user_id, is_favorite)`, `(user_id, is_watched)`, `(user_id, is_archived)`, and GIN trgm/FTS index on `(title, notes)`.

---

## 3. Trust Boundaries

```
[ UNTRUSTED ZONE ] 
  Browser / Client DOM / External HTTP inputs / Raw Instagram URLs
───────────────────────────── Boundary 1: API Input Validation & Auth Guard ─────────────────────────────
[ SEMI-TRUSTED ZONE ] 
  API Request Context (Authenticated User ID verified from JWT)
───────────────────────────── Boundary 2: Parametrized DB Calls & RLS ─────────────────────────────────────
[ TRUSTED ZONE ] 
  PostgreSQL Engine, RLS Policies, Service Secrets, Encrypted Backups
```

1. **Client is Untrusted:** Any field sent in the payload (including `user_id`, timestamps, URL formats) is validated server-side.
2. **Metadata Fetching is Isolated:** External HTTP calls to Instagram are executed with strict timeouts (<= 3s) and cannot stall the database transaction.
3. **Multi-tenant Isolation:** Even if an API handler has a bug, database RLS rules forbid accessing any row where `user_id != auth.uid()`.
