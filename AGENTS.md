# AGENTS.md: Project Rules & Operational Instructions for Antigravity

Welcome to **ReelVault**. This document defines the engineering standards, operational constraints, and workflow rules that all AI agents must follow when working in this codebase.

---

## 1. Project Summary & Tech Stack

ReelVault is a minimalist, privacy-first personal "second brain" designed specifically for bookmarking, organizing, categorizing, and searching Instagram Reels without downloading video files or relying on fragile scrapers.

- **Frontend**: React 19 SPA, Vite 6, TypeScript 5.7, Lucide React, Custom CSS Tokens (Vanilla CSS, zero Tailwind).
- **Backend**: Node.js 22+, Express 4.21, Helmet 8, CORS, Express-Rate-Limit, Zod, JsonWebToken.
- **Database**: Native SQLite via Node.js built-in `node:sqlite` (`DatabaseSync`), WAL journal mode, explicit foreign keys.
- **Testing**: Native Node.js Test Runner (`node:test`, `node:assert/strict`) via `tsx`.
- **Hosting**: Dual-compatible (Vercel Serverless `/api/*` + static SPA output, or consolidated Node.js server).

---

## 2. Directory Structure & Architecture Boundaries

```
reelvault/
├── docs/                 # Authoritative documentation (PRD, ARCHITECTURE, BRAND, TASKS, DESIGN_SYSTEM)
├── public/               # Static assets, web manifest, icons, robots.txt, sitemap.xml
├── src/
│   ├── client/           # React 19 SPA frontend (components, services, styles)
│   ├── server/           # Express API backend (config, db, middleware, routes, services, utils)
│   └── types/            # Shared TypeScript domain contracts
├── tests/                # Automated test suites (unit, security, api, e2e)
├── AGENTS.md             # This file (Agent operating instructions)
└── GEMINI.md             # Mirror of AGENTS.md for compatibility
```

- **Boundary Rule**: Server logic, database queries, and private tokens must **never** leak into `src/client/`.
- **Component Reuse**: Reuse existing components in `src/client/components/ui/` and layout before creating new ones.

---

## 3. Essential Commands

```bash
# Development (concurrent client on 5173 + server on 4000)
npm run dev

# Full Production Build (Client Vite bundle + Server TypeScript build)
npm run build

# Start Production Server (serves API + SPA)
npm start

# Automated Test Suite (runs unit, security, API, E2E suites)
npm test

# Client Type Check (zero errors required)
npx tsc --noEmit
```

---

## 4. Coding & Design Conventions

1. **Design Tokens First**: Always use variables from `src/client/styles/tokens.css` (`var(--color-primary)`, `var(--bg-app)`, `var(--space-4)`, `var(--radius)`). Never introduce raw, hardcoded hex colors or arbitrary pixel margins in components.
2. **Typography**: Headings and body use `Plus Jakarta Sans` (`var(--font-sans)`). Metadata, shortcodes, and stats use `JetBrains Mono` (`var(--font-mono)`).
3. **No Decorative Gradients**: Maintain the archival utilitarian aesthetic (flat terracotta `#c84b31`, bone `#f7f6f2`, soot `#131312`).
4. **Zero Trust & Input Validation**: Every endpoint must validate input payloads with Zod schemas. Never trust client IDs; derive `user_id` strictly from JWT session tokens.
5. **No Em Dashes**: Never use em dashes (`—`) in user-facing copy or documentation. Use standard colons, commas, or spaced hyphens (` - `).

---

## 5. Security Guardrails

- **Zero Secrets**: Never print, commit, or log real API keys, tokens, or credentials. Always use environment variables.
- **Fail-Fast Boot**: The server must refuse to boot in production if `JWT_SECRET` is missing, default, or under 32 characters.
- **Spam & Abuse Protection**: All public forms must include honeypot fields (`website`) and strict rate limiting.
- **Sanitized Outputs**: Never render unsanitized user content with `dangerouslySetInnerHTML`.

---

## 6. What We Will NOT Build (Out of Scope)

The agent must **refuse** to implement any feature on this list without explicit, prior user approval:

1. **Video File Downloader / Local Player**: Excluded due to copyright liability, bandwidth costs, and Instagram TOS restrictions.
2. **Social Feed / Public Follower Network**: Excluded to avoid feed addiction and retain single-player archival focus.
3. **Automated TikTok / YouTube Shorts Ingestion**: Excluded in v1.0 to preserve shortcode parser integrity.
4. **AI Video Transcription / Whisper Integration**: Excluded in v1.0 to eliminate high external API costs.
5. **Third-Party Behavioral Tracking**: Excluded to maintain strict privacy-first compliance.

---

## 7. Standing Instructions for Every Session (Phase 4 Maintenance)

1. **Session Start**: Read `docs/PRD.md`, `docs/TASKS.md`, and `docs/ARCHITECTURE.md` before planning or writing code.
2. **Feature Mapping**: Before implementing any feature, verify it maps to a task in `docs/TASKS.md` and is not on the "do NOT build" list.
3. **Task Completion**: After completing work, update the task status to `[done]` in `docs/TASKS.md`, run `npm test` and `npm run build`, and propose a Conventional Commit.
4. **Configuration Sync**: When adding an environment variable, update `.env.example`, `src/server/config/env.ts`, and `README.md` in the exact same change.
5. **Architecture Sync**: When adding dependencies or altering schemas, update `docs/ARCHITECTURE.md` and `docs/DATABASE.md`.
6. **Session Close**: At the conclusion of each session, provide a brief "Project Health" summary (test status, doc sync status, uncommitted changes, open risks).
