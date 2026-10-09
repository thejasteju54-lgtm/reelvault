# Security Architecture & Threat Model: ReelVault

## 1. Security Principles
ReelVault is built with a zero-trust model for all client inputs. Authentication identity is resolved strictly through cryptographically verified JWT tokens, and multi-tenant isolation is enforced at both the API layer and the database layer (via Row-Level Security).

---

## 2. Threat Modeling & Mitigation (STRIDE)

| Threat | Description | Mitigation Strategy |
|---|---|---|
| **Spoofing** | Attacker impersonates another user to read/write reels | Supabase Auth issuing RS256/HS256 signed JWTs with short expiry. Server validates claims on every API route. |
| **Tampering** | User modifies request payload to set `user_id` of victim | Server discards any client-supplied `user_id` and injects `auth.uid()` from the verified session context. |
| **Repudiation** | User denies performing destructive deletions | Cascade tracking with optional audit logs for destructive actions. |
| **Information Disclosure** | User A reads User B's private reels | PostgreSQL Row-Level Security (RLS) policies enforce `USING (auth.uid() = user_id)` at the database engine level. |
| **Denial of Service** | Malicious script spams API with saves or requests | Rate limiting on API routes (60 req/min per IP/token) and payload size limit (max 100KB). |
| **Elevation of Privilege** | User attempts to access admin endpoints | No administrative bypass exists on user content; service-role keys are kept strictly on the backend. |

---

## 3. Specific Vulnerability Protections

### A. SSRF (Server-Side Request Forgery) Defense
When fetching optional metadata from Instagram links:
1. Validate scheme is strictly `https:`.
2. Host must strictly match `instagram.com` or `www.instagram.com`.
3. Disallow redirects to private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254`).
4. Apply a strict request timeout of 3000ms.

### B. URL Injection & Parsing
Instagram URLs are parsed using strict regular expressions to isolate the alphanumeric shortcode:
- Valid format: `https://(www\.)?instagram\.com/(reel|reels|p)/([A-Za-z0-9_-]+)`
- Strips any suspicious query parameters or javascript URI schemes (`javascript:` is strictly rejected).

### C. Stored XSS Prevention
- All user-entered titles, notes, and tag names are sanitized before storage and rendered safely using React's default text node encoding.
- No `dangerouslySetInnerHTML` is used.

### D. Multi-Tenant Isolation Verification Rule
A mandatory test is defined:
1. User A saves Reel `X`.
2. User B attempts `GET /api/reels/:id_of_X` -> Must return `404 Not Found` (never `403` to prevent ID enumeration).
3. User B attempts `PATCH /api/reels/:id_of_X` -> Must return `404 Not Found`.
4. User B attempts `DELETE /api/reels/:id_of_X` -> Must return `404 Not Found`.
