# API SPECIFICATION & CONTRACT: ReelVault

## 1. Response Standard Format

All API responses follow a strict envelope:

### Success (2xx):
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... } // optional pagination/timing metadata
}
```

### Error (4xx / 5xx):
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_REEL",
    "message": "This Reel is already in your vault.",
    "details": { ... } // optional validation errors
  }
}
```

## 2. Standard Error Codes
| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body or query parameters failed schema validation |
| 400 | `INVALID_INSTAGRAM_URL` | Provided URL is not a recognized Instagram Reel URL |
| 401 | `UNAUTHORIZED` | Missing, malformed, or expired authentication token |
| 403 | `FORBIDDEN` | Attempting to access an entity belonging to another user |
| 404 | `NOT_FOUND` | Reel, Category, or Tag not found |
| 409 | `DUPLICATE_REEL` | The specified Reel has already been saved by this user |
| 429 | `RATE_LIMITED` | Too many requests in time window |
| 500 | `INTERNAL_SERVER_ERROR` | Unhandled internal server error (sanitized message) |

---

## 3. Authentication Endpoints

### 3.1 Register
`POST /api/auth/register`
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "displayName": "Alex Dev"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "displayName": "Alex Dev"
      }
    }
  }
  ```

### 3.2 Login
`POST /api/auth/login`
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200):** Same user + token payload.

### 3.3 Current User
`GET /api/auth/me`
- **Header:** `Authorization: Bearer <token>`
- **Response (200):** User profile.

---

## 4. Reels Endpoints

### 4.1 Save Reel (Quick Save)
`POST /api/reels`
- **Header:** `Authorization: Bearer <token>`
- **Request:**
  ```json
  {
    "url": "https://www.instagram.com/reel/C3_aBcDeF/?igsh=XYZ",
    "title": "Clean Architecture Explained",     // optional
    "notes": "Reference this for project design", // optional
    "categoryId": "uuid",                         // optional
    "tags": ["architecture", "backend"]          // optional
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "instagramUrl": "https://www.instagram.com/reel/C3_aBcDeF/?igsh=XYZ",
      "canonicalUrl": "https://www.instagram.com/reel/C3_aBcDeF/",
      "instagramShortcode": "C3_aBcDeF",
      "title": "Clean Architecture Explained",
      "creatorUsername": null,
      "thumbnailUrl": null,
      "notes": "Reference this for project design",
      "categoryId": "uuid",
      "isFavorite": false,
      "isWatched": false,
      "isArchived": false,
      "tags": ["architecture", "backend"],
      "createdAt": "2026-10-07T18:00:00.000Z",
      "updatedAt": "2026-10-07T18:00:00.000Z"
    }
  }
  ```
- **Duplicate Response (409 Conflict):**
  ```json
  {
    "success": false,
    "error": {
      "code": "DUPLICATE_REEL",
      "message": "This Reel is already in your vault.",
      "existingReelId": "uuid"
    }
  }
  ```

### 4.2 Query / List Reels
`GET /api/reels`
- **Query Params:**
  - `q`: string (Search query against title, creator, notes, tags)
  - `status`: `all` | `unwatched` | `watched` (default: `all`)
  - `favorite`: boolean (`true` | `false`)
  - `archived`: boolean (`true` | `false`, default: `false`)
  - `categoryId`: string (UUID)
  - `tag`: string (Tag name)
  - `sort`: `newest` | `oldest` | `updated` | `alphabetical` (default: `newest`)
  - `limit`: number (default: 30, max: 100)
  - `cursor`: string (ISO timestamp cursor for pagination)
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [ ...reels ],
    "meta": {
      "total": 42,
      "nextCursor": "2026-10-07T17:30:00.000Z",
      "hasMore": true
    }
  }
  ```

### 4.3 Get Reel Details
`GET /api/reels/:id`
- **Response (200):** Reel object with category and tags.

### 4.4 Update Reel
`PATCH /api/reels/:id`
- **Request:**
  ```json
  {
    "title": "Updated Title",
    "notes": "Updated personal thoughts",
    "categoryId": "uuid-or-null",
    "tags": ["newtag", "othertag"]
  }
  ```
- **Response (200):** Updated reel object.

### 4.5 Toggle Actions
- `POST /api/reels/:id/favorite` -> Toggle `isFavorite` (200 OK)
- `POST /api/reels/:id/watched` -> Toggle `isWatched` + sets `watchedAt` (200 OK)
- `POST /api/reels/:id/archive` -> Toggle `isArchived` + sets `archivedAt` (200 OK)

### 4.6 Delete Reel
`DELETE /api/reels/:id`
- **Response (200):** `{ "success": true, "data": { "id": "..." } }`

---

## 5. Metadata & Organization Endpoints

### 5.1 Categories
- `GET /api/categories`: Returns user categories with reel counts.
- `POST /api/categories`: Creates `{ name, color }`.
- `DELETE /api/categories/:id`: Deletes category (reels set to null).

### 5.2 Tags
- `GET /api/tags`: Returns all unique user tags with counts.
- `POST /api/tags`: Normalizes and creates tag.
- `DELETE /api/tags/:id`: Deletes tag.

### 5.3 Stats
`GET /api/stats`
- Returns: `{ total, watched, unwatched, favorites, archived, topTags: [] }`.

### 5.4 Export
`GET /api/export?format=json|csv`
- Returns complete portable dump of user's vault data.
