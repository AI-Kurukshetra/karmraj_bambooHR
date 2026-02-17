import Link from "next/link";

import {
  restoreEmployee,
  softDeleteEmployee,
} from "@/app/(app)/employees/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const errorMsg =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  const supabase = createSupabaseServerClient();
  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !employee) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load employee: {error?.message ?? "Not found"}
      </div>
    );
  }

  const isDeleted = employee.deleted_at !== null;

  const { data: dept } = employee.department_id
    ? await supabase
        .from("departments")
        .select("id,name")
        .eq("id", employee.department_id)
        .maybeSingle()
    : { data: null };

  const { data: desig } = employee.designation_id
    ? await supabase
        .from("designations")
        .select("id,title")
        .eq("id", employee.designation_id)
        .maybeSingle()
    : { data: null };

  const { data: manager } = employee.manager_id
    ? await supabase
        .from("employees")
        .select("id,first_name,last_name,employee_code")
        .eq("id", employee.manager_id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {employee.first_name} {employee.last_name}
            </h1>
            {isDeleted ? (
              <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-xs font-medium text-zinc-200">
                Deleted
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-zinc-300">
            {employee.employee_code} · {employee.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isDeleted ? (
            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
              href={`/employees/${employee.id}/edit`}
            >
              Edit
            </Link>
          ) : null}

          {!isDeleted ? (
            <form action={softDeleteEmployee.bind(null, employee.id)}>
              <button
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 hover:bg-red-100"
                type="submit"
              >
                Soft delete
              </button>
            </form>
          ) : (
            <form action={restoreEmployee.bind(null, employee.id)}>
              <button
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
                type="submit"
              >
                Restore
              </button>
            </form>
          )}

          <Link
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
            href="/employees"
          >
            Back
          </Link>
        </div>
      </div>

      {errorMsg ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMsg}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Employment">
          <Row label="Status" value={employee.employment_status} />
          <Row label="Type" value={employee.employment_type} />
          <Row label="Joining date" value={employee.joining_date} />
          <Row label="Confirmation date" value={employee.confirmation_date} />
          <Row label="Work location" value={employee.work_location} />
        </Card>

        <Card title="Org structure">
          <Row label="Department" value={dept?.name ?? null} />
          <Row label="Designation" value={desig?.title ?? null} />
          <Row
            label="Manager"
            value={
              manager
                ? `${manager.first_name} ${manager.last_name} (${manager.employee_code})`
                : null
            }
          />
        </Card>

        <Card title="Personal">
          <Row label="DOB" value={employee.dob} />
          <Row label="Gender" value={employee.gender} />
          <Row label="Marital status" value={employee.marital_status} />
          <Row label="Phone" value={employee.phone} />
        </Card>

        <Card title="Related">
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
              href={`/employees/${employee.id}/documents`}
            >
              Documents
            </Link>
            <Link
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
              href={`/employees/${employee.id}/compensation`}
            >
              Compensation
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      <div className="text-sm text-zinc-100">{value ?? "—"}</div>
    </div>
  );
}

