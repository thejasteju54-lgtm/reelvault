# Phase 5: Core Save Flow Plan

## Objective
Implement the Quick Save feature (the primary action for ReelVault) and the ReelCard component for displaying saved reels. This phase wires up the frontend with the Supabase backend `reels.ts` service created in Phase 3.

## Tasks

### Task 5.1: QuickSave Component
- `src/components/reels/QuickSave.tsx`
- Implement an input bar for pasting Instagram URLs.
- Include URL validation.
- Implement the `N` keyboard shortcut to focus the input.
- Handle submit: Call `reelsService.saveReel`.
- Use `ToastContext` for success (201) and duplicate (409) notifications.

### Task 5.2: ReelCard Component
- `src/components/reels/ReelCard.tsx`
- Implement the UI defined in `PRODUCT_SPEC.md` (9:16 thumbnail, title, creator, watch status, favorite toggle, etc.).
- Add actions for checking (watching) and starring (favorite).

### Task 5.3: Integrate into Dashboard
- Update `src/pages/Dashboard.tsx` to include `QuickSave`.
- Fetch and display the most recent reels using `ReelCard`.
- Add a loading state (skeleton or simple spinner) while fetching.

## Verification
- `npm run build` succeeds.
- We can successfully save a valid URL and see a toast.
- Duplicate URLs correctly trigger the duplicate toast.
- Saved reels appear in the Dashboard.
