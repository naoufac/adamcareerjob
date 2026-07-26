import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, schema } from "../db/client.js";
import { eq } from "drizzle-orm";
import { requireUser } from "./auth.js";
import { cvToText, coverLetterToText } from "../lib/export-text.js";
import type { CvJson } from "../db/schema.js";

const cvSchema = z.any();

export async function registerExportRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/export/cv/txt  -> ATS-safe plain text
  app.post("/export/cv/txt", async (req, reply) => {
    await requireUser(req);
    const body = cvSchema.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Invalid CV" });
    const text = cvToText(body.data as CvJson);
    reply.header("Content-Type", "text/plain; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="cv-adamjobs.txt"');
    return reply.send(text);
  });

  // POST /api/export/cover-letter/txt
  app.post("/export/cover-letter/txt", async (req, reply) => {
    await requireUser(req);
    const body = z.object({ text: z.string() }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "Invalid letter" });
    const text = coverLetterToText(body.data.text);
    reply.header("Content-Type", "text/plain; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="lettre-adamjobs.txt"');
    return reply.send(text);
  });

  // GET /api/applications/:id/export/:kind  -> full package text
  // kind: "cv" | "cover_letter"
  app.get("/applications/:id/export/:kind", async (req, reply) => {
    const me = await requireUser(req);
    const { id, kind } = req.params as { id: string; kind: string };
    const rows = await db.select().from(schema.applications).where(eq(schema.applications.id, id)).limit(1);
    const application = rows[0];
    if (!application || application.userId !== me.id) return reply.code(404).send({ error: "Not found" });

    if (kind === "cv") {
      const text = cvToText((application.cvVariantJson ?? {}) as CvJson);
      reply.header("Content-Type", "text/plain; charset=utf-8");
      reply.header("Content-Disposition", 'attachment; filename="cv-adamjobs.txt"');
      return reply.send(text);
    }
    if (kind === "cover_letter" || kind === "cover-letter") {
      const text = coverLetterToText(application.coverLetter ?? "");
      reply.header("Content-Type", "text/plain; charset=utf-8");
      reply.header("Content-Disposition", 'attachment; filename="lettre-adamjobs.txt"');
      return reply.send(text);
    }
    return reply.code(400).send({ error: "Unknown export kind" });
  });
}
