# Phase 4: Frontend Foundation Plan

## Objective
Build the complete application shell: sidebar navigation (desktop), bottom navigation (mobile), app layout, toast notification system, empty state components, and the routing structure defined in the product spec.

## Inputs
- `docs/PRODUCT_SPEC.md` (Routes, Navigation, Keyboard Shortcuts)
- `src/index.css` (Existing design tokens)

## Execution Plan & Tasks

### Task 4.1: App Layout Shell
- `src/components/layout/AppLayout.tsx` — Desktop sidebar + mobile bottom nav shell
- `src/components/layout/Sidebar.tsx` — Desktop sidebar with nav links, branding, stats
- `src/components/layout/BottomNav.tsx` — Mobile bottom tab bar

### Task 4.2: Toast Notification System
- `src/components/ui/Toast.tsx` — Animated toast with variants (success, error, info)
- `src/contexts/ToastContext.tsx` — React context + provider + `useToast()` hook

### Task 4.3: Empty State Component
- `src/components/ui/EmptyState.tsx` — Reusable empty state with icon, title, subtitle, action

### Task 4.4: Page Stubs + Router
- `src/pages/Dashboard.tsx`, `src/pages/SavedReels.tsx`, `src/pages/Favorites.tsx`
- `src/pages/Archive.tsx`, `src/pages/Tags.tsx`, `src/pages/Settings.tsx`
- Wire routing in `App.tsx`

### Task 4.5: Extended CSS
- Add layout, toast, nav, and animation styles to `index.css`

## Verification
1. `tsc && vite build` passes
2. Dev server renders shell with working navigation
