# TASKS & BACKLOG: ReelVault

**Status:** Living Task Backlog • **Last Updated:** October 2026

This document maps all deliverables to verifiable tasks. When tasks finish, agents update their status to `[done]` with commit references.

---

## Milestone 1: Core Archival Ledger (MVP) • Completed

| Task ID | Title | Description | Acceptance Criteria | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **M1-01** | URL Sanitizer & Parser | Instagram URL cleaner & shortcode extractor | Strips tracking queries; matches `/reel/`, `/p/`; rejects bad hosts | None | `[done]` |
| **M1-02** | Database Schema & DDL | SQLite persistence tables with indexes | Foreign keys with cascade; unique `(user_id, shortcode)`; WAL mode | None | `[done]` |
| **M1-03** | Auth Service & JWT | scrypt hashing and session token verification | Constant-time password check; 7-day signed JWT; IDOR isolation | M1-02 | `[done]` |
| **M1-04** | Reels API Endpoints | REST CRUD for reels and ledger queries | Save, Duplicate 409 check, list with filter/search, detail update, delete | M1-02, M1-03 | `[done]` |
| **M1-05** | Category & Tag Models | Organization endpoints and seed categories | Default starter categories; normalized lower-case tags; cascade cleanup | M1-02 | `[done]` |
| **M1-06** | Vault Stats & Export | Analytics counters and CSV/JSON export | Export JSON & CSV; calculate total, favorite, watched, and category stats | M1-04 | `[done]` |
| **M1-07** | UI Workstation Design | Hand-crafted terracotta UI with design tokens | `tokens.css`, `main.css`, dark/light theme, zero gradients | None | `[done]` |
| **M1-08** | QuickSave Input Bar | Global `N` key shortcut and rapid batch save | Clipboard paste detection, inline validation, instant toast feedback | M1-04, M1-07 | `[done]` |
| **M1-09** | Ledger Grid & Reel Card | Filterable card view with inline toggles | Favorite, Watched, and Archive quick toggles; lazy image preview | M1-04, M1-07 | `[done]` |
| **M1-10** | Metadata Detail Modal | Deep edit view for notes, tags, category | In-place editing; tag adder; "Open on Instagram" deep link | M1-04, M1-07 | `[done]` |

---

## Milestone 2: Pre-Launch Hardening & Compliance • Completed

| Task ID | Title | Description | Acceptance Criteria | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **M2-01** | Force HTTPS & Headers | Helmet security headers & reverse proxy redirect | HSTS `31536000`, CSP, `X-Frame-Options: DENY`, `nosniff`, 301 redirect | M1-04 | `[done]` |
| **M2-02** | Spam & Honeypot Guard | Anti-bot field and strict authentication rate limiter | Hidden `website` field rejects bots; 30 req / 15 min auth limit | M1-03 | `[done]` |
| **M2-03** | Privacy Policy (`/privacy`) | GDPR/CCPA privacy policy tailored to real site data | Explains scrypt, no ads, data retention, contact email; legal draft note | M1-07 | `[done]` |
| **M2-04** | Terms of Service (`/terms`) | Terms tailored to personal archival bookmarking | Fair use, Instagram terms compatibility, legal draft disclaimer | M1-07 | `[done]` |
| **M2-05** | Cookie Consent Banner | Opt-in cookie banner suppressing telemetry | No telemetry fires until Accept; Manage Cookies in sidebar footer | M2-03 | `[done]` |
| **M2-06** | SEO & Social Assets | Meta tags, Open Graph (1200x630), Favicons | `og-preview.png`, `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest` | None | `[done]` |
| **M2-07** | Sitemap & Robots | Crawl index and API protection | `sitemap.xml` with public routes; `robots.txt` disallows `/api/` | None | `[done]` |
| **M2-08** | Custom 404 Routing | SPA 404 page returning real HTTP 404 status | `/404` returns 404 HTTP status; `/api/*` returns JSON 404 | M1-04 | `[done]` |

---

## Milestone 3: Operational Foundation & Agent Governance • In Progress

| Task ID | Title | Description | Acceptance Criteria | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **M3-01** | Startup Env Validation | Fail-fast boot validator with strict production guard | Halts boot if `JWT_SECRET` is missing/default in production | M1-03 | `[done]` |
| **M3-02** | Agent Governance Rules | Create `AGENTS.md` and `GEMINI.md` rules | Contains stack, commands, out-of-scope boundaries, docs-sync rule | None | `[done]` |
| **M3-03** | Agent Workflows | Reusable workflow commands in `.agents/workflows/` | `/review`, `/commit`, `/release-check` workflows documented | M3-02 | `[done]` |
| **M3-04** | Foundational PRD | Author authoritative `docs/PRD.md` | Covers ICP, user pain, value prop, metrics, out-of-scope list | None | `[done]` |
| **M3-05** | Brand Guidelines | Author authoritative `docs/BRAND.md` | Documents voice, tokens, dos and don'ts, typography | M1-07 | `[done]` |
| **M3-06** | Design System Doc | Author authoritative `docs/DESIGN_SYSTEM.md` | Catalog design tokens, button states, touch targets, modal rules | M1-07 | `[done]` |
| **M3-07** | GitHub Actions CI | Automated CI pipeline (`.github/workflows/ci.yml`) | Runs build, type check, and tests on push and PR to `main` | None | `[done]` |
| **M3-08** | Pluggable Error Tracker | Error logging and tracking abstraction | Scrubs PII; environment tagging; optional Sentry hook | M1-04 | `[done]` |
| **M3-09** | Release Checklist | `docs/RELEASE_CHECKLIST.md` & `docs/CHANGELOG.md` | Pre-flight release verification guide and version changelog | M3-07 | `[done]` |
| **M3-10** | Cover Images & Video Frames | Visual card covers and live Instagram embed players | Custom thumbnail URL, live frame toggle, card view mode | M1-09, M1-10 | `[done]` |
| **M3-11** | Vercel Serverless Hardening | Serverless routing, runtime & parser fix | Rewrite query mapping, schema compliance, /tmp db fallback, sanitized error banner | M3-01 | `[done]` |

---

## Milestone 4: Cloud Extensions & Integrations • Roadmap

| Task ID | Title | Description | Acceptance Criteria | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **M4-01** | Chrome Extension | 1-Click bookmark button on Instagram web | Injects extension icon; calls ReelVault API with session token | M1-04 | `[todo]` |
| **M4-02** | iOS Shortcut Webhook | Mobile share sheet endpoint | Ingests incoming Instagram share sheet payload with bearer token | M1-04 | `[todo]` |
| **M4-03** | LibSQL / Turso Driver | Multi-region distributed database connector | Configurable via `DATABASE_URL` for serverless state persistence | M1-02 | `[todo]` |
| **M4-04** | Batch URL Ingestion | Bulk paste and CSV import | Bulk save modal with progress bar and duplicate reporting | M1-04 | `[todo]` |
