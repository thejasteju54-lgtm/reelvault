# SYSTEM ARCHITECTURE: ReelVault

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  [ Modern React 19 + TypeScript + Vite SPA ]                                     |
|  - Minimalist Linear/Raycast-Inspired UI (Custom Design Tokens, Vanilla CSS)       |
|  - Keyboard Shortcut Engine ('N' save, '/' search, 'Esc' close, 'Cmd+K' command)  |
|  - State Management: TanStack Query / React Query Pattern + Optimistic Updates    |
|  - Responsive Mobile Navigation & Quick-Save Clipboard Listener                   |
+-----------------------------------------------------------------------------------+
                                        |  HTTPS / JSON API
                                        |  JWT / Session Bearer Auth
                                        v
+-----------------------------------------------------------------------------------+
|                             API & BACKEND LAYER                                   |
|                                                                                   |
|  [ Node.js + Express + TypeScript Core ]                                          |
|  - Security Middleware: Helmet, CORS, Rate-Limiting, JSON parser limits           |
|  - Request Validation: Zod Schemas for all Inputs & Params                        |
|  - Instagram Engine: Regex Validator, URL Normalizer, Shortcode Extractor         |
|  - Authentication & Auth Guard: User Scoping on 100% of queries                   |
|  - Structured Logging & Centralized Error Handler                                 |
+-----------------------------------------------------------------------------------+
                                        |  Prepared Statements / Transactions
                                        v
+-----------------------------------------------------------------------------------+
|                              PERSISTENCE LAYER                                    |
|                                                                                   |
|  [ Relational Database: SQLite (Native node:sqlite) / PostgreSQL / Supabase ]    |
|  - Normalized Tables: users, reels, categories, tags, reel_tags                   |
|  - Hard Unique Constraint: UNIQUE(user_id, instagram_shortcode)                   |
|  - Composite Performance Indexes for filtering, sorting, and cursor pagination    |
|  - Atomic Transactions for Reel + Tag association operations                      |
+-----------------------------------------------------------------------------------+
```

## 2. Component Responsibilities & Boundaries

### 2.1 Client Responsibilities
- URL syntax pre-checking (client-side instantaneous feedback).
- Rapid keyboard event routing.
- Responsive mobile & desktop layout rendering without shift (CLS = 0).
- Safe external redirection to Instagram (`rel="noopener noreferrer"`).
- Optimistic UI state updates for toggle actions (Favorite, Watched, Archive).

### 2.2 Server Responsibilities
- **Zero Trust:** Re-validates every URL, payload, and parameter via Zod schemas.
- **Shortcode & Canonicalization Engine:** Resolves tracking parameters, validates legitimate Instagram domains (`instagram.com`, `www.instagram.com`, `instagr.am`), extracts valid base64url/alphanumeric shortcodes.
- **User Scoping:** Injects `user_id` strictly from authenticated session token. Never trusts client-supplied user identifiers.
- **Transaction Safety:** Wraps reel creation and tag link creation inside ACID transactions.

### 2.3 Database Responsibilities
- Enforces strict foreign keys (`ON DELETE CASCADE` where appropriate).
- Prevents duplicates via `UNIQUE(user_id, instagram_shortcode)`.
- Accelerates filtered query execution through composite indices (`user_id`, `is_archived`, `is_favorite`, `created_at`).

## 3. URL Normalization Pipeline
1. **Input:** `https://www.instagram.com/reel/C3_aBcDeF/?utm_source=ig_web_copy_link&igsh=XYZ`
2. **Protocol & Host Verification:** Must match `http://` or `https://` and hostname `instagram.com` or `*.instagram.com`. Reject any `javascript:`, `data:`, or external URLs.
3. **Path Pattern Matching:** Matches `/reel/:shortcode`, `/reels/:shortcode`, or `/p/:shortcode`.
4. **Shortcode Extraction:** Extracts canonical shortcode (e.g., `C3_aBcDeF`).
5. **Canonical URL Construction:** Standardizes to `https://www.instagram.com/reel/C3_aBcDeF/`.
6. **Integrity Guard:** Uniqueness enforced on `(user_id, shortcode)`.

## 4. Scalability & Extensibility
- Clean repository pattern decouples HTTP routes from persistence.
- Easily swap between local zero-dependency SQLite and remote PostgreSQL/Supabase via environment variable `DATABASE_URL` / `SUPABASE_URL`.
- Future-ready for Browser Extension / Share Sheet webhooks without changing core models.
