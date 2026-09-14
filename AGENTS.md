# Longhorn Publishers Cameroon — Agent Operating Rules

## Delivery control

- Keep implementation work local by default.
- Do **not** create Git commits, push to GitHub, trigger a deployment, or use deployment tooling unless the user explicitly asks for that action in the current request.
- When the user asks for a commit, create a focused local commit only. Never push as a follow-on action: a push requires a separate explicit user instruction, even when the commit was requested in the same conversation.
- Continuous deployment is managed by the user after an explicitly requested push.
- Verify changes locally with the relevant build and tests, then move the related shared-board task to `review` for user verification.
