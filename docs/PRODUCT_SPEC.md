# PRODUCT SPECIFICATION: ReelVault

## 1. Executive Summary
**ReelVault** is a minimalist personal platform designed as an actionable "second brain" specifically for Instagram Reels. It provides a frictionless capture, organization, and retrieval system that completely eliminates the fragmentation of pasting links into WhatsApp, notes apps, or Telegram.

## 2. Core Value Proposition
- **Lightning Fast Capture:** Save any Instagram Reel in under 2 seconds. Direct clipboard detection and auto-focus for batch saving.
- **Strict Data Integrity:** Canonical URL normalization, Instagram shortcode extraction, and database-level duplicate prevention (`UNIQUE(user_id, instagram_shortcode)`).
- **Personal Knowledge Management:** Add personal context (notes, custom categories, tags, watched status, importance/favorite).
- **Instant Retrieval:** High-performance server-side multi-field search and composable filtering.
- **Direct Instagram Handoff:** Frictionless "Open on Instagram" deep-link opening without scraping fragility or unauthorized video downloading.

## 3. User Personas
1. **The Lifelong Learner / Developer:** Saves tutorials, coding snippets, tech insights, and AI developments to review and execute later.
2. **The Content Creator & Researcher:** Saves visual inspiration, hooks, and trend analyses organized by concept.
3. **The Productivity / Fitness Enthusiast:** Collects workout regimens, recipes, and productivity tips to revisit during appropriate routines.

## 4. Key Workflows
### 4.1 Quick Save Flow
1. User copies Instagram Reel URL: `https://www.instagram.com/reel/C3_aBcDeF/?utm_source=ig_web_copy_link`.
2. User opens ReelVault dashboard.
3. User pastes URL into primary Quick Save input (or clipboard auto-populates).
4. System validates URL pattern, sanitizes, normalizes, extracts shortcode `C3_aBcDeF`.
5. System checks for duplicate in user vault:
   - If new: creates record with default title, optional user-supplied tags/category, returns `201 Created`.
   - If duplicate: returns `409 Conflict` with clear message: *"This Reel is already in your vault"* and provides direct link to the saved item.
6. Input field clears and re-focuses immediately for rapid repeated saving. Subtle non-intrusive toast confirms save.

### 4.2 Retrieval & Organization Flow
1. User views dashboard: Summary counters (Total Saved, Favorites, Unwatched, Archived).
2. Filter by status: All, Unwatched, Watched, Favorites, Archived.
3. Filter by Category (e.g., Coding, AI, Productivity) and Tags (e.g., #python, #fullstack).
4. Instant search across Title, Creator, Notes, and Tags.
5. Quick inline toggles: Star as Favorite, Mark as Watched/Unwatched, Archive/Restore.

### 4.3 Action & Handoff
1. Single click on "Open on Instagram" opens the canonical Instagram Reel in a new tab (desktop) or triggers Instagram app handoff (mobile).

## 5. Non-Goals & Architectural Boundaries
- **No Video Downloading:** ReelVault stores metadata and bookmarks; it is not a media downloader or pirate mirror.
- **No Fragile Scraping:** Relies on resilient fallback metadata rather than fragile DOM scraping that breaks under Instagram anti-bot measures.
- **No Bloat:** No social feeds, no algorithmic recommendations, no complex AI overhead. Pure focused utility.
