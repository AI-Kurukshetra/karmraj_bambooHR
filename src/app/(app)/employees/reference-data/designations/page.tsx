import Link from "next/link";

import {
  createDesignation,
  softDeleteDesignation,
  updateDesignation,
} from "@/app/(app)/employees/reference-data/actions";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DesignationsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("employees.write");

  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  const supabase = createSupabaseServerClient();
  const [{ data: designations, error: loadError }, { data: departments }] =
    await Promise.all([
      supabase
        .from("designations")
        .select("id,title,department_id,created_at")
        .is("deleted_at", null)
        .order("title", { ascending: true })
        .limit(500),
      supabase
        .from("departments")
        .select("id,name")
        .is("deleted_at", null)
        .order("name", { ascending: true })
        .limit(500),
    ]);

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load designations: {loadError.message}
      </div>
    );
  }

  const deptMap = new Map((departments ?? []).map((d) => [d.id, d.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Designations</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Used for employee master records.
          </p>
        </div>
        <Link
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
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

      <form
        action={createDesignation}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
      >
        <div className="text-sm font-semibold">Create designation</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Title
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="title"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Department (optional)
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
              name="department_id"
              defaultValue=""
            >
              <option value="">—</option>
              {(departments ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
            type="submit"
          >
            Create
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/60 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {(designations ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-300" colSpan={3}>
                  No designations yet.
                </td>
              </tr>
            ) : (
              (designations ?? []).map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-zinc-950/60">
                  <td className="px-4 py-3">
                    <form
                      action={updateDesignation.bind(null, d.id)}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <input
                        className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
                        name="title"
                        defaultValue={d.title}
                        required
                      />
                      <select
                        className="w-full max-w-xs rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:ring-2 focus:ring-zinc-600"
                        name="department_id"
                        defaultValue={d.department_id ?? ""}
                      >
                        <option value="">—</option>
                        {(departments ?? []).map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
                        type="submit"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-zinc-200">
                    {d.department_id ? deptMap.get(d.department_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={softDeleteDesignation.bind(null, d.id)}>
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

