"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8781";

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) window.location.href = "/app";
  }, [loading, user]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-semibold tracking-wide text-adam-accent uppercase">
          MVP / ADAMJOBS
        </p>
        <h1 className="mt-2 text-4xl font-bold text-adam">
          Votre candidature canadienne, adaptee en 2 minutes.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Adam adapte votre CV et votre lettre d&apos;accompagnement a chaque
          offre, dans le respect du style canadien et de votre voix. FR / EN.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="rounded-lg bg-adam px-6 py-3 font-semibold text-white transition hover:bg-adam/90"
          >
            Commencer
          </Link>
          <a
            href={`${API_BASE}/healthz`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-500 underline"
          >
            Etat de l&apos;API
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Constructeur de CV canadien, import de CV, scores de conformite et ATS
          en temps reel.
        </p>
      </section>
    </main>
  );
}
