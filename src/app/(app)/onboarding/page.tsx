import Link from "next/link";

import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: { created?: string };
}) {
  await requirePermission("employees.read");
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const created = Number(searchParams?.created ?? 0);

  const { data: myTasks } = await supabase
    .from("onboarding_tasks")
    .select("id, employee_id, task_title, status, due_date")
    .eq("assigned_to", user?.id ?? "")
    .is("deleted_at", null)
    .order("due_date", { ascending: true })
    .limit(20);

  const employeeIds = Array.from(new Set((myTasks ?? []).map((t) => t.employee_id)));
  const { data: employeesForTasks } =
    employeeIds.length > 0
      ? await supabase
          .from("employees")
          .select("id, first_name, last_name")
          .in("id", employeeIds)
          .is("deleted_at", null)
      : { data: [] as { id: string; first_name: string; last_name: string }[] };

  const employeeNameById = new Map(
    (employeesForTasks ?? []).map((e) => [e.id, `${e.first_name} ${e.last_name}`.trim()]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
          <p className="text-sm text-zinc-300">
            Start an onboarding in 2 steps: pick employee + template, then confirm
            and assign tasks.
          </p>
          {Number.isFinite(created) && created > 0 ? (
            <p className="text-sm text-emerald-300">
              Created {created} onboarding task(s).
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/onboarding/templates"
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-900"
          >
            Manage templates
          </Link>
          <Link
            href="/onboarding/start"
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            Start onboarding
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="border-b border-zinc-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-50">My assigned tasks</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Tasks assigned to you (latest 20).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-950/60 text-left text-xs text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Employee</th>
                <th className="px-4 py-2 font-medium">Task</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(myTasks ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-zinc-300" colSpan={4}>
                    No tasks assigned to you yet.
                  </td>
                </tr>
              ) : (
                (myTasks ?? []).map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">
                      {employeeNameById.get(t.employee_id) ?? "—"}
                    </td>
                    <td className="px-4 py-3">{t.task_title}</td>
                    <td className="px-4 py-3">{t.status}</td>
                    <td className="px-4 py-3">{t.due_date ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

