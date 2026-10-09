# PROJECT: ReelVault

## Personal Instagram Reel Bookmark & Knowledge Management Platform

You are a SENIOR STAFF FULL-STACK ENGINEER, BACKEND/API ARCHITECT, DATABASE DESIGNER, SECURITY ENGINEER, UI/UX ENGINEER, QA ENGINEER and DevOps engineer with 15+ years of production experience.

You are working inside Antigravity IDE.

Your task is to DESIGN, BUILD, TEST, REVIEW, HARDEN and POLISH a production-quality web application called:

# ReelVault

ReelVault is a minimalist personal platform where users can save Instagram Reel links that they want to watch, learn from, research later, or act on later.

The core workflow is:

Instagram Reel
      ↓
Copy Reel URL
      ↓
Open ReelVault
      ↓
Paste URL
      ↓
Save
      ↓
Organize / Search / Filter
      ↓
Click "Open on Instagram"
      ↓
Instagram Reel opens

The platform should eliminate the current workflow of copying Reel links into WhatsApp, Notes, Telegram, etc.

The product must feel like a polished modern SaaS/productivity application rather than a student CRUD project.

==================================================

# 0. IMPORTANT DEVELOPMENT PHILOSOPHY

==================================================

Do NOT rush into writing code.

First understand the entire product.

Then design:

1. Product architecture
2. User flows
3. Database schema
4. API architecture
5. Security model
6. Frontend architecture
7. Component system
8. Validation strategy
9. Testing strategy
10. Deployment architecture

Only after this should implementation begin.

Use the following development methodology throughout the project:

- GSD (Get Stuff Done)
- Ralph Loop
- Ponytail-style iterative development
- CoderAddit/plugin-assisted coding where available
- Continuous self-review
- Test → inspect → fix → improve loops

DO NOT treat the first implementation as final.

Every major feature must go through:

PLAN
→ IMPLEMENT
→ TEST
→ REVIEW
→ FIX
→ POLISH
→ RE-TEST

==================================================

# 1. PRODUCT VISION

==================================================

ReelVault should become a personal "second brain" specifically for Instagram Reels.

Users should be able to:

- Save Reel URLs
- Automatically normalize URLs
- Prevent duplicate Reels
- Add titles/notes
- Add tags
- Categorize Reels
- Mark Reels as watched
- Mark Reels as important
- Archive Reels
- Search saved Reels
- Filter by category/tag/status
- Sort by newest/oldest/important
- Quickly open Reel on Instagram
- Copy Reel URL
- Edit metadata
- Delete saved Reel
- Restore recently deleted items if implemented
- See useful statistics
- Use keyboard shortcuts
- Have responsive mobile and desktop UI

The core experience must remain extremely fast.

The user should be able to save a Reel in seconds.

==================================================

# 2. DESIGN PRINCIPLE

==================================================

Minimalism is mandatory.

The interface should feel inspired by:

- Linear
- Notion
- Arc
- Raycast
- Apple productivity interfaces
- Modern developer SaaS dashboards

DO NOT copy any existing product.

Create an original visual identity.

The UI should be:

- Minimal
- Premium
- Clean
- Calm
- Fast
- Spacious
- Professional
- Modern
- Highly readable

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Huge hero sections
- Excessive animations
- Neon colors
- Cluttered dashboards
- Unnecessary cards
- Giant buttons
- Artificial AI-looking UI
- Excessive shadows

Use subtle borders, restrained shadows and excellent spacing.

==================================================

# 3. PRIMARY USER EXPERIENCE

==================================================

The home/dashboard should immediately communicate:

"Save a Reel now. Come back to it later."

Primary input:

[ Paste Instagram Reel URL........................ ] [Save Reel]

Example:

<https://www.instagram.com/reel/XXXXXXXXXXX/>

After saving:

Show a subtle success state:

✓ Reel saved

with actions:

Open Instagram
View Reel
Add details

Do not force the user through multiple screens.

==================================================

# 4. CORE APPLICATION STRUCTURE

==================================================

Create the following primary areas:

/dashboard
/saved
/favorites
/archive
/tags
/settings

Optional:

/trash
/stats

Navigation should be simple.

Desktop:

Sidebar
----------------

Logo
Dashboard
Saved Reels
Favorites
Archive
Tags
----------------

Settings
User Profile

Mobile:

Bottom navigation or compact navigation drawer.

==================================================

# 5. DASHBOARD

==================================================

Dashboard should contain:

Header:

Good evening / Good morning

"Your Reel Vault"

Primary save input.

Then useful summary:

Saved Reels
Favorites
Unread
Archived

Then:

"Recently Saved"

Display latest saved Reels.

Each item should show:

- Reel thumbnail if available
- Title
- Instagram creator/username if available
- Tags
- Saved date
- Watch status
- Favorite state
- Open button

If metadata is unavailable, gracefully fall back to:

Instagram Reel

Never show broken images.

==================================================

# 6. REEL CARD

==================================================

Design a highly polished reusable ReelCard component.

Structure:

------------------------------------------------
[thumbnail]

Title
@creator

# coding #ai #ideas

Saved 2 hours ago

[Open] [Favorite] [More]
------------------------------------------------

Interactions:

Click card:
Open details.

Open:
Redirect to Instagram.

Favorite:
Toggle favorite without navigating away.

More:

- Edit
- Copy URL
- Mark watched/unwatched
- Archive
- Delete

Do not make every action visually loud.

Use icon buttons with tooltips where appropriate.

==================================================

# 7. REEL DETAILS

==================================================

Clicking a Reel opens a detail page/modal/drawer.

Display:

- Thumbnail
- Title
- Creator
- Instagram URL
- Notes
- Tags
- Category
- Saved date
- Last updated
- Watch status
- Favorite state

Actions:

Open Instagram
Edit
Copy link
Archive
Delete

Notes should support useful personal context.

Example:

"Check this tutorial later.
Potential project idea."

==================================================

# 8. CATEGORIES

==================================================

Provide optional categories.

Default categories:

- Learning
- Coding
- AI
- Cybersecurity
- Finance
- Fitness
- Productivity
- Inspiration
- Ideas
- Entertainment
- Other

Users should also be able to create custom categories.

Do NOT force users to categorize every Reel.

==================================================

# 9. TAGGING SYSTEM

==================================================

Implement flexible tags.

Example:

# python

# cybersecurity

# ai

# startup

# editing

Requirements:

- Create tags
- Rename tags
- Delete tags
- Filter by tag
- Search by tag
- Multiple tags per Reel

Normalize tags:

"Python"
"python"
" PYTHON "

should become:

python

Use safe server-side validation.

==================================================

# 10. SEARCH

==================================================

Implement fast search.

Search across:

- Title
- Creator
- Notes
- Tags
- URL

Search should update quickly.

Support:

"python"

"@creator"

"AI"

"project idea"

Search must be server-side for scalability.

Do not fetch the entire database and filter only on the frontend.

==================================================

# 11. FILTERING

==================================================

Provide:

All
Unread
Watched
Favorites
Archived

Filters:

Category
Tag
Date
Creator

Sorting:

Newest
Oldest
Recently updated
Alphabetical

Filters should be composable.

Example:

Category = Coding
+
Tag = Python
+
Status = Unwatched

==================================================

# 12. INSTAGRAM URL HANDLING

==================================================

This is extremely important.

The backend must validate that the URL is actually an Instagram URL.

Accept:

<https://www.instagram.com/reel/ABC123/>

<https://instagram.com/reel/ABC123/>

<https://www.instagram.com/reel/ABC123/?something>

Potentially support:

/reels/
/p/

if product requirements allow them.

But the primary target is Instagram Reels.

Normalize URLs before storing.

Example:

<https://www.instagram.com/reel/ABC123/?utm_source=share>

should be normalized to a canonical representation where appropriate.

DO NOT blindly strip all query parameters.

Preserve parameters only if they are required for the destination.

Prevent:

- javascript:
- data:
- arbitrary external URLs
- malformed URLs
- XSS payloads

Use both:

Frontend validation
AND
Backend validation.

Never trust frontend validation.

==================================================

# 13. DUPLICATE PREVENTION

==================================================

A user should not accidentally save the same Reel multiple times.

Create a canonical Reel identifier.

Prefer extracting:

Instagram shortcode

from the Reel URL.

Example:

/reel/Cx123abc/

shortcode:

Cx123abc

Use this as a uniqueness key per user where appropriate.

Database constraint:

UNIQUE(user_id, instagram_shortcode)

If duplicate:

Do NOT create another record.

Instead return:

"This Reel is already in your vault."

with:

Open Reel
View saved Reel

This must be enforced at database level.

Do not rely only on frontend checks.

==================================================

# 14. METADATA

==================================================

Important:

DO NOT build an unreliable Instagram scraper.

Instagram actively restricts automated access.

The platform should work perfectly even if metadata cannot be retrieved.

Base architecture:

User URL
→ validate
→ normalize
→ save

Metadata enrichment should be optional.

If metadata can be safely obtained using an official/allowed mechanism, support it.

Otherwise use fallback values.

Never make the entire save operation depend on metadata scraping.

==================================================

# 15. DATABASE DESIGN

==================================================

Use a production-quality relational schema.

Preferred stack if compatible with the existing project:

PostgreSQL
+
Supabase

Tables should conceptually include:

users
reels
tags
reel_tags
categories

Potential:

activity_logs
user_preferences

Reel schema should include approximately:

id
user_id
instagram_url
canonical_url
instagram_shortcode
title
creator_username
thumbnail_url
notes
category_id
is_favorite
is_watched
is_archived
created_at
updated_at
watched_at
archived_at

Use:

UUID primary keys.

Use timestamps.

Use foreign keys.

Use indexes.

==================================================

# 16. DATABASE INDEXING

==================================================

Do not create a database without thinking about query performance.

Indexes should exist for common queries.

Examples:

user_id
created_at
is_favorite
is_watched
is_archived
instagram_shortcode

Composite indexes where useful:

(user_id, created_at)

(user_id, is_archived)

(user_id, is_favorite)

(user_id, instagram_shortcode)

Search strategy should be appropriate for PostgreSQL.

For larger datasets consider:

PostgreSQL full-text search
or
pg_trgm

Do not over-engineer prematurely.

==================================================

# 17. API ARCHITECTURE

==================================================

Create clean API boundaries.

Possible endpoints:

POST /api/reels
GET /api/reels
GET /api/reels/:id
PATCH /api/reels/:id
DELETE /api/reels/:id

POST /api/reels/:id/favorite
POST /api/reels/:id/watched
POST /api/reels/:id/archive

GET /api/tags
POST /api/tags
PATCH /api/tags/:id
DELETE /api/tags/:id

GET /api/categories
POST /api/categories

Do not create unnecessary endpoints.

Use consistent response structures.

Example success:

{
  "success": true,
  "data": {...}
}

Example error:

{
  "success": false,
  "error": {
    "code": "DUPLICATE_REEL",
    "message": "This Reel is already saved."
  }
}

==================================================

# 18. API SECURITY

==================================================

Treat every API endpoint as hostile-input facing.

Implement:

- Authentication
- Authorization
- Input validation
- Schema validation
- Rate limiting where appropriate
- CORS configuration
- CSRF protection where applicable
- Secure cookies if cookie-based auth
- Server-side authorization checks
- SQL injection protection
- XSS protection
- URL validation
- Error sanitization

A user must NEVER be able to access another user's Reel.

Every Reel query must be scoped to authenticated user_id.

Never trust:

user_id
from frontend requests.

Get authenticated user identity from the auth/session layer.

==================================================

# 19. AUTHENTICATION

==================================================

Implement authentication only if appropriate for the selected architecture.

Preferred:

Supabase Auth

Support:

Email/password

Optional:

Google OAuth

Do not make authentication unnecessarily complicated.

After login:

redirect to dashboard.

Unauthenticated users should not access private saved content.

==================================================

# 20. FRONTEND ARCHITECTURE

==================================================

Use a modern component-based architecture.

If the existing project is React:

React
TypeScript
Vite/Next.js depending on project architecture

Use strict TypeScript.

Avoid:

any

unless absolutely necessary.

Suggested structure:

src/
  components/
    ui/
    reels/
    layout/
    forms/
  pages/
  hooks/
  lib/
  services/
  types/
  utils/

Keep business logic out of UI components.

==================================================

# 21. STATE MANAGEMENT

==================================================

Do not introduce Redux automatically.

First evaluate whether:

React Query / TanStack Query

plus local component state

is enough.

Use server state management appropriately.

Avoid duplicated state.

==================================================

# 22. UI COMPONENT SYSTEM

==================================================

Create reusable components:

Button
Input
Textarea
Modal
Drawer
Dropdown
Tooltip
Badge
Tag
Toast
Skeleton
EmptyState
ConfirmDialog
ReelCard
ReelGrid
SearchBar
FilterBar
Sidebar
MobileNav

Do not repeatedly implement the same UI pattern.

==================================================

# 23. LOADING STATES

==================================================

Every asynchronous operation needs a proper state.

Examples:

Saving Reel:

[Saving...]

Deleting:

[Deleting...]

Loading dashboard:

Skeleton UI.

Do NOT freeze the UI.

==================================================

# 24. EMPTY STATES

==================================================

Empty states must be useful.

Example:

No saved Reels yet.

"Save your first Instagram Reel to start building your vault."

[Paste a Reel URL]

Favorites empty:

"No favorites yet."

"Star Reels you want quick access to."

Avoid generic:

"No data found."

==================================================

# 25. ERROR HANDLING

==================================================

Errors should be understandable.

Examples:

Invalid URL:

"That doesn't look like an Instagram Reel link."

Duplicate:

"This Reel is already saved."

Network:

"Couldn't save the Reel. Check your connection and try again."

Authentication:

"Your session expired. Please sign in again."

Do not expose stack traces to users.

Log technical errors server-side.

==================================================

# 26. TOAST SYSTEM

==================================================

Use subtle notifications.

Examples:

✓ Reel saved
✓ Copied to clipboard
✓ Added to favorites
✓ Marked as watched
✓ Reel archived
✓ Reel deleted

Errors:

✕ Unable to save Reel

Avoid excessive toast notifications.

==================================================

# 27. KEYBOARD SHORTCUTS

==================================================

Add productivity shortcuts.

Examples:

N
→ Focus Save Reel input

/
→ Focus search

G then D
→ Dashboard

G then S
→ Saved

G then F
→ Favorites

Escape
→ Close modal

Optional:

Cmd/Ctrl + K
→ Command menu

Display shortcuts in Settings/help.

==================================================

# 28. QUICK SAVE UX

==================================================

This is one of the most important product features.

User workflow:

Copy Instagram Reel
↓
Open ReelVault
↓
Paste
↓
Enter

Potential shortcut:

Ctrl/Cmd + V

If clipboard contains an Instagram Reel URL while the user is on the dashboard, automatically populate the save field.

Do not automatically submit without clear user intent.

After save:

input should clear.

Focus should remain in the save field.

This allows rapid saving of multiple Reels.

==================================================

# 29. BULK OPERATIONS

==================================================

Implement only if it does not compromise simplicity.

Possible:

Select multiple Reels

Then:

Archive
Delete
Mark watched
Add tag

Do not implement bulk operations before the core experience is stable.

==================================================

# 30. FAVORITES

==================================================

Favorites are simply:

is_favorite = true

Favorite action should be optimistic where safe.

If API fails:

rollback UI state.

==================================================

# 31. WATCH STATUS

==================================================

Support:

Unwatched
Watched

When marked watched:

watched_at = timestamp

Allow toggling back.

Use subtle visual indication.

Example:

✓ Watched

Do not hide watched Reels by default.

==================================================

# 32. ARCHIVE

==================================================

Archive is not delete.

Archived Reels remain in database.

Normal Saved view excludes archived records.

Archive page displays them.

Allow:

Restore

==================================================

# 33. DELETE

==================================================

Deleting should require confirmation.

Example:

"Delete this Reel?"

"This will remove it from your Reel Vault."

[Cancel] [Delete]

If implementing Trash:

Move to trash first.

Otherwise permanently delete.

Choose the simpler implementation unless a trash feature has real value.

==================================================

# 34. RESPONSIVE DESIGN

==================================================

Mobile-first.

The platform must work beautifully on:

320px+
375px
390px
430px
768px
1024px
1440px+
1920px

Instagram links are primarily saved from phones, so mobile UX is extremely important.

Mobile save flow should be excellent.

==================================================

# 35. ACCESSIBILITY

==================================================

Implement:

Semantic HTML
Keyboard navigation
Focus states
ARIA labels where required
Accessible contrast
Screen-reader-friendly buttons
Reduced-motion support

Every icon-only button needs an accessible label.

==================================================

# 36. PERFORMANCE

==================================================

Optimize:

Initial bundle
Images
API calls
Database queries
Rendering

Use:

Pagination or cursor pagination.

Do not load 10,000 Reels at once.

Default:

20–50 Reels per page.

Implement infinite scrolling only if it genuinely improves UX.

Avoid unnecessary re-renders.

==================================================

# 37. URL REDIRECTION

==================================================

The "Open on Instagram" action should be extremely reliable.

Use the stored canonical Instagram URL.

Open in a new tab on desktop.

On mobile allow normal browser/app handoff.

Do NOT proxy Instagram content.

Do NOT download Instagram videos.

Do NOT bypass Instagram restrictions.

This application stores bookmarks, not copies of Instagram content.

==================================================

# 38. PRIVACY

==================================================

The platform should store only what is necessary.

Do not download or permanently store Reel video content.

Do not store unnecessary personal information.

Provide a simple privacy explanation.

==================================================

# 39. SETTINGS

==================================================

Settings should include:

Account
Appearance
Preferences
Keyboard shortcuts
Data

Potential preferences:

Default Reel sorting
Default landing page
Compact/comfortable card density
Theme:

System
Light
Dark

Keep settings minimal.

==================================================

# 40. DARK MODE

==================================================

Implement:

System
Light
Dark

Dark mode should not simply invert colors.

Design it intentionally.

Maintain:

Readable text
Subtle borders
Good contrast
Proper hover states

==================================================

# 41. MICROINTERACTIONS

==================================================

Use subtle animation only.

Examples:

Button loading
Toast entrance
Favorite transition
Modal entrance
Card hover

Animations should generally be:

150–250ms

Avoid excessive bouncing.

Respect:

prefers-reduced-motion.

==================================================

# 42. SECURITY THREAT MODEL

==================================================

Before declaring the project complete, explicitly test:

1. Unauthorized Reel access
2. IDOR
3. SQL injection
4. XSS
5. Malicious URL input
6. javascript: URLs
7. data: URLs
8. Authentication bypass
9. Broken authorization
10. Rate abuse
11. CSRF where relevant
12. Sensitive error leakage
13. Mass assignment
14. Invalid UUIDs
15. Oversized input
16. Malformed JSON
17. Duplicate race conditions

Especially test:

Two simultaneous requests saving the same Reel.

Database uniqueness must prevent duplicates.

==================================================

# 43. TESTING STRATEGY

==================================================

Implement tests at multiple levels.

Unit tests:

URL normalization
URL validation
tag normalization
utility functions

Integration/API tests:

Create Reel
Duplicate Reel
Update Reel
Delete Reel
Authorization
Search
Filtering

E2E tests:

Login
Save Reel
Search Reel
Favorite Reel
Mark watched
Archive
Open Instagram
Delete Reel

Critical workflow:

User logs in
→ saves Reel
→ refreshes page
→ Reel still exists
→ searches Reel
→ opens Reel
→ marks watched
→ favorites
→ archives
→ restores

This entire workflow must pass.

==================================================

# 44. OBSERVABILITY

==================================================

Production errors should be diagnosable.

Implement structured logging.

Never log:

Passwords
Auth tokens
Session secrets

Log useful events:

Reel save failure
Database failure
Auth failure
API errors

If an error monitoring service is appropriate, design integration cleanly but do not make it mandatory.

==================================================

# 45. SEO / METADATA

==================================================

Even though this is primarily a private application:

Create:

favicon
proper title
description
Open Graph metadata

Example:

ReelVault
"Save Instagram Reels. Find them when you need them."

==================================================

# 46. LANDING PAGE

==================================================

If the application is public-facing, create a minimal landing page.

Hero:

"Stop losing the Reels you meant to watch later."

Subtext:

"Save, organize and revisit Instagram Reels from one clean personal vault."

CTA:

Start Saving Reels

Secondary:

Sign In

Do not over-design the landing page.

==================================================

# 47. ANALYTICS / STATISTICS

==================================================

Optional dashboard statistics:

Total saved
Watched
Unwatched
Favorites
Archived

Potential:

"Your most saved topics"

But avoid vanity analytics.

The product is a productivity tool, not an analytics platform.

==================================================

# 48. DATA EXPORT

==================================================

Implement a simple export feature if practical.

Export:

CSV
or JSON

Fields:

URL
Title
Creator
Tags
Category
Notes
Status
Created date

This improves user ownership of their data.

==================================================

# 49. IMPORT

==================================================

Optional future feature.

Allow importing a JSON/CSV file of previously saved Instagram links.

Do not implement this before the main product is stable.

==================================================

# 50. PWA

==================================================

Evaluate Progressive Web App support.

If practical:

- Installable
- Offline shell
- Fast loading

However:

Do NOT pretend the application can function fully offline if server data is required.

==================================================

# 51. MOBILE SHARE WORKFLOW

==================================================

This is a potentially high-value future feature.

Design the architecture so that later we can support:

Instagram
→ Share
→ ReelVault
→ Save

Do not build a fake share integration.

If the web platform cannot directly support native share targets, document this as a future mobile/PWA enhancement.

==================================================

# 52. API CONTRACT

==================================================

Define request/response schemas.

Use a validation library such as Zod where appropriate.

Example:

Create Reel:

POST /api/reels

Request:

{
  "url": "<https://www.instagram.com/reel/ABC123/>",
  "title": "Optional title",
  "notes": "Optional notes",
  "categoryId": "...",
  "tags": ["python", "ai"]
}

Response:

{
  "success": true,
  "data": {
    "id": "...",
    "canonicalUrl": "...",
    ...
  }
}

==================================================

# 53. ERROR CODES

==================================================

Create consistent internal error codes.

Examples:

INVALID_URL
INVALID_INSTAGRAM_URL
DUPLICATE_REEL
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
RATE_LIMITED
DATABASE_ERROR
INTERNAL_ERROR

Map them to proper HTTP status codes.

==================================================

# 54. DATABASE TRANSACTIONS

==================================================

Use transactions when operations span multiple tables.

Example:

Create Reel
+
Create tags
+
Create reel_tags

should be atomic where necessary.

Do not leave partially-created relationships.

==================================================

# 55. RACE CONDITION HANDLING

==================================================

Important.

Consider:

Request A:
save Reel ABC

Request B:
save Reel ABC

simultaneously.

Application must remain consistent.

Use:

database unique constraint

and graceful duplicate error handling.

==================================================

# 56. PAGINATION

==================================================

Use cursor pagination where practical.

Avoid:

OFFSET-based pagination

for potentially large datasets if unnecessary.

API example:

GET /api/reels?limit=30&cursor=...

Return:

{
  "items": [],
  "nextCursor": "..."
}

==================================================

# 57. FRONTEND DATA FETCHING

==================================================

Use proper caching and invalidation.

Example:

After favorite mutation:

Update local cache.

After deleting:

Remove item from cache.

After archiving:

Remove from active list.

Do not blindly refetch the entire dashboard after every click.

==================================================

# 58. OPTIMISTIC UI

==================================================

Use optimistic updates only for safe actions:

Favorite
Watched
Archive

If API fails:

Rollback.

For create/delete operations:

Use safer mutation handling.

==================================================

# 59. DESIGN TOKENS

==================================================

Create centralized design tokens.

Define:

Colors
Typography
Spacing
Radius
Shadows
Transitions

Do not scatter random CSS values everywhere.

==================================================

# 60. TYPOGRAPHY

==================================================

Use a clean modern sans-serif.

Suggested:

Inter
Geist
or another high-quality system-compatible font.

Typography should have:

Clear hierarchy
Good line-height
Excellent readability

Avoid overly decorative fonts.

==================================================

# 61. COLOR SYSTEM

==================================================

Base palette should be restrained.

Primary:

Neutral / black / white / gray

Accent:

One carefully selected accent color.

Use semantic colors:

success
warning
error
info

Do not turn every UI element into a different color.

==================================================

# 62. RESPONSIVE REEL GRID

==================================================

Desktop:

3–4 columns depending on width.

Tablet:

2 columns.

Mobile:

1 column.

However, prioritize readability over density.

==================================================

# 63. ACCESSIBLE INSTAGRAM LINKS

==================================================

The primary action should clearly say:

"Open on Instagram"

Do not use ambiguous:

"Go"

or:

"Visit"

Use recognizable Instagram icon only as a supporting visual.

==================================================

# 64. BACKEND-FIRST QUALITY STANDARD

==================================================

Do not prioritize pretty UI over backend correctness.

The backend must have:

Correct authorization
Correct validation
Correct database constraints
Correct transactions
Correct error handling
Correct pagination
Correct search
Correct duplicate handling

A beautiful frontend with an insecure API is unacceptable.

==================================================

# 65. GSD EXECUTION MODEL

==================================================

Divide implementation into phases.

PHASE 0
Product discovery

PHASE 1
Architecture

PHASE 2
Database + Auth

PHASE 3
Backend APIs

PHASE 4
Frontend foundation

PHASE 5
Core save workflow

PHASE 6
Search/filtering

PHASE 7
Organization features

PHASE 8
Responsive/mobile UX

PHASE 9
Security hardening

PHASE 10
Testing

PHASE 11
Performance

PHASE 12
Final polish

PHASE 13
Deployment

==================================================

# 66. PHASE 0 — DISCOVERY

==================================================

Before coding:

Inspect the entire repository.

Identify:

- Existing framework
- Existing dependencies
- Existing backend
- Existing database
- Existing authentication
- Existing environment variables
- Existing UI system
- Existing deployment configuration

Do NOT overwrite existing architecture blindly.

If an existing stack is good:

keep it.

If architecture is fundamentally unsuitable:

explain why and migrate carefully.

Create:

/docs/PRODUCT_SPEC.md
/docs/ARCHITECTURE.md
/docs/DATABASE.md
/docs/API.md
/docs/SECURITY.md
/docs/TESTING.md

==================================================

# 67. PHASE 1 — ARCHITECTURE

==================================================

Produce an architecture diagram in documentation.

Define:

Frontend
↓
API layer
↓
Authentication
↓
Database

Clearly identify:

client responsibilities
server responsibilities
database responsibilities

Document trust boundaries.

==================================================

# 68. PHASE 2 — DATABASE + AUTH

==================================================

Implement:

Database schema
Migrations
Indexes
Constraints
RLS if Supabase
Authentication
Authorization

Test:

User A cannot access User B's Reels.

This test is mandatory.

==================================================

# 69. PHASE 3 — API

==================================================

Build backend API.

For every endpoint:

1. Validate request
2. Authenticate
3. Authorize
4. Execute operation
5. Handle errors
6. Return consistent response

Write tests immediately.

Do not build all APIs and test at the end.

==================================================

# 70. PHASE 4 — FRONTEND FOUNDATION

==================================================

Build:

App shell
Navigation
Theme
Responsive layout
Design system
Toast
Modal
Loading states
Error states

Before building feature-heavy screens.

==================================================

# 71. PHASE 5 — CORE SAVE FLOW

==================================================

Implement:

Paste URL
→ validation
→ API
→ database
→ success
→ clear input
→ display Reel

This is the most important feature.

Make it exceptionally smooth.

==================================================

# 72. PHASE 6 — ORGANIZATION

==================================================

Implement:

Search
Tags
Categories
Favorites
Watched
Archive

Only after core save functionality is stable.

==================================================

# 73. PHASE 7 — POLISH

==================================================

Review every screen.

Ask:

Is anything unnecessary?

Is anything confusing?

Can one click become zero clicks?

Can a workflow be faster?

Are empty states useful?

Are loading states polished?

Are errors understandable?

==================================================

# 74. RALPH LOOP

==================================================

After every significant implementation:

R — Review requirements
A — Analyze implementation
L — Locate defects
P — Patch defects
H — Harden and improve

Repeat.

Do NOT stop after the first successful build.

==================================================

# 75. SELF-CRITIQUE LOOP

==================================================

At the end of every phase ask yourself:

1. What could break?
2. What assumption did I make?
3. What happens with invalid input?
4. What happens when the API fails?
5. What happens on mobile?
6. What happens with 10,000 records?
7. What happens with concurrent requests?
8. What happens if the user refreshes?
9. What happens if authentication expires?
10. What happens if Instagram changes its URL format?

Fix issues before proceeding.

==================================================

# 76. LOOPING IMPROVEMENT

==================================================

After the entire application works:

LOOP 1:
Functional correctness

LOOP 2:
Backend/security review

LOOP 3:
Database/query performance

LOOP 4:
UX review

LOOP 5:
Responsive/mobile review

LOOP 6:
Accessibility review

LOOP 7:
Visual polish

LOOP 8:
Code quality

LOOP 9:
Production readiness

Each loop must identify actual improvements.

Do not make pointless changes simply to claim iteration.

==================================================

# 77. "DO NOT OVERENGINEER" RULE

==================================================

Do not add:

AI features
social features
recommendation engines
video downloading
Instagram scraping
complex analytics
microservices
Kafka
Redis
GraphQL

unless there is a demonstrated requirement.

This is a focused productivity application.

Prefer:

simple
reliable
secure
maintainable

==================================================

# 78. FUTURE-READY ARCHITECTURE

==================================================

Although the MVP must remain simple, keep architecture extensible for:

- Browser extension
- Mobile application
- Native share sheet
- Telegram bot
- WhatsApp workflow where officially supported
- Chrome extension
- AI-based Reel classification
- Automatic tagging
- Smart summaries
- Reminder system

Do not implement these now.

Design clean APIs so they can be added later.

==================================================

# 79. DOCUMENTATION

==================================================

README must include:

Project overview
Features
Tech stack
Architecture
Setup
Environment variables
Database setup
Authentication setup
Development
Testing
Deployment
Security
API documentation
Future roadmap

Include architecture diagrams where useful.

==================================================

# 80. ENVIRONMENT VARIABLES

==================================================

Create:

.env.example

Never commit secrets.

Never hardcode:

API keys
database passwords
auth secrets
service-role keys

If Supabase is used, carefully distinguish:

public client keys
server/service-role keys

Never expose service-role credentials to the browser.

==================================================

# 81. GIT QUALITY

==================================================

Use clean commits.

Examples:

feat: add reel saving API
feat: add reel dashboard
feat: add tagging
fix: prevent duplicate reels
fix: secure reel authorization
test: add reel API coverage
refactor: improve reel query layer

Do not commit:

.env
secrets
build artifacts
node_modules
temporary files

==================================================

# 82. FINAL SECURITY AUDIT

==================================================

Before final completion:

Perform a complete security audit.

Check:

Authentication
Authorization
RLS
API validation
URL validation
XSS
CSRF
SQL injection
IDOR
Rate limiting
Secret exposure
Error leakage
Dependency vulnerabilities

Fix every HIGH or CRITICAL issue.

Document remaining LOW-risk issues.

==================================================

# 83. FINAL PERFORMANCE AUDIT

==================================================

Check:

Database indexes
API latency
N+1 queries
Bundle size
Image loading
Rendering performance
Caching
Pagination

Do not optimize based purely on assumptions.

Measure where possible.

==================================================

# 84. FINAL UX AUDIT

==================================================

Act as a first-time user.

Perform:

Open app
Create account
Save first Reel
Save duplicate Reel
Search
Favorite
Mark watched
Edit
Archive
Restore
Delete
Logout
Login again

Identify friction.

Fix it.

==================================================

# 85. FINAL MOBILE AUDIT

==================================================

Test at:

320px
375px
390px
430px

Check:

Save input
Cards
Navigation
Modals
Keyboard
Buttons
Search
Filters

No horizontal scrolling.

==================================================

# 86. FINAL DELIVERY CHECKLIST

==================================================

Do not declare completion until:

[ ] App runs
[ ] Production build succeeds
[ ] Authentication works
[ ] Database works
[ ] Save Reel works
[ ] Duplicate prevention works
[ ] Search works
[ ] Filtering works
[ ] Favorites work
[ ] Watched status works
[ ] Archive works
[ ] Delete works
[ ] Instagram redirect works
[ ] Mobile UI works
[ ] Dark mode works
[ ] Error handling works
[ ] Loading states work
[ ] Empty states work
[ ] API authorization works
[ ] RLS/security works where applicable
[ ] Tests pass
[ ] No critical security issues
[ ] No obvious console errors
[ ] No exposed secrets
[ ] README complete
[ ] .env.example exists
[ ] Production build succeeds

==================================================

# 87. FINAL PRODUCT QUALITY TEST

==================================================

Ask:

"If I discovered this application today, would it feel like a serious product?"

If the answer is no:

identify why.

Then improve it.

The final application should feel:

Simple enough to understand immediately.

Powerful enough to become someone's daily Reel-saving tool.

==================================================

# 88. IMPORTANT IMPLEMENTATION RULE

==================================================

Do not ask unnecessary questions.

When there is a reasonable engineering decision:

make the decision.

Document it.

Continue.

Only ask for clarification when the decision would fundamentally alter:

- architecture
- security
- cost
- data ownership
- user experience

==================================================

# 89. ANTIGRAVITY EXECUTION INSTRUCTION

==================================================

START NOW.

Step 1:
Inspect the existing project/repository.

Step 2:
Understand the current stack.

Step 3:
Create the project specification and architecture documentation.

Step 4:
Create the implementation plan.

Step 5:
Implement Phase 1.

Step 6:
Run tests.

Step 7:
Run the Ralph review loop.

Step 8:
Fix discovered issues.

Step 9:
Proceed to the next phase.

Continue this process until the application is production-ready.

Do NOT stop after creating a basic UI.

Do NOT give me only a mockup.

Build the actual functional application.

After each major phase, provide a concise progress report containing:

- What was implemented
- Files/components changed
- Tests performed
- Issues discovered
- Issues fixed
- Remaining work

At the end provide:

1. Final architecture
2. Tech stack
3. Database schema
4. API overview
5. Security summary
6. Test summary
7. Deployment instructions
8. Remaining limitations
9. Future roadmap

==================================================

# 90. FINAL RALPH LOOP

==================================================

Once you believe the application is complete:

DO NOT immediately stop.

Perform at least one final independent review as if another senior engineer received the codebase.

Look specifically for:

- Security vulnerabilities
- Bad API design
- Incorrect database constraints
- Race conditions
- Poor mobile UX
- Duplicate code
- Unnecessary complexity
- Accessibility problems
- Error handling gaps
- Performance problems
- Poor naming
- Dead code
- Console errors
- Environment/configuration problems

Fix everything reasonable.

Then run the full test suite again.

Only after the final verification should you declare:

REELVAULT PRODUCTION READY.
