# Longhorn Publishers Cameroon — Agent Operating Rules

## Delivery control

- Standing user approval (2026-09-14): agents may complete implementation, create focused commits, push reviewed release-ready work to `main`, and allow the resulting continuous deployment without requesting per-change approval. Report each production change.
- Keep commits focused; never include unrelated working-tree changes.
- Verify changes locally with the relevant build and tests before release, then move the related shared-board task to `review` for user verification.
