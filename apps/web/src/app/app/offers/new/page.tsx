"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface ParsedOffer {
  id: string;
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
}

export default function NewOfferPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (loading) return <main className="p-8 text-slate-500">Chargement...</main>;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const submit = async () => {
    if (text.trim().length < 50) {
      setErr("Collez au moins 50 caracteres de l'offre.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const data = await api<{ offer: ParsedOffer["parsedJson"] & { id: string } }>(
        "/api/offers",
        { method: "POST", json: { text } },
      );
      router.push(`/app/offers/${data.offer.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={() => router.push("/app")}
        className="mb-4 text-sm text-slate-500 hover:text-adam"
      >
        &larr; Tableau de bord
      </button>

      <h1 className="mb-1 text-2xl font-bold text-adam">
        Nouvelle offre d'emploi
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        Collez le texte de l'offre. Adam l'analyse, recherche l'entreprise, puis
        adapte votre CV et votre lettre.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Texte de l'offre
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Collez ici toute l'offre d'emploi..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-adam"
        />
        {err && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {err}
          </p>
        )}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-3 w-full rounded-lg bg-adam py-2.5 font-semibold text-white hover:bg-adam/90 disabled:opacity-50"
        >
          {busy ? "Analyse en cours..." : "Analyser l'offre"}
        </button>
      </div>
    </main>
  );
}
