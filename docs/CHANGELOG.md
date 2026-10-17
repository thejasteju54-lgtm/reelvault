# CHANGELOG: ReelVault

All notable changes to ReelVault will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.2] - 2026-10-17

### Fixed
- **Vercel Serverless Rewrite Routing & Schema Compliance**:
  - Corrected `vercel.json` rewrites to map `/api/(.*)` to `/api/index?__rv_path=$1`, eliminating HTTP 405 Method Not Allowed caused by requests falling through to static `index.html`.
  - Removed unsupported `runtime: "nodejs22.x"` from `vercel.json` functions block to adhere to Vercel schema specifications and prevent deployment build failures (relying on `package.json` `engines.node` specification).
  - Robust URL path reconstruction in `api/index.ts` to safely extract sub-path parameters and reverse-proxy forwarded URIs, preventing route loss.
  - Hardened database initialization in `src/server/db/database.ts` with unconditional `/tmp/reelvault.sqlite` targeting in serverless runtimes and a graceful `:memory:` fallback.
  - Sanitized API response parsing and modal error displays in `src/client/services/api.ts` and `src/client/components/modals/AuthModal.tsx` to prevent technical JSON syntax errors from leaking to users.

## [1.1.1] - 2026-10-15

### Fixed
- **Vercel Serverless Function & Registration Failure**:
  - Resolved cold-start failure on Vercel caused by missing production `JWT_SECRET` environment variable with safe serverless fallback.
  - Pinned `node: 22.x` engine in `package.json` and explicit `nodejs22.x` runtime configuration in `vercel.json` for native `node:sqlite` execution.
  - Guaranteed `/tmp/reelvault.sqlite` database path in serverless execution to prevent read-only filesystem errors.
  - Preserved incoming request path in `api/index.ts` across Vercel rewrite headers (`x-matched-path`).
  - Hardened frontend API client with defensive response parsing to cleanly handle non-JSON responses without unhandled syntax errors.

## [1.1.0] - 2026-10-15

### Added
- **Visual Cover Images & Video Frames**:
  - Full support for custom high-resolution cover image URLs when saving and editing reels.
  - Interactive 1-click Instagram video frame player embeds directly inside cards and the detail modal.
  - View mode switcher in FilterBar between compact "Card View" and "Live Frames" mode across the entire dashboard.
  - Category-accented archival poster fallbacks when no custom cover image is assigned.
  - Updated Helmet Content Security Policy with `frame-src` for `instagram.com` to allow official embed players.
  - Unit and API test assertions for cover image creation and updates.

## [1.0.0] - 2026-10-09

### Added
- **Core Archival Workstation**: Lightning-fast Instagram Reel capture engine with shortcode extraction and query tracking parameter stripping.
- **Data Persistence**: SQLite database schema with WAL mode, foreign keys, and unique constraint on `(user_id, instagram_shortcode)`.
- **User Authentication**: Secure scrypt password hashing with cryptographically unique salts, constant-time verification, and 7-day signed JWT session tokens.
- **Organization & Metadata**: Custom categories with color tags, multi-tag association, personal notes editor, and in-place status toggles (Watched, Favorite, Archive).
- **Multi-Format Export**: Full vault export to CSV and JSON formats.
- **Archival Design System**: Hand-crafted terracotta (`#c84b31`), bone (`#f7f6f2`), and soot (`#131312`) design tokens with zero gradients and high-contrast WCAG AA typography.
- **Pre-Launch Hardening**:
  - Comprehensive Helmet security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
  - Reverse proxy force-HTTPS 301 redirection.
  - Hidden honeypot field (`website`) and strict authentication rate limiting.
  - Tailored GDPR/CCPA Privacy Policy (`/privacy`) and Terms of Service (`/terms`).
  - Granular cookie consent banner suppressing telemetry until explicit opt-in.
  - SEO suite: `sitemap.xml`, `robots.txt`, `site.webmanifest`, `favicon.svg`, `og-preview.png`.
  - Custom 404 page returning real HTTP 404 status.
- **Operational Foundation & Agent Governance**:
  - Fail-fast startup environment validation (`src/server/config/env.ts`).
  - Authoritative project documentation: `PRD.md`, `BRAND.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `TASKS.md`, `CONTRIBUTING.md`.
  - Antigravity agent rules file (`AGENTS.md`) and workflows (`/review`, `/commit`, `/release-check`).
  - GitHub Actions automated CI workflow (`.github/workflows/ci.yml`).
  - Structured PII-scrubbed error logging (`logger.ts`).
