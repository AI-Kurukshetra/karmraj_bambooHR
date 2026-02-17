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
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          This project is an internal HRIS build. The “tiers” below are feature
          groupings to help you roll out in phases.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{t.price}</div>
              <p className="mt-2 text-sm text-zinc-600">{t.body}</p>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm text-zinc-700">
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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

