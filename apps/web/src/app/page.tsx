// Server-to-server call uses the internal API_BASE_URL (e.g. http://api:8781 in
// compose, http://localhost:8781 in local dev). NEXT_PUBLIC_API_BASE_URL is the
// browser-facing URL reserved for future client-side calls.
const API_BASE =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8781";

async function getApiHealth(): Promise<{ status?: string } | null> {
  "use server";
  try {
    const res = await fetch(`${API_BASE}/healthz`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { status?: string };
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getApiHealth();
  const apiOk = health?.status === "ok";

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
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              apiOk ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <p className="font-mono text-sm">
            API: {apiOk ? "en ligne" : "hors ligne"} ({API_BASE})
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Etat M0: echafaudage. Prochaines etapes: auth (Composio + email),
          onboarding CV, puis le constructeur de CV canadien rapide.
        </p>
      </section>
    </main>
  );
}
