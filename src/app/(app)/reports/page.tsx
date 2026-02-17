import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Server-side filtering and CSV export only (permission restricted).
          </p>
        </div>
        <Link
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ReportCard
          title="Headcount by Department"
          href="/reports/headcount.csv"
        />
        <ReportCard
          title="Active vs Inactive Employees"
          href="/reports/active-vs-inactive.csv"
        />
      </div>
    </div>
  );
}

function ReportCard({ title, href }: { title: string; href: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3">
        <Link
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          href={href}
        >
          Download CSV
        </Link>
      </div>
    </div>
  );
}

