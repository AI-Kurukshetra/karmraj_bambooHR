import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getString(sp: SearchParams | undefined, key: string): string | null {
  const v = sp?.[key];
  if (typeof v === "string") return v;
  return null;
}

function getInt(sp: SearchParams | undefined, key: string, fallback: number) {
  const raw = getString(sp, key);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = createSupabaseServerClient();

  const { data: canWriteEmployees } = await supabase.rpc("has_permission", {
    p_permission_key: "employees.write",
  });

  const q = (getString(searchParams, "q") ?? "").trim();
  const status = (getString(searchParams, "status") ?? "").trim();
  const page = getInt(searchParams, "page", 1);
  const perPage = 25;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("employees")
    .select(
      "id, employee_code, first_name, last_name, email, employment_status, department_id, designation_id",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (q) {
    const escaped = q.replaceAll(",", " ");
    query = query.or(
      [
        `employee_code.ilike.%${escaped}%`,
        `first_name.ilike.%${escaped}%`,
        `last_name.ilike.%${escaped}%`,
        `email.ilike.%${escaped}%`,
      ].join(","),
    );
  }

  if (status) {
    query = query.eq("employment_status", status);
  }

  const { data: employees, error, count } = await query
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .range(from, to);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load employees: {error.message}
      </div>
    );
  }

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(pageCount, page + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="mt-1 text-sm text-zinc-300">
            {total.toLocaleString()} result{total === 1 ? "" : "s"} (RLS-filtered)
          </p>
        </div>

        {canWriteEmployees ? (
          <Link
            className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
            href="/employees/new"
          >
            New employee
          </Link>
        ) : null}
      </div>

      <form className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Search
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
              defaultValue={q}
              name="q"
              placeholder="Employee code, name, or email"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Status
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              defaultValue={status}
              name="status"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Page {page} of {pageCount}
          </div>
          <button
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
            type="submit"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/60 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {(employees ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-300" colSpan={4}>
                  No employees found.
                </td>
              </tr>
            ) : (
              (employees ?? []).map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-zinc-950/60">
                  <td className="px-4 py-3 font-medium">{e.employee_code}</td>
                  <td className="px-4 py-3">
                    <Link className="underline" href={`/employees/${e.id}`}>
                      {e.first_name} {e.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{e.email}</td>
                  <td className="px-4 py-3">{e.employment_status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Link
          className={`rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900 ${
            page <= 1 ? "pointer-events-none opacity-50" : ""
          }`}
          href={{
            pathname: "/employees",
            query: { ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(prevPage) },
          }}
        >
          Previous
        </Link>
        <Link
          className={`rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900 ${
            page >= pageCount ? "pointer-events-none opacity-50" : ""
          }`}
          href={{
            pathname: "/employees",
            query: { ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(nextPage) },
          }}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

