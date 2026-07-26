"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppHome() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  };

  if (loading) return <main className="p-8 text-slate-500">Chargement...</main>;
  if (!user) return null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-adam">
            Bonjour{user.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Deconnexion
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/app/builder"
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-adam hover:shadow-md"
        >
          <div className="mb-2 inline-flex rounded-lg bg-adam/10 px-3 py-1 text-xs font-semibold text-adam">
            NOUVEAU
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Creer un CV canadien
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Adam vous pose quelques questions et genere un CV conforme aux
            standards canadiens en moins de 5 minutes.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-adam group-hover:underline">
            Commencer &rarr;
          </span>
        </Link>

        <Link
          href="/app/upload"
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-adam hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Importer mon CV
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Telechargez votre CV actuel. Adam l&apos;analyse et enrichit votre
            profil pour les futures adaptations.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-adam group-hover:underline">
            Importer &rarr;
          </span>
        </Link>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Bientot disponible
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Adaptation d&apos;une offre, lettre d&apos;accompagnement,
            recherche quotidienne d&apos;offres.
          </p>
        </div>
      </div>
    </main>
  );
}
