import Link from "next/link";

import { startOnboarding } from "@/app/(app)/onboarding/actions";
import { requireUser } from "@/lib/auth";
import { getCurrentOrgIdOrThrow } from "@/lib/org";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingStartPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requirePermission("employees.write");

  const supabase = createSupabaseServerClient();
  const user = await requireUser();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { data: employees } = await supabase
    .from("employees")
    .select("id, employee_code, first_name, last_name, email")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("first_name", { ascending: true })
    .limit(500);

  const { data: templates } = await supabase
    .from("onboarding_templates")
    .select("id, name")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("name", { ascending: true })
    .limit(100);

  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Start onboarding</h1>
        <p className="text-sm text-zinc-300">
          Step 1 of 2: pick an employee and an onboarding template.
        </p>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <form action={startOnboarding} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-50">Employee</span>
              <select
                name="employee_id"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select employee…
                </option>
                {(employees ?? []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {`${e.first_name} ${e.last_name}`.trim()}{" "}
                    {e.employee_code ? `(${e.employee_code})` : ""}{" "}
                    {e.email ? `— ${e.email}` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-400">
                Need to add a new employee first?{" "}
                <Link className="underline" href="/employees/new">
                  Create employee
                </Link>
                .
              </p>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-50">Template</span>
              <select
                name="template_id"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select template…
                </option>
                {(templates ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-400">
                Don’t see a template?{" "}
                <Link className="underline" href="/onboarding/templates">
                  Manage templates
                </Link>
                .
              </p>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Link
              href="/onboarding"
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-900"
            >
              Cancel
            </Link>
            <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200">
              Continue (Step 2)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

