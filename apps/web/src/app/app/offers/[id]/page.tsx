"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8781";
import { DiffReview, type Change } from "@/components/diff-review";
import { CvScorecard, type Scores } from "@/components/scorecard";
import { CoverLetterCard } from "@/components/cover-letter";

interface Offer {
  id: string;
  raw: string;
  parsedJson: {
    title?: string;
    company?: string;
    location?: string;
    workMode?: string;
    mustHaveSkills?: string[];
    niceToHaveSkills?: string[];
    responsibilities?: string[];
    language?: string;
    salary?: string;
  };
  companyResearch?: {
    name?: string;
    sector?: string;
    size?: string;
    mission?: string;
    values?: string[];
    notes?: string;
  };
  atsScore?: number;
}

interface AdaptResult {
  applicationId: string;
  variant: Record<string, unknown>;
  coverLetter: string;
  notes: string;
  changes: Change[];
  scores: Scores;
  baseCv: Record<string, unknown>;
}

export default function OfferDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [adapt, setAdapt] = useState<AdaptResult | null>(null);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [finalized, setFinalized] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (!params.id) return;
    api<{ offer: Offer }>(`/api/offers/${params.id}`)
      .then((d) => setOffer(d.offer))
      .catch((e) => setErr(e.message));
  }, [params.id]);

  if (loading || !offer) return <main className="p-8 text-slate-500">Chargement...</main>;

  const doResearch = async () => {
    setBusy("research");
    setErr("");
    try {
      await api(`/api/offers/${params.id}/research`, { method: "POST", json: {} });
      const d = await api<{ offer: Offer }>(`/api/offers/${params.id}`);
      setOffer(d.offer);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy("");
    }
  };

  const doAdapt = async () => {
    setBusy("adapt");
    setErr("");
    try {
      const data = await api<AdaptResult>(`/api/offers/${params.id}/adapt`, {
        method: "POST",
        json: {},
      });
      setAdapt(data);
      setCoverLetter(data.coverLetter);
      setAccepted(new Set(data.changes.map((c) => c.id)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur d'adaptation");
    } finally {
      setBusy("");
    }
  };

  const acceptAll = () => {
    if (adapt) setAccepted(new Set(adapt.changes.map((c) => c.id)));
  };
  const rejectAll = () => setAccepted(new Set());
  const toggle = (id: string) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const finalize = async () => {
    if (!adapt) return;
    setBusy("finalize");
    setErr("");
    try {
      await api(`/api/applications/${adapt.applicationId}/accept`, {
        method: "POST",
        json: {
          acceptedChangeIds: [...accepted],
          changes: adapt.changes,
          coverLetter,
        },
      });
      setFinalized(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy("");
    }
  };

  const p = offer.parsedJson;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <button
        onClick={() => router.push("/app")}
        className="mb-4 text-sm text-slate-500 hover:text-adam"
      >
        &larr; Tableau de bord
      </button>

      {/* Offer summary */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          {p.title ?? "Offre sans titre"}
        </h1>
        <p className="text-slate-600">
          {[p.company, p.location, p.workMode].filter(Boolean).join(" - ")}
        </p>
        {p.salary && <p className="mt-1 text-sm text-slate-500">{p.salary}</p>}

        {p.mustHaveSkills && p.mustHaveSkills.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Competences requises
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {p.mustHaveSkills.map((s, i) => (
                <span key={i} className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {p.niceToHaveSkills && p.niceToHaveSkills.length > 0 && (
          <div className="mt-2">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Atouts
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {p.niceToHaveSkills.map((s, i) => (
                <span key={i} className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Company research */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Recherche entreprise
          </h2>
          {!offer.companyResearch?.name && (
            <button
              onClick={doResearch}
              disabled={busy === "research"}
              className="rounded-lg border border-adam px-3 py-1.5 text-sm font-medium text-adam hover:bg-adam/10 disabled:opacity-50"
            >
              {busy === "research" ? "..." : "Rechercher"}
            </button>
          )}
        </div>
        {offer.companyResearch?.name ? (
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            {offer.companyResearch.sector && <p>Secteur: {offer.companyResearch.sector}</p>}
            {offer.companyResearch.size && <p>Taille: {offer.companyResearch.size}</p>}
            {offer.companyResearch.mission && <p>Mission: {offer.companyResearch.mission}</p>}
            {offer.companyResearch.notes && <p className="text-slate-500">{offer.companyResearch.notes}</p>}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Adam recherche l'entreprise pour mieux adapter votre candidature.
          </p>
        )}
      </div>

      {err && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>
      )}

      {/* Adapt action */}
      {!adapt && (
        <button
          onClick={doAdapt}
          disabled={busy === "adapt"}
          className="mb-6 w-full rounded-xl bg-adam py-4 text-lg font-bold text-white shadow-sm hover:bg-adam/90 disabled:opacity-50"
        >
          {busy === "adapt" ? "Adam adapte votre CV..." : "Adapter mon CV et ma lettre"}
        </button>
      )}

      {/* Diff review */}
      {adapt && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex gap-3">
                <button onClick={acceptAll} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700">
                  Tout accepter
                </button>
                <button onClick={rejectAll} className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                  Tout refuser
                </button>
              </div>
              <span className="text-sm text-slate-500">
                {accepted.size}/{adapt.changes.length} acceptees
              </span>
            </div>

            {adapt.changes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Aucun changement. Le CV est deja optimal pour cette offre.
              </div>
            ) : (
              <DiffReview changes={adapt.changes} accepted={accepted} onToggle={toggle} />
            )}

            <CoverLetterCard
              value={coverLetter}
              onChange={setCoverLetter}
            />

            <button
              onClick={finalize}
              disabled={busy === "finalize"}
              className="w-full rounded-xl bg-adam py-3 font-bold text-white hover:bg-adam/90 disabled:opacity-50"
            >
              {busy === "finalize" ? "Finalisation..." : "Finaliser ma candidature"}
            </button>

            {finalized && adapt && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                <h3 className="mb-3 font-semibold text-green-800">
                  Candidature finalisee
                </h3>
                <p className="mb-4 text-sm text-green-700">
                  Telechargez vos documents. Adam apprend de vos choix pour les
                  prochaines adaptations.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`${apiBase}/applications/${adapt.applicationId}/export/cv`}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    CV (TXT)
                  </a>
                  <a
                    href={`${apiBase}/applications/${adapt.applicationId}/export/cover_letter`}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Lettre (TXT)
                  </a>
                  <button
                    onClick={() => router.push("/app")}
                    className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                  >
                    Retour au tableau de bord
                  </button>
                </div>
              </div>
            )}
          </div>

          <CvScorecard scores={adapt.scores} />
        </div>
      )}
    </main>
  );
}
