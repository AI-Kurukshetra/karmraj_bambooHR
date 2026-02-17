import Link from "next/link";

import { upsertCompensation } from "@/app/(app)/employees/actions";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmployeeCompensationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("compensation.read");

  const errorMsg =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  const supabase = createSupabaseServerClient();

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, first_name, last_name, employee_code")
    .eq("id", params.id)
    .maybeSingle();

  if (employeeError || !employee) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load employee: {employeeError?.message ?? "Not found"}
      </div>
    );
  }

  const { data: comp } = await supabase
    .from("compensation")
    .select("id, base_salary, bonus, bank_account, ifsc_code, created_at, updated_at")
    .eq("employee_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();

  // Check write permission (render edit form only if allowed)
  const { data: canWrite } = await supabase.rpc("has_permission", {
    p_permission_key: "compensation.write",
  });

  const action = upsertCompensation.bind(null, employee.id);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compensation</h1>
          <p className="mt-1 text-sm text-zinc-300">
            {employee.first_name} {employee.last_name} ({employee.employee_code})
          </p>
        </div>
        <Link
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
          href={`/employees/${employee.id}`}
        >
          Back
        </Link>
      </div>

      {errorMsg ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMsg}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="text-sm font-semibold">Current</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info label="Base salary" value={comp ? String(comp.base_salary) : "—"} />
          <Info label="Bonus" value={comp ? String(comp.bonus) : "—"} />
          <Info label="Bank account" value={comp?.bank_account ?? "—"} />
          <Info label="IFSC" value={comp?.ifsc_code ?? "—"} />
        </div>
      </div>

      {canWrite ? (
        <form
          action={action}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
        >
          <div className="text-sm font-semibold">Edit</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Base salary">
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
                name="base_salary"
                inputMode="decimal"
                defaultValue={comp?.base_salary ?? 0}
                required
              />
            </Field>
            <Field label="Bonus">
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
                name="bonus"
                inputMode="decimal"
                defaultValue={comp?.bonus ?? 0}
                required
              />
            </Field>
            <Field label="Bank account">
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
                name="bank_account"
                defaultValue={comp?.bank_account ?? ""}
              />
            </Field>
            <Field label="IFSC">
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
                name="ifsc_code"
                defaultValue={comp?.ifsc_code ?? ""}
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-200">
          You don’t have permission to edit compensation.
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      <div className="text-sm text-zinc-100">{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

