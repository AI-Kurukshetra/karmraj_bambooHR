import Link from "next/link";

import { assignOnboardingTasks } from "@/app/(app)/onboarding/actions";
import { requireUser } from "@/lib/auth";
import { getCurrentOrgIdOrThrow } from "@/lib/org";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingConfirmPage({
  searchParams,
}: {
  searchParams?: { employeeId?: string; templateId?: string; error?: string };
}) {
  await requirePermission("employees.write");

  const employeeId = searchParams?.employeeId ?? "";
  const templateId = searchParams?.templateId ?? "";
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  const supabase = createSupabaseServerClient();
  const user = await requireUser();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { data: employee } = await supabase
    .from("employees")
    .select("id, first_name, last_name, email, joining_date, manager_id")
    .eq("org_id", orgId)
    .eq("id", employeeId)
    .is("deleted_at", null)
    .maybeSingle();

  const { data: template } = await supabase
    .from("onboarding_templates")
    .select("id, name")
    .eq("org_id", orgId)
    .eq("id", templateId)
    .is("deleted_at", null)
    .maybeSingle();

  const { data: items } = await supabase
    .from("onboarding_template_items")
    .select("id, task_title, default_due_days, sort_order")
    .eq("org_id", orgId)
    .eq("template_id", templateId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .limit(500);

  // Assignees: employees who have linked auth user_id
  const { data: assignees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, email, user_id")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .not("user_id", "is", null)
    .order("first_name", { ascending: true })
    .limit(500);

  const managerUserId =
    employee?.manager_id && assignees
      ? assignees.find((a) => a.id === employee.manager_id)?.user_id ?? null
      : null;

  if (!employee || !template) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Confirm onboarding</h1>
        <p className="text-sm text-zinc-300">
          Missing or invalid employee/template selection.
        </p>
        <Link
          href="/onboarding/start"
          className="inline-flex rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Back to step 1
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Confirm onboarding</h1>
        <p className="text-sm text-zinc-300">
          Step 2 of 2: review tasks and assign them.
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Employee
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-50">
              {`${employee.first_name} ${employee.last_name}`.trim()}
            </div>
            <div className="text-sm text-zinc-300">{employee.email ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Template
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-50">
              {template.name}
            </div>
            <div className="text-sm text-zinc-300">
              {items?.length ?? 0} checklist item(s)
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Base date
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-50">
              {employee.joining_date ?? "Today"}
            </div>
            <div className="text-sm text-zinc-300">
              Due dates are calculated from joining date (or today).
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="border-b border-zinc-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-50">Checklist preview</h2>
          <p className="mt-1 text-xs text-zinc-400">
            These tasks will be created as onboarding tasks.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-950/60 text-left text-xs text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Task</th>
                <th className="px-4 py-2 font-medium">Due offset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(items ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-zinc-300" colSpan={2}>
                    No items in this template yet. Add items first.
                    <div className="mt-2">
                      <Link
                        href={`/onboarding/templates/${template.id}`}
                        className="underline"
                      >
                        Edit template
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                (items ?? []).map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3">{i.task_title}</td>
                    <td className="px-4 py-3">{i.default_due_days} day(s)</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <form action={assignOnboardingTasks} className="space-y-4">
          <input type="hidden" name="employee_id" value={employee.id} />
          <input type="hidden" name="template_id" value={template.id} />

          <label className="space-y-1">
            <span className="text-sm font-medium text-zinc-50">
              Assign all tasks to
            </span>
            <select
              name="assigned_to"
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
              defaultValue={managerUserId ?? user.id}
              required
            >
              {(assignees ?? []).map((a) => (
                <option key={a.user_id!} value={a.user_id!}>
                  {`${a.first_name} ${a.last_name}`.trim()}{" "}
                  {a.email ? `— ${a.email}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-400">
              Tip: if the employee has a manager with a linked user account, the
              manager is selected by default.
            </p>
          </label>

          <div className="flex items-center justify-end gap-2">
            <Link
              href="/onboarding/start"
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-900"
            >
              Back
            </Link>
            <button
              disabled={(items ?? []).length === 0}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            >
              Create onboarding tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

