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
- Easily swap between local zero-dependency SQLite and remote PostgreSQL/LibSQL via environment variable `DATABASE_PATH`.
- Future-ready for Browser Extension / Share Sheet webhooks without changing core models.

## 5. Database Schema & Relational Integrity (DDL)

ReelVault uses native SQLite via `node:sqlite` (`DatabaseSync`) configured with Write-Ahead Logging (`PRAGMA journal_mode = WAL`), synchronized normal (`PRAGMA synchronous = NORMAL`), and strict foreign key enforcement (`PRAGMA foreign_keys = ON`).

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, slug)
);

-- 3. Reels Table
CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    instagram_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    instagram_shortcode TEXT NOT NULL,
    title TEXT,
    creator_username TEXT,
    thumbnail_url TEXT,
    notes TEXT,
    category_id TEXT,
    is_favorite INTEGER DEFAULT 0,
    is_watched INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    watched_at TEXT,
    archived_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_reel_shortcode UNIQUE (user_id, instagram_shortcode)
);

-- 4. Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL COLLATE NOCASE,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, name)
);

-- 5. Reel Tags Join Table
CREATE TABLE IF NOT EXISTS reel_tags (
    reel_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (reel_id, tag_id),
    FOREIGN KEY (reel_id) REFERENCES reels(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Composite Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reels_user_shortcode ON reels (user_id, instagram_shortcode);
CREATE INDEX IF NOT EXISTS idx_reels_user_created ON reels (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_archived ON reels (user_id, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_favorites ON reels (user_id, is_favorite, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_watched ON reels (user_id, is_watched, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_category ON reels (user_id, category_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_reel_tags_reel ON reel_tags (reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_tags_tag ON reel_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_name ON tags (user_id, name);
```

## 6. Authentication & Security Architecture

1. **Password Hashing**: Uses Node.js native `crypto.scrypt` with a cryptographically generated 16-byte random salt and 64-byte derived key. Verification uses constant-time `crypto.timingSafeEqual` to prevent timing attacks.
2. **Session Tokens**: JWT signed using HMAC-SHA256 with minimum 32-character key. Expiration defaults to 7 days.
3. **User Scoping & IDOR Prevention**: 100% of data reads, writes, updates, and deletes scope records using `WHERE user_id = ?` derived strictly from the verified JWT payload (`req.user.userId`). Client-supplied user identifiers are never trusted.
4. **Startup Validation**: In production (`NODE_ENV=production`), the application halts immediately on boot if `JWT_SECRET` is missing, default, or shorter than 32 characters.
5. **Anti-Bot & Abuse Protection**:
   - Hidden honeypot field (`website`) on public forms rejects bots with HTTP 400.
   - Strict rate limiting on authentication routes (30 requests per 15-minute window).
   - Global API rate limiting (600 requests per 15-minute window).

## 7. Locked Tech Stack & Dependency Audit

The tech stack is locked. **Rule: No new major dependency may be added without explicit owner approval and a written architectural justification.**

| Category | Package | Version | Purpose | Audit Status |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | TypeScript | `^5.7.3` | Type safety and domain contracts | Locked |
| **Runtime** | Node.js | `>=22.0.0` | Native ES modules, built-in SQLite & crypto | Locked |
| **Frontend Framework** | React | `^19.0.0` | Declarative UI and state management | Locked |
| **Frontend Framework** | React-DOM | `^19.0.0` | DOM rendering | Locked |
| **Frontend Bundler** | Vite | `^6.1.1` | Instant HMR and optimized production build | Locked |
| **Icons** | Lucide React | `^1.16.0` | Modern feather icon set | Locked |
| **Backend Framework** | Express | `^4.21.2` | REST API routing and middleware | Locked |
| **Security Headers** | Helmet | `^8.0.0` | CSP, HSTS, X-Frame-Options, nosniff | Locked |
| **CORS** | Cors | `^2.8.5` | Cross-origin request filtering | Locked |
| **Rate Limiting** | Express-Rate-Limit | `^7.5.0` | DoS and brute-force mitigation | Locked |
| **Auth** | JsonWebToken | `^9.0.2` | Stateless signed session verification | Locked |
| **Validation** | Zod | `^3.24.2` | Runtime schema validation for requests & env | Locked |
| **Database** | Node SQLite | Built-in | Zero-dependency synchronous SQLite persistence | Locked |

**Vulnerability Status**: `npm audit` reports **0 vulnerabilities** across all 205 packages.

## 8. Multi-Environment Matrix (Local vs Staging vs Production)

| Attribute | Local Development | Staging Environment | Production Environment |
| :--- | :--- | :--- | :--- |
| **`NODE_ENV`** | `development` | `staging` | `production` |
| **Base URL** | `http://localhost:4000` | `https://staging.reelvault.app` | `https://reelvault.app` |
| **Database** | `./data/reelvault.sqlite` | `./data/reelvault-staging.sqlite` | Persistent managed volume / Turso |
| **JWT Secret** | Dev default permitted | Isolated staging secret (>= 32 chars) | Dedicated production secret (>= 32 chars) |
| **Strict HTTPS** | Optional (HTTP permitted) | Enforced with HSTS | Enforced with HSTS and preload |
| **UI Indicator** | Development indicator active | Orange "STAGING" banner in header | Clean production header (no badge) |

## 9. Folder Layout & Architecture Boundaries

```
reelvault/
├── docs/                 # Authoritative project documentation (.md)
│   ├── ARCHITECTURE.md   # System architecture, locked stack, schema DDL
│   ├── BRAND.md          # Brand guidelines, tone of voice, copy standards
│   ├── DESIGN_SYSTEM.md  # Design tokens, typography, component styles
│   ├── PRD.md            # Product Requirements Document
│   └── TASKS.md          # Backlog and milestone task tracker
├── public/               # Public static assets, icons, manifest, sitemap
├── src/
│   ├── client/           # Frontend React 19 SPA
│   │   ├── components/   # Modular UI components (layout, legal, modals, reels, ui)
│   │   ├── services/     # API client and privacy analytics services
│   │   ├── styles/       # tokens.css (design tokens) and main.css
│   │   ├── App.tsx       # Root application controller and routing
│   │   └── main.tsx      # React entrypoint
│   ├── server/           # Backend Node.js / Express API
│   │   ├── config/       # Startup environment validation (env.ts)
│   │   ├── db/           # SQLite database connection and schema DDL
│   │   ├── middleware/   # Auth guard, error handler, Zod validators
│   │   ├── routes/       # Express route controllers
│   │   ├── services/     # Business logic layer
│   │   ├── utils/        # Crypto and Instagram URL normalizers
│   │   ├── app.ts        # Express application factory
│   │   └── index.ts      # Server entrypoint and graceful shutdown
│   └── types/            # Shared TypeScript domain contracts
└── tests/                # Automated test suites (unit, security, api, e2e)
```
