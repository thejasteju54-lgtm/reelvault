# REQUIREMENTS: ReelVault

## Functional Requirements
- **Core Saving:** Fast input for Instagram Reel URL, URL normalization, metadata fetching (title/notes optionally), and duplicate prevention.
- **Organization:** Ability to add/edit title, notes, and tags to Reels. Assign Reels to optional Categories.
- **Status Management:** Mark Reels as watched/unwatched, favorite/important, and archive.
- **Search & Filter:** Fast server-side search by title/notes/tags. Filtering by category, tag, status, and favorites.
- **Views:** Dashboard (Quick save + summary), Saved Reels (Grid/List), Favorites, Archive, Tags, Settings.
- **Mobile Support:** Mobile-first responsive UI with bottom navigation.
- **Data Export:** Simple export of saved URLs/metadata.

## Non-Functional Requirements
- **Performance:** Optimized database queries with appropriate indexing. Caching of frontend fetches, avoiding excessive re-renders.
- **Security:** Strict API validation, parameterized queries/ORM, protection against mass assignment, proper error handling (no stack traces in prod).
- **UX/UI:** Minimalist design, dark mode support, microinteractions, empty states, keyboard shortcuts, accessible ARIA labels, subtle toast notifications.
- **Reliability:** Graceful error states, optimistic UI updates for safe actions, transaction-based database modifications.
