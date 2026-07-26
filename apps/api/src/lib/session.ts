import type { FastifyReply, FastifyRequest } from "fastify";

const COOKIE = process.env.AUTH_COOKIE_NAME ?? "adam_session";

export async function setSessionCookie(
  reply: FastifyReply,
  token: string,
): Promise<void> {
  reply.setCookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30d
  });
}

export async function clearSessionCookie(reply: FastifyReply): Promise<void> {
  reply.clearCookie(COOKIE, { path: "/" });
}

export async function readRequestSession(
  req: FastifyRequest,
): Promise<import("./auth.js").SessionClaims | null> {
  const token = (req as { cookies?: Record<string, string> }).cookies?.[COOKIE];
  if (!token) return null;
  const { readSession } = await import("./auth.js");
  return readSession(token);
}
