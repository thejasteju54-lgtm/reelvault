# Phase 3: API & Service Layer Plan

## Objective
Build the backend service layer, URL normalization engine, validation schemas, pagination logic, and standard error handling to interface safely with Supabase. Ensure strict adherence to the API Specification.

## Inputs
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `src/types/database.ts`
- `src/lib/supabase.ts`

## Key Requirements & Gates
1. **URL Normalization**: Robust parsing of Instagram Reel URLs to extract the canonical shortcode, stripping all query parameters.
2. **Validation**: Use Zod to enforce strict schema validation for all inputs (URL, title, notes, tags) before they reach Supabase.
3. **Error Handling**: Catch Supabase errors and map them to standard application error codes (`DUPLICATE_REEL`, `INVALID_URL`, etc.).
4. **Service Abstraction**: Create service methods for Save, List, Update, and Delete operations for Reels and Taxonomies.
5. **Pagination**: Implement cursor/page-based queries in the List operations as per `API.md`.

## Execution Plan & Tasks

### Task 3.1: Core Utilities (URL & Validation)
- **Files**: 
  - `src/utils/url.ts`: `normalizeInstagramUrl` function to parse, strip query params, and extract shortcode.
  - `src/utils/validation.ts`: Zod schemas for Reel input, updates, and query params.
- **Scope**: Implement and unit test URL extraction regex and Zod schemas.

### Task 3.2: Error Handling Standardization
- **File**: `src/utils/errors.ts`
- **Scope**: Define standard `ApiError` class and a mapper function that translates Supabase Postgres errors (e.g., duplicate key constraint violations) into standardized application error objects matching `API.md`.

### Task 3.3: Reels Service Layer
- **File**: `src/services/reels.ts`
- **Scope**: 
  - `saveReel(payload)`: Validate payload, extract shortcode, insert into `reels` table, handle duplicates gracefully.
  - `listReels(filters, pagination)`: Construct Supabase queries with filtering (search, category, tags, status) and pagination logic.
  - `updateReel(id, payload)`: Validate and execute `PATCH`.
  - `deleteReel(id)`: Execute `DELETE`.

### Task 3.4: Taxonomy & Stats Service Layer
- **File**: `src/services/taxonomy.ts`
- **Scope**:
  - `getCategories()`, `getTags()`
  - `getStats()`: Aggregate count queries for total, unwatched, favorites, etc.

## Verification Protocol
1. **Unit Tests**: `tests/url-normalization.test.ts` passes for valid/invalid Instagram URLs.
2. **Validation Tests**: `tests/validation.test.ts` ensures schemas reject invalid data.
3. **Service Tests**: `tests/services.test.ts` verifies duplicate errors are correctly mapped to `DUPLICATE_REEL` error code.
4. **Build Check**: `tsc && vite build` completes without TypeScript errors.
