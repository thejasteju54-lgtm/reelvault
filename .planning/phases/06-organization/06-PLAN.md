# Phase 6: Organization Plan

## Objective
Implement organization features including advanced filtering, search, dedicated views (Saved, Favorites, Archive), and a Tags browser.

## Tasks

### Task 6.1: Shared Grid Layout & Filtering Component
- `src/components/reels/FilterBar.tsx` — A reusable component for text search, category dropdown, and sort order.
- `src/components/reels/ReelGrid.tsx` — A reusable wrapper to fetch and render a list of `ReelCard`s with given query parameters (status, search, category).

### Task 6.2: Implement Saved Reels Page
- Update `src/pages/SavedReels.tsx` to include `FilterBar` and `ReelGrid`.
- Support `status='all'` by default.

### Task 6.3: Implement Favorites Page
- Update `src/pages/Favorites.tsx` to include `ReelGrid` with `status='favorites'`.

### Task 6.4: Implement Archive Page
- Update `src/pages/Archive.tsx` to include `ReelGrid` with `status='archived'`.
- Enable the Archive action in `ReelCard.tsx` (or at least provide a hook to archive).

### Task 6.5: Implement Tags Page
- Update `src/pages/Tags.tsx` to fetch tags via `TaxonomyService.getTags()` and display them in a cloud or list.
- (Bonus) Show tag counts if available, or just standard tags.

## Verification
- `npm run build` succeeds.
- We can search by title in Saved Reels.
- Favorites page only shows favorited reels.
- Archive page shows archived reels.
