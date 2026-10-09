# Testing Strategy & Quality Assurance: ReelVault

## 1. Testing Philosophy
ReelVault implements a test-first and continuous verification methodology. Features must be validated across unit, integration, database isolation, and end-to-end layers before being considered complete.

---

## 2. Testing Pyramid

### Level 1: Unit Tests
Focuses on pure functions, validators, and normalization algorithms:
- **URL Normalizer:** Tests parsing of standard reel URLs, trailing slashes, share parameters (`utm_*`, `igsh`), mobile web URLs, and rejection of invalid URLs.
- **Shortcode Extractor:** Tests extraction of shortcodes from `/reel/ABC/`, `/reels/ABC/`, and `/p/ABC/`.
- **Payload Schema Validators:** Tests Zod validation schemas for required fields, string length constraints, and tag array sanitization.

### Level 2: Database & Multi-Tenant Isolation Tests (Mandatory)
- **Duplicate Prevention:** Inserting `(user_1, 'ABC123')` twice must trigger database unique constraint violation and be caught gracefully.
- **Cross-Tenant Isolation:**
  - Seed User A and User B.
  - User A creates Reel `R1`.
  - User B runs `SELECT * FROM reels WHERE id = 'R1'` -> returns 0 rows.
  - User B executes `UPDATE reels SET is_favorite = true WHERE id = 'R1'` -> returns 0 rows modified.
  - User B executes `DELETE FROM reels WHERE id = 'R1'` -> returns 0 rows modified.
- **Cascade Deletion:** Deleting a Reel removes associated `reel_tags` rows automatically.

### Level 3: API Integration Tests
- `POST /api/reels` with valid URL returns `201 Created` with canonical URL.
- `POST /api/reels` with existing URL returns `409 Conflict` with `existingId`.
- `GET /api/reels` returns filtered results matching search query and tag filters.
- `PATCH /api/reels/:id` updates title, notes, and tags cleanly.

### Level 4: End-to-End (E2E) Workflow Test
Simulate the full user journey:
1. User logs in.
2. User pastes Instagram Reel URL into Quick Save bar and presses Enter.
3. System saves reel, displays success toast, and renders new card at top of feed.
4. User toggles favorite star (optimistic update reflects immediately).
5. User searches for keyword in title -> card remains visible.
6. User clicks "Open on Instagram" -> opens valid Instagram URL in external tab.
7. User archives the reel -> reel vanishes from `/saved` and appears in `/archive`.

---

## 3. Ralph Loop & Continuous Self-Review Protocol
At the conclusion of each phase:
1. Run automated test suites.
2. Verify TypeScript strict type check passes with 0 errors.
3. Verify build output completes without warnings.
4. Inspect network tab to ensure no duplicate network calls or unbounded queries occur.
