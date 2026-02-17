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
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Security</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Enterprise-ready foundations: strict access control, auditability,
              and safe data lifecycle.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {bullets.map((b) => (
            <div key={b.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-semibold">{b.title}</div>
              <p className="mt-2 text-sm text-zinc-600">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="text-sm font-semibold">Want to review policies?</div>
          <p className="mt-2 text-sm text-zinc-600">
            See the SQL migrations under <code>supabase/migrations/</code> for RLS
            policies, indexes, and audit triggers.
          </p>
        </div>
      </div>
    </main>
  );
}

