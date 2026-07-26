"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/logo";

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) window.location.href = "/app";
  }, [loading, user]);

  return (
    <div className="min-h-screen bg-white">
      {/* === NAVBAR === */}
      <nav className="sticky top-0 z-50 border-b border-adam-50 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />
          <div className="flex items-center gap-4">
            <a href="#features" className="hidden text-sm font-medium text-slate-600 hover:text-adam-700 sm:block">
              Fonctionnalites
            </a>
            <a href="#how" className="hidden text-sm font-medium text-slate-600 hover:text-adam-700 sm:block">
              Comment ca marche
            </a>
            <Link
              href="/auth"
              className="text-sm font-medium text-adam-700 hover:text-adam-800"
            >
              Connexion
            </Link>
            <Link
              href="/auth"
              className="rounded-lg bg-adam-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-adam-800"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <header className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-adam-50/50 via-transparent to-white" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-adam-200 bg-adam-50 px-4 py-1.5 text-sm font-medium text-adam-600">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              Propulse par GLM-5.2
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Votre candidature canadienne,
              <br />
              <span className="gradient-text">adaptee en 2 minutes.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Adam adapte votre CV et votre lettre d&apos;accompagnement a chaque
              offre d&apos;emploi. Score ATS en temps reel, format canadien,
              bilingue FR/EN. Travaillez moins, postulez mieux.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth"
                className="group flex items-center gap-2 rounded-xl bg-adam-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-adam-700/20 transition hover:bg-adam-800 hover:shadow-xl"
              >
                Creer mon CV canadien
                <span className="transition group-hover:translate-x-1">&rarr;</span>
              </Link>
              <Link
                href="#how"
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-adam-300 hover:text-adam-700"
              >
                Voir comment ca marche
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Aucune carte de credit requise. Compte gratuit en 30 secondes.
            </p>
          </div>

          {/* Hero visual: mock dashboard */}
          <div className="mt-16 mx-auto max-w-4xl animate-fade-up">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-adam-700/10">
              <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-slate-400">adamcareers.com/app/builder</span>
              </div>
              <div className="grid grid-cols-3 gap-0">
                {/* Mock CV preview */}
                <div className="col-span-2 space-y-3 p-6">
                  <div className="h-5 w-48 rounded bg-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                    <div className="h-3 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-full rounded bg-adam-50" />
                    <div className="h-2.5 w-5/6 rounded bg-adam-50" />
                    <div className="h-2.5 w-full rounded bg-green-50" />
                    <div className="h-2.5 w-4/5 rounded bg-adam-50" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-full rounded bg-adam-50" />
                    <div className="h-2.5 w-3/4 rounded bg-amber-50" />
                    <div className="h-2.5 w-full rounded bg-adam-50" />
                  </div>
                </div>
                {/* Mock scorecard */}
                <div className="border-l border-slate-100 p-6">
                  <div className="mb-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Conformite</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-green-600">92</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-full w-[92%] rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Score ATS</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-adam-500">85</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-full w-[85%] rounded-full bg-adam-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* === STATS BAR === */}
      <section className="border-y border-slate-100 bg-adam-800 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { n: "2 min", l: "Pour adapter un CV" },
            { n: "100%", l: "Format canadien" },
            { n: "FR/EN", l: "Bilingue" },
            { n: "ATS", l: "Score en temps reel" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-bold text-white">{s.n}</div>
              <div className="mt-1 text-xs text-adam-200">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section id="how" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              De l&apos;offre a la candidature, en 3 etapes
            </h2>
            <p className="mt-3 text-slate-600">
              Adam fait le travail difficile. Vous gardez le controle.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Importez ou creez votre CV",
                desc: "Telechargez votre CV actuel, ou laissez Adam le construire a partir de reponses a quelques questions. Style et voix preserves.",
                icon: (
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ),
              },
              {
                num: "02",
                title: "Collez une offre d'emploi",
                desc: "Adam analyse l'offre, recherche l'entreprise, et adapte votre CV et votre lettre. Chaque changement est mis en evidence: gardez ou annulez.",
                icon: (
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                ),
              },
              {
                num: "03",
                title: "Telechargeez et postulez",
                desc: "Exportez votre CV et votre lettre au format ATS. Adam apprend de vos choix pour des adaptations encore meilleures.",
                icon: (
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                ),
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group relative rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-adam-300 hover:shadow-lg"
              >
                <div className="mb-4 text-sm font-bold text-adam-accent">{step.num}</div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-adam-50">
                  <svg className="h-6 w-6 text-adam-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {step.icon}
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" className="bg-adam-50/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Pense pour le marche canadien
            </h2>
            <p className="mt-3 text-slate-600">
              Chaque fonctionnalite est concue pour vous aider a passer le filtre
              des recruteurs et des ATS.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Adaptation intelligente",
                desc: "Adam reorganise et reecrit votre CV pour chaque offre, en gardant votre voix et vos vraies experiences.",
                tag: "IA",
              },
              {
                title: "Score ATS en temps reel",
                desc: "Sachez instantanement si votre CV passera les filtres automatiques des recruteurs. Ameliorations suggerees.",
                tag: "ATS",
              },
              {
                title: "Conformite canadienne",
                desc: "Pas de photo, pas de date de naissance. Format inverse-chronologique. Verbes d'action. Quantifications.",
                tag: "Canada",
              },
              {
                title: "Lettre d'accompagnement",
                desc: "Generee en format d'affaires canadien, adaptee a l'entreprise et au poste. Editable librement.",
                tag: "Lettre",
              },
              {
                title: "Bilingue FR / EN",
                desc: "Adam detecte la langue de l'offre et adapte votre candidature dans la bonne langue.",
                tag: "FR/EN",
              },
              {
                title: "Apprentissage continu",
                desc: "Chaque fois que vous gardez ou refusez un changement, Adam apprend vos preferences. Sans appel IA.",
                tag: "IA+",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-adam-200 hover:shadow-md"
              >
                <div className="mb-3 inline-flex rounded-lg bg-adam-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-adam-accent">
                  {f.tag}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-adam-700 to-adam-800 px-8 py-16 text-center shadow-2xl">
            <div className="absolute right-0 top-0 h-40 w-40 translate-x-16 -translate-y-16 rounded-full bg-adam-accent/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-16 translate-y-16 rounded-full bg-adam-400/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white">
                Postulez a votre prochain poste des aujourd&apos;hui
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-adam-100">
                Creez votre compte gratuit, importez votre CV, et laissez Adam
                faire le reste. En moins de 5 minutes, vous aurez un CV
                canadien pret a envoyer.
              </p>
              <Link
                href="/auth"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-adam-700 shadow-lg transition hover:bg-adam-50"
              >
                Commencer gratuitement
                <span>&rarr;</span>
              </Link>
              <p className="mt-4 text-sm text-adam-200">
                Aucune carte de credit. Desinscription a tout moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo />
          <div className="flex gap-6 text-sm text-slate-500">
            <span>AdamCareers</span>
            <span>Made for the Canadian job market</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
