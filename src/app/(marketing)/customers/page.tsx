import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  const cases = [
    {
      title: "Cut admin busywork",
      body: "Centralize employee records and reduce duplicate data entry across tools.",
      metric: "Hundreds of hours saved per year",
    },
    {
      title: "Stronger governance",
      body: "RLS + audit logging make it clear who changed what and when.",
      metric: "Auditable HR operations",
    },
    {
      title: "Manager clarity",
      body: "Managers see direct reports only—no need for manual access reviews.",
      metric: "Fewer access incidents",
    },
  ];

  return (
    <main className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Example outcomes teams can achieve with a secure HRIS foundation.
            </p>
          </div>
          <Link
            href="/features"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-900"
          >
            See features
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <div className="text-sm font-semibold">{c.title}</div>
              <p className="mt-2 text-sm text-zinc-300">{c.body}</p>
              <div className="mt-4 rounded-xl bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200">
                {c.metric}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="text-sm font-semibold">Want to explore the app?</div>
          <p className="mt-2 text-sm text-zinc-300">
            Sign in and run initial setup to create your org and seed roles.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

