import type { FastifyInstance } from "fastify";
import { db, schema } from "../db/client.js";
import { eq } from "drizzle-orm";
import { readRequestSession } from "../lib/session.js";
import { requireUser, Unauthorized } from "./auth.js";

export default async function meRoutes(app: FastifyInstance): Promise<void> {
  app.get("/me", async (req) => {
    const claims = await readRequestSession(req);
    if (!claims) throw new Unauthorized();
    const rows = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        locale: schema.users.locale,
      })
      .from(schema.users)
      .where(eq(schema.users.id, claims.sub))
      .limit(1);
    const u = rows[0];
    if (!u) throw new Unauthorized();
    return { user: u };
  });

  app.get("/me/profile", async (req) => {
    const me = await requireUser(req);
    const rows = await db
      .select()
      .from(schema.masterProfiles)
      .where(eq(schema.masterProfiles.userId, me.id))
      .limit(1);
    const profile = rows[0];
    return {
      onboarded: Boolean(profile?.onboardedAt),
      cv: profile?.cvJson ?? null,
      writingStyle: profile?.writingStyle ?? null,
    };
  });
}
