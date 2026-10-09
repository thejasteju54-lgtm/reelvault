# CONTRIBUTING GUIDELINES & COMMIT HYGIENE

Welcome to the ReelVault contributor guide. Please follow these conventions for all pull requests and git commits.

---

## 1. Conventional Commits Specification

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. This ensures clean changelogs, automated semantic releases, and clear git bisect tracking.

### Format
```
<type>(<optional scope>): <description in imperative present tense>
```

### Supported Types
- **`feat`**: A new user-facing feature or enhancement (e.g., `feat(reels): add batch tagging shortcut`).
- **`fix`**: A bug fix (e.g., `fix(parser): resolve shortcode extraction on localized URLs`).
- **`docs`**: Documentation changes only (e.g., `docs(prd): add out of scope boundaries`).
- **`style`**: Code style/formatting changes that do not affect runtime behavior.
- **`refactor`**: Code reorganization with zero behavior or API changes.
- **`test`**: Adding or repairing automated tests.
- **`chore`**: Maintenance tasks, dependencies, or configuration changes.

### Atomic Commits Rule
- Each commit must represent a single logical change.
- Never bundle unrelated tasks (e.g., do not combine a bug fix with an unrelated styling change).
- Run `npm test` and `npm run build` prior to proposing a commit.

---

## 2. Pull Request & Branch Workflow

1. Create a descriptive branch from `main`:
   ```bash
   git checkout -b feat/batch-import
   # or
   git checkout -b fix/mobile-nav-tap-target
   ```
2. Commit your atomic changes following Conventional Commits.
3. Open a Pull Request targeting `main`.
4. Ensure all automated GitHub Actions CI checks pass (TypeScript typecheck, build, test suite).
5. Require at least one approving code review before merging.
