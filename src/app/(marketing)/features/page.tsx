import Link from "next/link";

export const dynamic = "force-dynamic";

export default function FeaturesPage() {
  const blocks = [
    {
      id: "employee-master",
      title: "Employee master",
      body: "A single employee record with hierarchy, department/designation structure, and soft deletes.",
      points: ["Search + pagination", "Profile views", "Documents", "Audit logging"],
    },
    {
      id: "rbac",
      title: "RBAC + RLS",
      body: "Role & permission system enforced at the database layer with Supabase Row Level Security.",
      points: ["Employee self visibility", "Manager direct reports only", "HR full org access", "Payroll-only compensation access"],
    },
    {
      id: "leave",
      title: "Leave management",
      body: "Requests, balances, holiday-aware day counts, and approvals with transactional updates.",
      points: ["Accrual support", "Approvals", "Balance deduction", "Audit trail"],
    },
    {
      id: "reporting",
      title: "Reporting (CSV)",
      body: "Server-side filtering and CSV export only—permission gated for compliance.",
      points: ["Headcount by department", "Active vs inactive", "Leave summary (phase 1)", "Attrition (phase 1)"],
    },
    {
      id: "compensation",
      title: "Compensation controls",
      body: "Salary data is separated into a restricted table with stricter RLS policies.",
      points: ["Read restricted", "Write restricted", "No accidental joins", "Explicit permission keys"],
    },
  ];

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Features</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Built to be production-ready for internal HR operations: secure by
              default, auditable, and designed for scale.
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
          {blocks.map((b) => (
            <section
              key={b.id}
              id={b.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <div className="text-sm font-semibold">{b.title}</div>
              <p className="mt-2 text-sm text-zinc-600">{b.body}</p>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm text-zinc-700">
                {b.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

