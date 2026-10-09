# DESIGN SYSTEM: ReelVault

**Status:** Living Document • **Version:** 1.0.0 • **Last Updated:** October 2026

---

## 1. Design Token Architecture

All visual styling in ReelVault is governed strictly through CSS custom properties defined in `src/client/styles/tokens.css`. Component authors must use tokens instead of ad-hoc CSS properties or arbitrary pixel literals.

### 1.1 Type Scale
```css
--font-size-xs:   0.75rem;    /* 12px - Monospace badges, timestamps, counts */
--font-size-sm:   0.875rem;   /* 14px - Table headers, secondary text, button labels */
--font-size-base: 1rem;       /* 16px - Body text, inputs (prevents iOS auto-zoom) */
--font-size-md:   1.25rem;    /* 20px - Card titles, section headers */
--font-size-lg:   1.75rem;    /* 28px - Modal titles */
--font-size-xl:   2.5rem;     /* 40px - Page title / landing headlines */
--font-size-2xl:  3.5rem;     /* 56px - Hero banners */
```

### 1.2 Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
```

### 1.3 Radii & Shadows
```css
--radius: 6px;                /* Universal single consistent border radius */
--shadow-dropdown: 0 6px 20px rgba(0, 0, 0, 0.45);
```

---

## 2. Core Component Conventions

### 2.1 Buttons (`.btn`)
- **Primary (`.btn-primary`)**: Solid terracotta background (`var(--color-primary)`), white text, subtle hover shade (`var(--color-primary-hover)`). Used exclusively for the single primary call to action per view.
- **Secondary (`.btn-secondary`)**: Neutral surface background (`var(--bg-surface)`), bordered with `var(--border-muted)`.
- **Ghost (`.btn-ghost`)**: Transparent background, text colored `var(--text-muted)`. Hover turns to subtle surface background.
- **Touch Target Rule**: All interactive buttons must satisfy a minimum 44x44px touch target (mobile navigation uses 48x48px).

### 2.2 Form Inputs (`input[type="text"]`, `input[type="email"]`, `textarea`)
- Border: `1px solid var(--border-muted)`.
- Background: `var(--bg-input)`.
- Font Size: Strictly `1rem` (16px) minimum to prevent iOS Safari auto-zoom.
- Focus: `outline: 2px solid var(--border-focus); outline-offset: -1px;`.

### 2.3 Badges & Category Pills (`.badge-category`, `.badge-tag`)
- Rendered with `var(--font-mono)` at `var(--font-size-xs)`.
- Features subtle category color tints with border contrast meeting WCAG AA requirements.

### 2.4 Modals & Overlays
- Backdrop: `var(--bg-overlay)`.
- Surface: Centered with max-width (540px for auth, 760px for reel detail).
- Escape key listener and trap-free focus navigation.
