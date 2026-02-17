import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "Internal",
      body: "Core HR + RBAC + basic leave & reporting.",
      points: ["Employee master", "RLS policies", "CSV exports", "Audit logging"],
    },
    {
      name: "Operations",
      price: "Internal",
      body: "Adds onboarding/offboarding tasks and documents.",
      points: ["Task workflows", "Storage docs", "Manager views", "Soft deletes"],
    },
    {
      name: "Enterprise",
      price: "Internal",
      body: "Compensation access controls and extended governance.",
      points: ["Compensation table", "Payroll role", "Tighter policies", "Scales to 1,000+"],
    },
  ];

  return (
    <main className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          This project is an internal HRIS build. The “tiers” below are feature
          groupings to help you roll out in phases.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{t.price}</div>
              <p className="mt-2 text-sm text-zinc-300">{t.body}</p>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm text-zinc-200">
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
                >
                  Sign in
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

