# PRE-RELEASE & DEPLOYMENT CHECKLIST

Execute this pre-flight verification sequence prior to every production release or deployment.

---

## 1. Automated Quality & Security Gates

Run the verification commands locally or verify that GitHub Actions CI has passed:

```bash
# 1. Typecheck: Must exit with code 0 and zero warnings
npx tsc --noEmit

# 2. Automated Test Suite: All 27 tests must pass with 0 failures
npm test

# 3. Production Build: Both client and server must compile cleanly
npm run build

# 4. Dependency Security Audit: Must report 0 vulnerabilities
npm audit
```

---

## 2. Environment Variables & Production Secrets

- [ ] `NODE_ENV`: Set strictly to `production`.
- [ ] `JWT_SECRET`: Verify it is set to a cryptographically random string (min 32 characters, never dev default).
- [ ] `DATABASE_PATH`: Verify persistent volume path or remote database connection string.
- [ ] `VITE_ANALYTICS_ID`: Verify production privacy analytics tracking ID (if enabled).
- [ ] `.env`: Verify `.env` is absent from git tracking (`git ls-files .env` returns empty).

---

## 3. Deployment & Infrastructure Checks

- [ ] **HTTPS Redirection**: Test `curl -I -H "X-Forwarded-Proto: http" https://<domain>/api/health` returns HTTP 301.
- [ ] **Security Headers**: Verify `Strict-Transport-Security`, `Content-Security-Policy`, and `X-Frame-Options: DENY` on live URL.
- [ ] **Static Assets**: Verify `/robots.txt`, `/sitemap.xml`, and `/favicon.ico` resolve with HTTP 200.
- [ ] **404 Routing**: Verify `/nonexistent-route` displays the custom 404 page and returns HTTP status 404.

---

## 4. Documentation & Version Sync

- [ ] Update `docs/CHANGELOG.md` with new version header, release date, and bulleted changes.
- [ ] Update `docs/TASKS.md` marking completed deliverables as `[done]`.
- [ ] Tag git commit: `git tag -a v1.0.0 -m "Release v1.0.0"`.
