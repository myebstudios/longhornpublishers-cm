# Longhorn Publishers Cameroon — Agent Operating Rules

## Delivery control

- Keep implementation work local by default.
- Do **not** create Git commits, push to GitHub, trigger a deployment, or use deployment tooling unless the user explicitly asks for that action in the current request.
- Continuous deployment is managed by the user after an explicitly requested push.
- Verify changes locally with the relevant build and tests, then move the related shared-board task to `review` for user verification.
