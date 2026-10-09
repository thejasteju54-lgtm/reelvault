# Workflow: /review

Use this workflow to perform a systematic code review before committing or creating a pull request.

## Checklist
1. **Security**: Check for secrets, SQL injection risks, and IDOR isolation (`WHERE user_id = ?`).
2. **Types & Lint**: Verify `npx tsc --noEmit` exits with 0 errors.
3. **Design Tokens**: Ensure no raw hex colors or inline pixel spacings were added in UI components.
4. **Out of Scope**: Confirm changes do not implement any feature on the "What we will NOT build" list in `AGENTS.md`.
5. **Tests**: Run `npm test` and verify 100% of tests pass.
