"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { CvScorecard, type Scores } from "@/components/scorecard";
import { CvPreview } from "@/components/cv-preview";

interface CvData {
  contact?: { name?: string; email?: string; phone?: string; location?: string };
  summary?: string;
  coreCompetencies?: string[];
  experience?: {
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    bullets?: string[];
  }[];
  education?: { institution?: string; degree?: string; field?: string }[];
  languages?: { name: string; level: string }[];
}

interface BuildResult {
  cv: CvData;
  questions: string[];
  scores: Scores;
}

export default function BuilderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [targetRole, setTargetRole] = useState("");
  const [answers, setAnswers] = useState("");
  const [phase, setPhase] = useState<"input" | "result">("input");
  const [questions, setQuestions] = useState<string[]>([]);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (loading) return <main className="p-8 text-slate-500">Chargement...</main>;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const runInterview = async () => {
    setErr("");
    setBusy(true);
    try {
      const seed = {
        targetRole: targetRole || undefined,
        name: user.name || undefined,
        email: user.email,
      };
      const data = await api<{ questions: string[] }>("/api/cv/build", {
        method: "POST",
        json: { phase: "interview", seed, locale },
      });
      setQuestions(data.questions);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const buildCv = async () => {
    setErr("");
    setBusy(true);
    try {
      const answersMap: Record<string, string> = {};
      if (answers.trim()) {
        const lines = answers.split("\n").filter((l) => l.trim());
        lines.forEach((l, i) => {
          const idx = Math.min(i, questions.length - 1);
          answersMap[`q${idx}`] = l;
        });
      }
      answersMap["name"] = user.name || "";
      answersMap["email"] = user.email;
      answersMap["targetRole"] = targetRole;

      const data = await api<BuildResult>("/api/cv/build", {
        method: "POST",
        json: { phase: "build", answers: answersMap, targetRole, locale },
      });
      setResult(data);
      setPhase("result");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur de generation");
    } finally {
      setBusy(false);
    }
  };

  const revalidate = async (cv: CvData) => {
    const scores = await api<Scores>("/api/cv/validate", {
      method: "POST",
      json: cv,
    });
    setResult((r) => (r ? { ...r, cv, scores } : r));
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <button
        onClick={() => router.push("/app")}
        className="mb-4 text-sm text-slate-500 hover:text-adam"
      >
        &larr; Tableau de bord
      </button>

      <h1 className="mb-1 text-2xl font-bold text-adam">
        Constructeur de CV canadien
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        Adam genere un CV conforme aux standards canadiens. Score de conformite
        et ATS en temps reel.
      </p>

      {phase === "input" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Langue du CV
                </label>
                <div className="flex gap-2">
                  {(["fr", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                        locale === l
                          ? "border-adam bg-adam/10 text-adam"
                          : "border-slate-300 text-slate-500"
                      }`}
                    >
                      {l === "fr" ? "Francais" : "Anglais"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Poste vise (optionnel)
                </label>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="ex: Data Analyst"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-adam"
                />
              </div>
            </div>

            <button
              onClick={runInterview}
              disabled={busy}
              className="rounded-lg border border-adam bg-adam/10 px-4 py-2 text-sm font-semibold text-adam disabled:opacity-50"
            >
              {busy ? "..." : "1. Generer les questions d'Adam"}
            </button>
          </div>

          {questions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Repondez a Adam
              </h2>
              <ol className="mb-4 list-inside list-decimal space-y-1 text-sm text-slate-700">
                {questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Vos reponses (une par ligne, dans l&apos;ordre)
              </label>
              <textarea
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
                rows={8}
                placeholder={`${questions[0] ?? ""}\n...`}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-adam"
              />
              <button
                onClick={buildCv}
                disabled={busy}
                className="mt-3 w-full rounded-lg bg-adam py-2.5 font-semibold text-white hover:bg-adam/90 disabled:opacity-50"
              >
                {busy ? "Generation en cours..." : "2. Generer mon CV canadien"}
              </button>
            </div>
          )}

          {err && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </p>
          )}
        </div>
      )}

      {phase === "result" && result && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <CvPreview cv={result.cv} onChange={revalidate} />
            <button
              onClick={() => setPhase("input")}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Refaire
            </button>
          </div>
          <CvScorecard scores={result.scores} />
        </div>
      )}
    </main>
  );
}
