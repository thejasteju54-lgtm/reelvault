# PRODUCT REQUIREMENTS DOCUMENT: ReelVault

**Status:** Living Document • **Version:** 1.0.0 • **Last Updated:** October 2026

---

## 1. Executive Summary & Overview

ReelVault is a privacy-first, high-performance personal knowledge management workstation designed specifically for saving, categorizing, studying, and searching Instagram Reels. It provides a dedicated "second brain" that eliminates the chaotic practice of pasting video links into WhatsApp "Message Yourself", Apple Notes, Telegram, or losing them inside Instagram's native saved collections.

---

## 2. Core Value Proposition, User Pain, and ICP

### 2.1 Core Value Proposition
- **Sub-2-Second Capture:** Rapid bookmarking via automatic URL sanitization and clipboard detection.
- **Strict Data Integrity:** Canonical Instagram shortcode normalization and database-level duplicate prevention (`UNIQUE(user_id, instagram_shortcode)`).
- **Deep Personal Context:** Add research notes, custom categories, tags, and status tracking (Watched, Favorite, Archived) that Instagram's native interface lacks.
- **Frictionless Instagram Handoff:** Direct deep-linking to the native Instagram player on desktop and mobile without copyright-infringing downloads or fragile DOM scrapers.
- **Total Privacy & Zero Ads:** Zero behavioral tracking, zero algorithmic recommendation feeds, and zero video scraping overhead.

### 2.2 User Pain Points Solved
- **The "Lost Link" Problem:** Users discover technical tutorials or creative references on Instagram, copy the link to WhatsApp or Notes, where it is instantly buried under days of unrelated messages.
- **Instagram "Saved" Clutter:** Native Instagram saved collections lack full-text search across personal notes, custom multi-tag filtering, duplicate detection, or offline-accessible metadata export.
- **Algorithmic Distraction:** Opening Instagram to find a previously saved reel frequently traps the user in an algorithmic feed rabbit-hole. ReelVault allows finding the exact reference immediately.

### 2.3 Ideal Customer Profile (ICP)
- **Who [ASSUMPTION: confirm]:** Solo developers, content creators, fitness/nutrition enthusiasts, and visual researchers who actively consume 5+ educational/reference Instagram Reels daily.
- **Context:** Working across desktop browsers and mobile devices while doing research, coding, or content planning.
- **Current Alternatives:**
  - WhatsApp / Telegram "Message Yourself" (cluttered, zero categorization).
  - Apple Notes / Notion (slow to paste, poor mobile video preview, no duplicate detection).
  - Instagram Native Saved Folders (slow search, no custom markdown notes, algorithmic distractions).

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
| :--- | :--- | :--- |
| **Instant Capture Speed** | Time from paste to confirmation | < 500ms API response time |
| **Zero Duplicate Pollution** | Duplicate URL prevention | 100% duplicate catch rate via canonical shortcodes |
| **High Retrieval Efficiency** | Search latency across 1,000+ items | < 50ms multi-field query time |
| **Workstation Performance** | Mobile & Desktop Lighthouse scores | 90+ Performance, SEO, Best Practices, A11y |

---

## 4. User Stories

1. **Quick Save:** *As a developer discovering a code walkthrough on Instagram, I want to paste the reel link into ReelVault so that it is instantly cataloged with its canonical shortcode and thumbnail.*
2. **Contextual Tagging:** *As a creator saving visual hooks, I want to assign custom categories (e.g., "Hooks", "Motion Design") and tags (e.g., `#typography`) so that I can filter by topic later.*
3. **Duplicate Prevention:** *As a frequent researcher, I want ReelVault to alert me if I try to save a reel I already have, so that my ledger remains clean and organized.*
4. **Instant Search:** *As a user preparing a presentation, I want to type `/` and instantly search across titles, creator usernames, and personal notes.*
5. **Data Export:** *As a privacy-conscious user, I want to export my entire archive to JSON or CSV at any time with one click.*

---

## 5. Core Features & Workflows

### 5.1 QuickSave Engine
- Global keyboard shortcut: Press `N` anywhere in the app to focus the QuickSave input.
- Automatic Instagram tracking parameter stripping (`?utm_source=...`, `?igsh=...`).
- Resolution of `/reel/:id`, `/reels/:id`, and `/p/:id` to canonical URL.
- Immediate UI toast notification and input refocus for rapid batch saving.

### 5.2 Ledger & Workstation View
- Responsive grid and card layout with high-contrast archival typography.
- Status filters: All, Saved, Favorites, Archive, Tags.
- In-place status toggling: Favorite (Star), Watched, and Archive.

### 5.3 Detail & Metadata Editor
- Full modal view with editable title, creator handle, personal notes, and category selector.
- Tag management with automatic casing normalization and emoji/punctuation stripping.

### 5.4 Privacy & Compliance
- GDPR/CCPA compliant Privacy Policy (`/privacy`) and Terms of Service (`/terms`).
- Granular Cookie Consent banner with zero telemetry emission until user opt-in.
- User data export (`/api/export`) supporting CSV and JSON formats.

---

## 6. What We Will NOT Build (Out of Scope)

The following features and integrations are explicitly excluded from ReelVault:

1. **Video File Downloading / Local Video Player:**  
   *Reason:* Excluded due to video storage infrastructure costs, copyright liability, and Instagram Terms of Service compliance.
2. **Social Feed / Public Follower Network:**  
   *Reason:* Excluded to preserve the distraction-free, single-player archival utility. ReelVault is a productivity vault, not a social media app.
3. **Automated TikTok / YouTube Shorts Ingestion:**  
   *Reason:* Excluded in v1.0 to maintain focus and parser reliability on Instagram shortcodes.
4. **AI Video Transcription / Speech-to-Text:**  
   *Reason:* Excluded in v1.0 to keep operational costs zero and eliminate external AI API dependencies.
5. **Third-Party Advertising & Monetization Trackers:**  
   *Reason:* Excluded to maintain an ethical, privacy-first user contract.

---

## 7. Technical Constraints & Non-Functional Requirements

- **Zero-Dependency Core Database:** Relies on Node.js built-in `node:sqlite` for zero-install, zero-cost operation.
- **Zero Framework CSS:** Built purely with Vanilla CSS and custom tokens for sub-10kB stylesheet weight.
- **Security:** Strict CSP, HSTS, frame protection (`DENY`), and scrypt password hashing.
- **Cross-Platform Accessibility:** Fully responsive down to 360px viewport with minimum 48x48px tap targets.

---

## 8. Open Questions & Roadmap Inferences

- **Browser Extension [ASSUMPTION: confirm]:** A lightweight Chrome/Safari extension to save reels with 1 click from the Instagram website is the most requested future feature.
- **Mobile Share Sheet [ASSUMPTION: confirm]:** An iOS Shortcut / Android Share Sheet webhook for 1-tap mobile saving.
- **Self-Hosting vs Multi-Tenant Cloud [ASSUMPTION: confirm]:** Current architecture supports both self-hosted Docker and serverless Vercel deployments.
