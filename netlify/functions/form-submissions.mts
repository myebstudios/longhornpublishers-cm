import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";
import { requireAdmin } from "./_shared/auth";
import { createInboxHandler } from "./_shared/inbox-api";
export default createInboxHandler({
  db: getDatabase(),
  authorize: requireAdmin,
});
export const config: Config = { path: "/api/form-submissions-admin" };
