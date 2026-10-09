# Product Specification: ReelVault

## 1. Product Summary
ReelVault is a purpose-built personal bookmarking and knowledge management platform for Instagram Reels. It replaces ad-hoc saving workflows (e.g. pasting links into WhatsApp personal chats, Notes app, Telegram, or Notion dumps) with an ultra-fast, structured, searchable repository.

---

## 2. Core User Flows

### Flow 1: Quick Save (Primary Action)
1. **Trigger:** User discovers a Reel on Instagram, taps "Share", and copies the link.
2. **Input:** User switches to ReelVault and pastes the URL in the prominent Quick Save bar on the Dashboard or presses shortcut `N`.
3. **Execution:**
   - Client performs instant client-side format validation.
   - API normalizes URL to canonical form `https://www.instagram.com/reel/<shortcode>/`.
   - API checks if shortcode already exists for the user:
     - **If new:** Saves reel, triggers non-blocking metadata enrichment, returns HTTP 201 Created.
     - **If duplicate:** Returns HTTP 409 Conflict with link to existing Reel.
   - Client displays subtle toast notification: `✓ Reel saved` with quick actions: `[View]`, `[Open Instagram]`.

### Flow 2: Exploration & Retrieval
1. User filters by Category (e.g., *Engineering*, *Fitness*, *Design*, *Recipes*), Tags (e.g., `#react`, `#supabase`), or Status (*Unwatched*, *Watched*, *Favorites*, *Archived*).
2. Debounced search input matches titles, creator handles, notes, or tags.
3. User clicks any ReelCard to open the Details Drawer.

### Flow 3: Consumption & Action
1. User clicks **"Open on Instagram"** on the card or drawer.
2. Instagram opens directly in a new browser tab/mobile app.
3. User marks the reel as **Watched** (optimistic update) or adds private reflection notes.

---

## 3. Screen Structure & Navigation

### Routes
| Route | Purpose | Key Elements |
|---|---|---|
| `/dashboard` | Command center | Greeting, Quick Save bar, Recent Reels, Quick Stats, Quick filters |
| `/saved` | All active reels | Search bar, tag cloud, grid/list view, sort controls |
| `/favorites` | Starred items | High-priority reels marked for recurring reference |
| `/archive` | Inactive archive | Processed reels retained without cluttering active feed |
| `/tags` | Taxonomy hub | Tag browser, reel count per tag, batch tag management |
| `/settings` | Preferences | Theme (Light/Dark/System), data export (JSON/CSV), account info |

---

## 4. Component Anatomy

### ReelCard Component
- **Media Header:** 9:16 aspect ratio thumbnail preview with graceful fallback gradient if unavailable.
- **Top Badges:** Watch status indicator (Unwatched / Watched), Category pill.
- **Body:**
  - Title (truncated to 2 lines with tooltip).
  - Creator handle (`@username` link or label).
  - Tag chips (clickable to filter).
  - Saved timestamp (`2 hours ago`).
- **Footer Action Bar:**
  - `Star` (Favorite toggle).
  - `Check` (Watch toggle).
  - `External Link` ("Open on Instagram" primary action).
  - `Context Menu (...)`: Edit, Copy Clean URL, Archive, Delete.

---

## 5. Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `/` or `Ctrl + K` / `Cmd + K` | Focus Search Bar |
| `N` | Open Quick Save Input |
| `Escape` | Close Modal / Drawer / Clear Filter |
| `F` | Toggle Favorite on selected card |
| `W` | Toggle Watched on selected card |
| `E` | Edit metadata |
