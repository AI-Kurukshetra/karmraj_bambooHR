import Link from "next/link";

import {
  addTemplateItem,
  softDeleteTemplateItem,
  updateTemplateItem,
} from "@/app/(app)/onboarding/actions";
import { requireUser } from "@/lib/auth";
import { getCurrentOrgIdOrThrow } from "@/lib/org";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingTemplateDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requirePermission("employees.write");

  const templateId = params.id;
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  const supabase = createSupabaseServerClient();
  const user = await requireUser();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

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

  if (!template) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Template not found</h1>
        <Link className="underline" href="/onboarding/templates">
          Back to templates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
          <p className="text-sm text-zinc-300">
            Add checklist items used by the onboarding wizard.
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding/templates"
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-900"
          >
            Back
          </Link>
          <Link
            href="/onboarding/start"
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            Start onboarding
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <h2 className="text-sm font-semibold text-zinc-50">Add item</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Example: “Collect documents”, “Issue laptop”, “Create email account”.
          </p>

          <form
            action={addTemplateItem.bind(null, templateId)}
            className="mt-4 space-y-3"
          >
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-50">Task title</span>
              <input
                name="task_title"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                placeholder="Collect documents"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-sm font-medium text-zinc-50">Due in (days)</span>
                <input
                  name="default_due_days"
                  type="number"
                  min={0}
                  max={365}
                  defaultValue={7}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-zinc-50">Sort</span>
                <input
                  name="sort_order"
                  type="number"
                  min={0}
                  max={10000}
                  defaultValue={(items?.length ?? 0) * 10}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                  required
                />
              </label>
            </div>
            <button className="w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200">
              Add
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-50">Items</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Edit inline, or remove an item.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-950/60 text-left text-xs text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Task</th>
                  <th className="px-4 py-2 font-medium">Due (days)</th>
                  <th className="px-4 py-2 font-medium">Sort</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {(items ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-zinc-300" colSpan={4}>
                      No items yet.
                    </td>
                  </tr>
                ) : (
                  (items ?? []).map((i) => (
                    <tr key={i.id} className="align-top">
                      <td className="px-4 py-3">
                        <form
                          action={updateTemplateItem.bind(null, i.id, templateId)}
                          className="flex items-start gap-2"
                        >
                          <div className="min-w-[260px] flex-1">
                            <input
                              name="task_title"
                              defaultValue={i.task_title}
                              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                              required
                            />
                          </div>
                          <input
                            name="default_due_days"
                            type="number"
                            min={0}
                            max={365}
                            defaultValue={i.default_due_days}
                            className="w-28 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                            required
                          />
                          <input
                            name="sort_order"
                            type="number"
                            min={0}
                            max={10000}
                            defaultValue={i.sort_order}
                            className="w-24 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                            required
                          />
                          <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200">
                            Save
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{i.default_due_days}</td>
                      <td className="px-4 py-3 text-zinc-300">{i.sort_order}</td>
                      <td className="px-4 py-3">
                        <form
                          action={async () => {
                            "use server";
                            return softDeleteTemplateItem(i.id, templateId);
                          }}
                        >
                          <button className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-900">
                            Remove
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
      </div>
    </div>
  );
}

