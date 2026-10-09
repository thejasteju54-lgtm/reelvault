# BRAND GUIDELINES: ReelVault

**Status:** Living Document • **Version:** 1.0.0 • **Last Updated:** October 2026

---

## 1. Product Name & Core Identity

- **Official Name:** **ReelVault** (CamelCase, no spaces, never "Reel Vault" or "reelvault" in formal headings).
- **Tagline:** *Personal Instagram Reel Bookmark & Knowledge Management Workstation*
- **Short Descriptor:** *The second brain for your Instagram research.*

---

## 2. Emotional Tone & Voice

The ReelVault personality is **utilitarian, calm, focused, and archival**. It feels like a precision instrument built for craftspeople, researchers, and engineers - inspired by physical stationery ledgers, Braun electronics, and high-density productivity tools like Linear, Arc, and Raycast.

### 2.1 Voice Principles
1. **Calm & Unhurried:** No hyperbolic SaaS hype, no exclamation mark overload, no artificial urgency.
2. **Dense & Utilitarian:** Respect the user's screen real estate and intellect. Every pixel, count, and label serves a purpose.
3. **Transparent & Direct:** Plainspoken language about technical realities (e.g., "Reel cataloged in vault", "Duplicate Reel shortcode detected", "No video downloading").

### 2.2 Voice Dos and Don'ts

| Do | Don't |
| :--- | :--- |
| "Save Reel to Vault" | "Supercharge your viral video collection!" |
| "Cataloged in vault" | "Boom! Added to your awesome stash!" |
| "Duplicate Reel detected" | "Oopsie! Looks like you already got this one!" |
| "Archival Terracotta" | "Electric neon gradient" |
| Use colons, commas, or spaced hyphens | Use em dashes (`—`) in copy or docs |

---

## 3. Color Palette & Design Tokens

ReelVault uses a purposeful, warm-minimalist color system designed to feel tactile, archival, and non-distracting. **Zero purple-to-blue gradients.**

```
+--------------------------------------------------------------------------------+
| Brand Primary:   Archival Terracotta  #c84b31  (Solid, authoritative)          |
| Brand Accent:    Warm Ochre           #b45309  (Favorites, stars, badges)      |
| Light Surface:   Warm Bone            #f7f6f2  (Stationery feel, low glare)    |
| Dark Surface:    Charcoal Soot        #131312  (Deep graphite, true black)     |
| Success:         Deep Forest Green    #2d6a4f  (Confirmation, cataloging)      |
| Danger:          Muted Crimson        #b91c1c  (Deletion, duplicate alert)     |
+--------------------------------------------------------------------------------+
```

### 3.1 CSS Color Tokens
- `--color-primary`: `#c84b31` (Hover: `#b33e25`, Active: `#9c331c`)
- `--color-accent`: `#b45309`
- `--color-success`: `#2d6a4f`
- `--color-danger`: `#b91c1c`
- **Light Theme**: `--bg-app: #f7f6f2`, `--bg-surface: #ffffff`, `--text-primary: #1b1b19`, `--text-secondary: #5a5852`
- **Dark Theme**: `--bg-app: #131312`, `--bg-surface: #1e1e1b`, `--text-primary: #f4f3ee`, `--text-secondary: #aba99f`

---

## 4. Typography

ReelVault pairs two intentional typefaces:

1. **Primary Interface:** `Plus Jakarta Sans` (`--font-sans`)
   - Clean, geometric grotesque with humanist open counters.
   - Weights: Regular (400), Medium (500), SemiBold (600), Bold (700).
   - Used for headings, action buttons, form labels, and body text.

2. **Technical Ledger & Metadata:** `JetBrains Mono` (`--font-mono`)
   - Crisp monospace designed for developer density.
   - Weights: Regular (400), Medium (500).
   - Used for Instagram shortcodes, timestamp dates, count badges, keyboard shortcuts (`N`, `/`, `Esc`), and statistics counters.

---

## 5. Iconography & Visual Assets

- **Icon Set:** Lucide React (stroke width: 1.75px to 2px, sized strictly at 14px, 16px, or 18px).
- **Logo Mark:** The ReelVault Bookmark-Film icon (Terracotta `#c84b31` background with bone `#f7f6f2` monogram and film perforations).
- **Favicons:**
  - `public/favicon.svg`: Scalable vector icon.
  - `public/favicon.ico`: 32x32 multi-resolution fallback.
  - `public/apple-touch-icon.png`: 180x180 high-DPI iOS home screen bookmark.
  - `public/og-preview.png`: 1200x630 Open Graph card preview.
