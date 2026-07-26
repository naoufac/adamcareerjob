import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireUser } from "./auth.js";
import { db, schema } from "../db/client.js";
import { eq } from "drizzle-orm";

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  source: string;
  postedAt?: string;
}

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

export async function registerJobRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/jobs/search?q=data+analyst&location=Toronto
  app.get("/jobs/search", async (req) => {
    await requireUser(req);
    const q = req.query as { q?: string; location?: string };
    const query = z.string().max(200).parse(q.q ?? "");
    const location = z.string().max(200).optional().parse(q.location);

    let jobs: JobResult[] = [];

    if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
      jobs = await searchAdzunaCA(query, location).catch((e) => {
        req.log.warn({ err: String(e) }, "adzuna search failed, falling back");
        return [];
      });
    }

    if (jobs.length === 0) {
      jobs = await searchViaLlm(query, location, req);
    }

    return { jobs, source: jobs[0]?.source ?? "none" };
  });

  // POST /api/jobs/:sourceId/score  -> score a job against the user's master CV
  app.post("/jobs/score", async (req, reply) => {
    const me = await requireUser(req);
    const body = z.object({
      title: z.string(),
      description: z.string(),
    }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

    const profileRows = await db
      .select({ cvJson: schema.masterProfiles.cvJson, preferenceVector: schema.masterProfiles.preferenceVector })
      .from(schema.masterProfiles)
      .where(eq(schema.masterProfiles.userId, me.id))
      .limit(1);
    const profile = profileRows[0];
    const skills = profile?.cvJson?.coreCompetencies ?? [];
    const prefs = profile?.preferenceVector ?? {};

    const text = `${body.data.title} ${body.data.description}`.toLowerCase();
    const matched = skills.filter((s) => text.includes(s.toLowerCase()));
    const skillScore = skills.length > 0 ? Math.round((matched.length / skills.length) * 100) : 0;

    // Boost by preference weights for matched terms
    let prefBoost = 0;
    for (const m of matched) {
      prefBoost += prefs[m.toLowerCase()] ?? 0;
    }
    const matchScore = Math.min(100, skillScore + Math.round(prefBoost * 10));

    return {
      matchScore,
      matchedSkills: matched,
      totalSkills: skills.length,
    };
  });
}

async function searchAdzunaCA(query: string, location?: string): Promise<JobResult[]> {
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID!,
    app_key: ADZUNA_APP_KEY!,
    what: query,
    country: "ca",
    max_age: "14",
    results_per_page: "10",
  });
  if (location) params.set("where", location);

  const url = `https://api.adzuna.com/v1/api/jobs/ca/search/1?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Adzuna ${res.status}`);
  const data = (await res.json()) as { results?: Array<Record<string, unknown>> };

  return (data.results ?? []).map((r) => {
    const company = r.company as Record<string, unknown> | undefined;
    const location = r.location as Record<string, unknown> | undefined;
    return {
      id: String(r.id ?? ""),
      title: String(r.title ?? ""),
      company: String(company?.display_name ?? ""),
      location: String(location?.display_name ?? ""),
      description: String(r.description ?? ""),
      url: String(r.redirect_url ?? ""),
      salary: r.salary_min ? `$${r.salary_min}` : undefined,
      source: "adzuna",
      postedAt: r.created ? String(r.created) : undefined,
    };
  });
}

async function searchViaLlm(
  query: string,
  location: string | undefined,
  req: { log: { warn: (m: unknown) => void } },
): Promise<JobResult[]> {
  req.log.warn("no Adzuna API key configured; using LLM knowledge as job-search fallback");
  const { chatJson } = await import("../lib/llm.js");
  const locale = "en";
  const data = await chatJson(
    [
      {
        role: "system",
        content: `You are a Canadian job market assistant. Based on your knowledge, suggest 5 real or realistic Canadian job postings matching the query. Return ONLY JSON: {"jobs":[{"title","company","location","description","url","salary"}]}. Use real Canadian companies when possible. Mark url as "" if unknown. Keep descriptions to 2-3 sentences.`,
      },
      { role: "user", content: `Role: ${query}\nLocation: ${location ?? "Canada"}\nLanguage: ${locale}` },
    ],
    z.object({
      jobs: z.array(z.object({
        title: z.string(),
        company: z.string(),
        location: z.string(),
        description: z.string(),
        url: z.string().optional(),
        salary: z.string().optional(),
      })),
    }),
    { maxTokens: 4000, temperature: 0.5 },
  ).catch(() => ({ jobs: [] }));

  return data.jobs.map((j, i) => ({
    id: `llm-${i}`,
    title: j.title,
    company: j.company,
    location: j.location,
    description: j.description,
    url: j.url ?? "",
    salary: j.salary,
    source: "ai-knowledge",
  }));
}
