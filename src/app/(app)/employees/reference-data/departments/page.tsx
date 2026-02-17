import Link from "next/link";

import {
  createDepartment,
  renameDepartment,
  softDeleteDepartment,
} from "@/app/(app)/employees/reference-data/actions";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("employees.write");

  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  const supabase = createSupabaseServerClient();
  const { data: departments, error: loadError } = await supabase
    .from("departments")
    .select("id,name,created_at")
    .is("deleted_at", null)
    .order("name", { ascending: true })
    .limit(500);

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load departments: {loadError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Used for employee master records.
          </p>
        </div>
        <Link
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          href="/employees/reference-data"
        >
          Back
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form action={createDepartment} className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">Create department</div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-600">
              Name
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              name="name"
              required
            />
          </div>
          <button
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            type="submit"
          >
            Create
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(departments ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-600" colSpan={2}>
                  No departments yet.
                </td>
              </tr>
            ) : (
              (departments ?? []).map((d) => (
                <tr key={d.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <form
                      action={renameDepartment.bind(null, d.id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        className="w-full max-w-md rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
                        name="name"
                        defaultValue={d.name}
                        required
                      />
                      <button
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
                        type="submit"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={softDeleteDepartment.bind(null, d.id)}>
                      <button
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 hover:bg-red-100"
                        type="submit"
                      >
                        Soft delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

