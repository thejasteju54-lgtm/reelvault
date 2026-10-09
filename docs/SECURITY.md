# SECURITY ARCHITECTURE & THREAT MODEL: ReelVault

## 1. Threat Matrix & Countermeasures

| Threat Vector | Severity | Attack Scenario | Implemented Countermeasure |
|---|---|---|---|
| **Insecure Direct Object Reference (IDOR)** | Critical | Attacker tries `GET /api/reels/<other_user_reel_id>` | 100% of SQL queries scope by `WHERE id = ? AND user_id = ?`. Queries never rely on `id` alone. |
| **SQL Injection** | Critical | Attacker injects `' OR 1=1 --` into URL or search term | Prepared statements with parameterized query placeholders (`?`) exclusively used across all query layers. No string concatenation. |
| **XSS & Protocol Hijack** | High | User saves `javascript:alert(1)` or `data:text/html,...` | Strict URL validation rejects anything not starting with `http://` or `https://` targeting Instagram hosts. React escapes HTML by default. |
| **Duplicate Race Condition** | High | User or bot fires parallel requests saving same shortcode | Hard unique constraint `UNIQUE(user_id, instagram_shortcode)`. Transaction catch handles code `SQLITE_CONSTRAINT` / `23505` returning clean `409 Conflict`. |
| **Mass Assignment** | High | Attacker sends `{ "user_id": "victim-id", "id": "admin" }` | Zod schemas whitelist allowed input fields explicitly. `user_id` is derived only from verified JWT payload. |
| **Credential Attacks** | High | Weak passwords / brute force attacks | Strong password policy enforcement, secure salt + PBKDF2/bcrypt hashing, and API rate-limiting. |
| **Denial of Service (DoS)** | Medium | Huge payload / body bomb or infinite query limits | Body size parser capped at `100kb`. Max pagination `limit` capped at 100. Global rate-limiting middleware (`express-rate-limit`). |
| **Information Leakage** | Medium | Server crashes and leaks stack traces or SQL errors | Centralized error handler catches all unhandled exceptions, logs internal details server-side, and returns sanitized generic error envelopes. |

## 2. HTTP Security Configuration
- **Helmet Middleware:** Enables `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **CORS Policy:** Restricted to origin domain, rejecting wildcard credentials.
- **Content Security Policy (CSP):** Disallows arbitrary inline script execution.
- **External Redirection Guard:** All external links to Instagram render with `rel="noopener noreferrer"` and target `_blank`.

## 3. Secret Management
- `.env.example` documents all required environment variables with non-sensitive placeholders.
- Secrets (`JWT_SECRET`, `SESSION_SECRET`) are read at runtime and rejected if missing or default in production environments.
