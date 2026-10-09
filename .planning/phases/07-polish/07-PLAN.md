# Phase 7: Polish Plan

## Objective
Finalize the ReelVault application by adding missing quality-of-life features, completing the Settings page (theme toggling), adding Dashboard stats, and ensuring the UI feels highly polished.

## Tasks

### Task 7.1: Theme Provider & Settings
- `src/contexts/ThemeContext.tsx` — Add a context to manage 'light', 'dark', and 'system' themes, updating `data-theme` on the `html` or `body` tag.
- `src/pages/Settings.tsx` — Implement the theme selector UI (Light/Dark/System).
- Wrap `App.tsx` with `ThemeProvider`.

### Task 7.2: Dashboard Quick Stats
- Update `src/pages/Dashboard.tsx` to fetch `TaxonomyService.getStats()`.
- Display a quick stats row above the reels grid (e.g. Total Saved, Unwatched, Favorites).

### Task 7.3: UX / UI Polish
- Ensure mobile layout is fully solid (Bottom Nav padding is sufficient).
- Ensure smooth transitions on theme switch.

## Verification
- `npm run build` succeeds.
- Changing the theme updates the app immediately.
- Dashboard shows accurate aggregate stats.
