import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SecurityPage() {
  const bullets = [
    {
      title: "Row Level Security on every table",
      body: "Access is enforced in Postgres, not only in application code.",
    },
    {
      title: "Role-based permissions",
      body: "Roles map to explicit permission keys (e.g. reports.export, compensation.read).",
    },
    {
      title: "Soft deletes",
      body: "No hard deletes in the app. Data is retained for auditability and recovery.",
    },
    {
      title: "Audit logs",
      body: "Critical changes (employee updates, role changes, leave approvals) are logged.",
    },
    {
      title: "Indexing + pagination",
      body: "Designed for 1,000+ employees with efficient queries and bounded result sets.",
    },
  ];

  return (
    <main className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Security</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Enterprise-ready foundations: strict access control, auditability,
              and safe data lifecycle.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {bullets.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <div className="text-sm font-semibold">{b.title}</div>
              <p className="mt-2 text-sm text-zinc-300">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="text-sm font-semibold">Want to review policies?</div>
          <p className="mt-2 text-sm text-zinc-300">
            See the SQL migrations under <code>supabase/migrations/</code> for RLS
            policies, indexes, and audit triggers.
          </p>
        </div>
      </div>
    </main>
  );
}

