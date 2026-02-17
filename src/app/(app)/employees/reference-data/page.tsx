import Link from "next/link";

import { requirePermission } from "@/lib/permissions/server";

export const dynamic = "force-dynamic";

export default async function EmployeeReferenceDataPage() {
  await requirePermission("employees.write");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employee reference data</h1>
        <p className="mt-1 text-sm text-zinc-300">
          Manage Departments and Designations used in the employee master.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Departments" href="/employees/reference-data/departments" />
        <Card title="Designations" href="/employees/reference-data/designations" />
      </div>
    </div>
  );
}

function Card({ title, href }: { title: string; href: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3">
        <Link
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
          href={href}
        >
          Manage
        </Link>
      </div>
    </div>
  );
}

