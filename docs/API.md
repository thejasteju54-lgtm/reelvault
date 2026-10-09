# API Specification & Contract: ReelVault

## 1. Overview
The ReelVault API provides clean, secure REST endpoints. All mutation requests enforce JWT authentication and rate limiting. Responses adhere to a standardized JSON envelope.

---

## 2. Global Response Conventions

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 128,
    "hasMore": true
  }
}
```

### Error Response Envelope
```json
{
  "error": {
    "code": "DUPLICATE_REEL",
    "message": "This Reel has already been saved.",
    "details": {
      "existingId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    }
  }
}
```

---

## 3. Standard Error Codes
| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or expired authentication token |
| `FORBIDDEN` | 403 | Attempt to access resource outside user scope |
| `NOT_FOUND` | 404 | Reel, category, or tag not found |
| `INVALID_URL` | 400 | URL does not match valid Instagram Reel pattern |
| `VALIDATION_ERROR`| 400 | Payload failed schema validation |
| `DUPLICATE_REEL` | 409 | Shortcode already saved by current user |
| `RATE_LIMITED` | 429 | Exceeded request limit |
| `INTERNAL_ERROR` | 500 | Unexpected server error (sanitized) |

---

## 4. Endpoints

### 4.1. Save Reel
- **Method:** `POST /api/reels`
- **Request Body:**
```json
{
  "url": "https://www.instagram.com/reel/C3b4Xyz890_/?igsh=MW...",
  "title": "Optional Title",
  "notes": "Key takeaways or idea.",
  "categoryId": "uuid",
  "tagNames": ["ai", "python"]
}
```
- **Responses:**
  - `201 Created`: Reel successfully saved.
  - `400 Bad Request`: `INVALID_URL` or missing parameters.
  - `409 Conflict`: `DUPLICATE_REEL` with `existingId` returned.

### 4.2. List Reels
- **Method:** `GET /api/reels`
- **Query Parameters:**
  - `search` (string): Search query against title, notes, creator.
  - `categoryId` (UUID): Filter by category.
  - `tag` (string): Filter by tag name.
  - `status` (`all` | `unwatched` | `watched` | `favorites` | `archived`): Default `all` (excluding archived).
  - `limit` (integer, default 20, max 50).
  - `cursor` or `page` (integer, default 1).
  - `sortBy` (`newest` | `oldest` | `favorite`).

### 4.3. Update Reel
- **Method:** `PATCH /api/reels/:id`
- **Request Body:**
```json
{
  "title": "Updated title",
  "notes": "Updated notes",
  "categoryId": "uuid",
  "isFavorite": true,
  "isWatched": true,
  "isArchived": false,
  "tagNames": ["engineering"]
}
```

### 4.4. Delete Reel
- **Method:** `DELETE /api/reels/:id`
- **Response:** `204 No Content`

### 4.5. Taxonomy Endpoints
- `GET /api/categories` & `POST /api/categories` & `DELETE /api/categories/:id`
- `GET /api/tags` & `DELETE /api/tags/:id`
- `GET /api/stats` - Returns counts: `{ total: 42, unwatched: 12, favorites: 8, categoriesCount: 4 }`
- `GET /api/export` - Returns complete JSON/CSV export of user's vault.
