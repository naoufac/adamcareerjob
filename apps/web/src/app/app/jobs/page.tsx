"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  source: string;
  postedAt?: string;
  _score?: number;
  _matched?: string[];
}

export default function JobSearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (loading) return <main className="p-8 text-slate-500">Chargement...</main>;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const search = async () => {
    if (!query.trim()) {
      setErr("Entrez un poste a rechercher.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (location) params.set("location", location);
      const data = await api<{ jobs: Job[] }>(`/api/jobs/search?${params}`);
      setJobs(data.jobs);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const scoreJob = async (job: Job) => {
    try {
      const data = await api<{ matchScore: number; matchedSkills: string[] }>(
        "/api/jobs/score",
        { method: "POST", json: { title: job.title, description: job.description } },
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, _score: data.matchScore, _matched: data.matchedSkills } : j)),
      );
    } catch {
      /* skip */
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <button
        onClick={() => router.push("/app")}
        className="mb-4 text-sm text-slate-500 hover:text-adam"
      >
        &larr; Tableau de bord
      </button>

      <h1 className="mb-1 text-2xl font-bold text-adam">Recherche d'offres</h1>
      <p className="mb-8 text-sm text-slate-500">
        Recherchez des offres canadiennes. Adam score chaque offre par rapport a
        votre profil.
      </p>

      <div className="mb-6 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="ex: Data Analyst"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-adam"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Ville (optionnel)"
          className="w-48 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-adam"
        />
        <button
          onClick={search}
          disabled={busy}
          className="rounded-lg bg-adam px-6 py-2 font-semibold text-white hover:bg-adam/90 disabled:opacity-50"
        >
          {busy ? "..." : "Rechercher"}
        </button>
      </div>

      {err && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">{job.title}</h3>
                <p className="text-sm text-slate-500">
                  {job.company} - {job.location}
                  {job.salary ? ` - ${job.salary}` : ""}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{job.description}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {job.source}
                  </span>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-adam hover:underline">
                      Voir l'offre &rarr;
                    </a>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {job._score != null ? (
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${job._score >= 70 ? "text-green-600" : job._score >= 40 ? "text-amber-600" : "text-red-500"}`}>
                      {job._score}%
                    </div>
                    <div className="text-xs text-slate-400">match</div>
                  </div>
                ) : (
                  <button
                    onClick={() => scoreJob(job)}
                    className="rounded-lg border border-adam px-3 py-1.5 text-xs font-medium text-adam hover:bg-adam/10"
                  >
                    Score
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
