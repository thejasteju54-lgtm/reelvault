# Workflow: /release-check

Pre-flight checklist to execute before cutting a release or deploying to production.

## 1. Quality Gates
- [ ] `npm test` passes with 0 failures across all test suites.
- [ ] `npx tsc --noEmit` exits with code 0.
- [ ] `npm audit` reports 0 high/critical vulnerabilities.
- [ ] `npm run build` succeeds cleanly with zero bundle warnings.

## 2. Environment & Security Gates
- [ ] `JWT_SECRET` is set to a cryptographically strong secret (>= 32 characters) in production environment variables.
- [ ] Database path is configured to a persistent volume or remote database instance.
- [ ] Rate limits and security headers (HSTS, CSP, X-Frame-Options) are verified active.

## 3. Documentation & Verification
- [ ] `docs/CHANGELOG.md` updated with release notes and version bump.
- [ ] `docs/TASKS.md` updated to reflect completed deliverables.
