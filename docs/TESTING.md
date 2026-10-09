# TESTING STRATEGY & TEST PLAN: ReelVault

## 1. Testing Hierarchy

### 1.1 Unit Tests (`npm run test:unit`)
- **URL Normalizer & Validator:**
  - Standard Instagram Reel: `https://www.instagram.com/reel/C3_aBcDeF/` -> `C3_aBcDeF`.
  - With query parameters & tracking: `https://www.instagram.com/reel/C3_aBcDeF/?utm_source=ig_web_copy_link&igsh=123` -> `C3_aBcDeF`.
  - Mobile short URL / alternate formats: `https://instagram.com/reel/C3_aBcDeF/` and `/reels/C3_aBcDeF/`.
  - Instagram post format: `https://www.instagram.com/p/C3_aBcDeF/`.
  - Malicious inputs rejected:
    - `javascript:alert('xss')`
    - `data:text/html,...`
    - `https://evil-phishing-instagram.com/reel/xyz`
    - Empty, truncated, or non-Instagram URLs.
- **Tag Normalizer:**
  - Normalizes `' Python '` -> `'python'`.
  - Normalizes `'#MachineLearning'` -> `'machinelearning'`.
  - Rejects oversized tags, empty tags, or invalid symbols.

### 1.2 Integration & API Tests (`npm run test:api`)
- **Authentication Lifecycle:**
  - Register new account with valid credentials (201).
  - Reject duplicate email registration (409).
  - Login with valid credentials and receive signed JWT (200).
  - Reject invalid password (401).
- **Core Reel Endpoints:**
  - `POST /api/reels`: Saves new reel with tags and category (201).
  - `POST /api/reels` Duplicate: Attempts saving same reel, asserts 409 Conflict.
  - `GET /api/reels`: Asserts correct pagination structure and total count.
  - `POST /api/reels/:id/favorite`: Toggles favorite state.
  - `POST /api/reels/:id/watched`: Toggles watched state with timestamp.
  - `POST /api/reels/:id/archive`: Archives reel, verifies absence from standard list.
- **Security & IDOR Isolation Test:**
  - Create User 1 and User 2.
  - User 1 saves Reel X.
  - User 2 attempts `GET /api/reels/:id` for Reel X -> must return 404/403.
  - User 2 attempts `PATCH /api/reels/:id` for Reel X -> must return 404/403.
  - User 2 attempts `DELETE /api/reels/:id` for Reel X -> must return 404/403.
  - User 2 saving same Reel X shortcode -> succeeds (per-user vault isolation).
- **Search & Filtering:**
  - Query by keyword (`q=machinelearning`).
  - Filter by category and watch status.
  - Verify sort orders (`newest`, `oldest`, `alphabetical`).

### 1.3 End-to-End Workflow & UI Verification
- Browser subagent verification:
  - User signup and login.
  - Quick save submission and immediate list render.
  - Keyboard navigation ('N', '/', 'Esc').
  - Mobile viewport responsiveness (375px, 768px, 1280px).
