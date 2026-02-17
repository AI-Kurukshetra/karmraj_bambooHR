import Link from "next/link";

import { createOnboardingTemplate } from "@/app/(app)/onboarding/actions";
import { requireUser } from "@/lib/auth";
import { getCurrentOrgIdOrThrow } from "@/lib/org";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingTemplatesPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requirePermission("employees.write");

  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const supabase = createSupabaseServerClient();
  const user = await requireUser();
  const orgId = await getCurrentOrgIdOrThrow(supabase, user.id);

  const { data: templates } = await supabase
    .from("onboarding_templates")
    .select("id, name, created_at")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Onboarding templates</h1>
          <p className="text-sm text-zinc-300">
            Build reusable onboarding checklists.
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        <Link
          href="/onboarding"
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-900"
        >
          Back
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <h2 className="text-sm font-semibold text-zinc-50">Create template</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Example: “Standard Onboarding”, “Engineering Onboarding”.
          </p>
          <form action={createOnboardingTemplate} className="mt-4 space-y-3">
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-50">Name</span>
              <input
                name="name"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-600"
                placeholder="Standard Onboarding"
                required
              />
            </label>
            <button className="w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200">
              Create
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-50">Templates</h2>
            <p className="mt-1 text-xs text-zinc-400">Click a template to edit items.</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {(templates ?? []).length === 0 ? (
              <div className="px-4 py-3 text-sm text-zinc-300">No templates yet.</div>
            ) : (
              (templates ?? []).map((t) => (
                <Link
                  key={t.id}
                  href={`/onboarding/templates/${t.id}`}
                  className="block px-4 py-3 transition-colors hover:bg-zinc-950/60"
                >
                  <div className="text-sm font-medium text-zinc-50">{t.name}</div>
                  <div className="text-xs text-zinc-400">Created {new Date(t.created_at).toLocaleDateString()}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

