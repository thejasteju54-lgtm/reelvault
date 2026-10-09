# Workflow: /commit

Use this workflow to stage and commit atomic, single-purpose changes using Conventional Commits.

## Steps
1. Run `git status` to identify modified and untracked files.
2. Select only files directly related to a single task or fix (do not commit unrelated scratch files).
3. Draft a commit message following the format:
   - `feat(scope): concise description in imperative mood`
   - `fix(scope): concise description of bug fix`
   - `docs(scope): documentation update`
   - `refactor(scope): internal code restructuring`
   - `test(scope): addition or repair of test suites`
4. Show the diff summary to the user before running `git commit`.
5. Never execute `git push` without explicit user permission.
