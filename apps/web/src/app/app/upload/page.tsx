"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface ParseResult {
  cv: unknown;
  writingStyle: { tone?: string; voice?: string; language?: string };
}

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (loading) return <main className="p-8 text-slate-500">Chargement...</main>;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const onFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    setText(new TextDecoder().decode(buf));
  };

  const parse = async () => {
    if (text.trim().length < 50) {
      setErr("Collez au moins 50 caracteres de CV.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const data = await api<ParseResult>("/api/onboarding/parse-cv", {
        method: "POST",
        json: { text },
      });
      setResult(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur de parsing");
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

      <h1 className="mb-1 text-2xl font-bold text-adam">Importer mon CV</h1>
      <p className="mb-8 text-sm text-slate-500">
        Adam analyse votre CV et extrait la structure. Vos experiences sont
        ensuite disponibles pour les adaptations.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Fichier .txt ou collez le texte de votre CV
        </label>
        <input
          type="file"
          accept=".txt,.md"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="mb-3 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-adam/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-adam hover:file:bg-adam/20"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Collez ici le contenu de votre CV..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-adam"
        />
        <button
          onClick={parse}
          disabled={busy}
          className="mt-3 rounded-lg bg-adam px-6 py-2.5 font-semibold text-white hover:bg-adam/90 disabled:opacity-50"
        >
          {busy ? "Analyse en cours..." : "Analyser mon CV"}
        </button>
      </div>

      {err && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="mb-2 font-semibold text-green-800">
            CV analyse et enregistre
          </h2>
          <p className="text-sm text-green-700">
            Style detecte: {result.writingStyle.tone ?? "professionnel"},{" "}
            {result.writingStyle.language === "fr" ? "francais" : "anglais"}.
          </p>
          <button
            onClick={() => router.push("/app")}
            className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Continuer
          </button>
        </div>
      )}
    </main>
  );
}
