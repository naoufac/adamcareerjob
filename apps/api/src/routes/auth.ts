import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { db, schema } from "../db/client.js";
import { hashPassword, verifyPassword, issueSession } from "../lib/auth.js";
import {
  setSessionCookie,
  clearSessionCookie,
  readRequestSession,
} from "../lib/session.js";
import { eq } from "drizzle-orm";

const registerBody = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(8).max(200),
  name: z.string().max(120).optional(),
});

const loginBody = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(1).max(200),
});

export class Unauthorized extends Error {
  statusCode = 401;
  constructor() {
    super("Not authenticated");
    this.name = "Unauthorized";
  }
}

export async function requireUser(
  req: FastifyRequest,
): Promise<{ id: string; email: string }> {
  const claims = await readRequestSession(req);
  if (!claims) throw new Unauthorized();
  return { id: claims.sub, email: claims.email };
}

export default async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/auth/register", async (req, reply) => {
    const parsed = registerBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { email, password, name } = parsed.data;

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return reply.code(409).send({ error: "Email already registered" });
    }

    const [user] = await db
      .insert(schema.users)
      .values({
        email,
        passwordHash: await hashPassword(password),
        name: name ?? null,
      })
      .returning({ id: schema.users.id, email: schema.users.email });

    await db
      .insert(schema.masterProfiles)
      .values({ userId: user.id })
      .onConflictDoNothing();

    const token = await issueSession({ sub: user.id, email: user.email });
    await setSessionCookie(reply, token);
    return reply.code(201).send({ user: { id: user.id, email: user.email, name } });
  });

  app.post("/auth/login", async (req, reply) => {
    const parsed = loginBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid credentials" });
    }
    const { email, password } = parsed.data;

    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    const user = rows[0];
    // Constant-ish time path: always hash-check, even if user missing.
    const ok = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, "$argon2id$v=19$m=19456,t=2,p=1$abcd");
    if (!user || !ok) {
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    const token = await issueSession({ sub: user.id, email: user.email });
    await setSessionCookie(reply, token);
    return reply.send({ user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post("/auth/logout", async (_req, reply) => {
    await clearSessionCookie(reply);
    return reply.send({ ok: true });
  });
}
