import Link from "next/link";

import { bootstrapOrg } from "@/app/(app)/setup/actions";

export default function SetupPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Initial setup</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Creates your first organization, base roles, permission mappings, and
          assigns you <span className="font-medium">Account Owner</span>.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form action={bootstrapOrg} className="rounded-2xl border bg-white p-5">
        <label className="text-sm font-medium" htmlFor="org_name">
          Organization name
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          id="org_name"
          name="org_name"
          required
        />
        <button
          className="mt-4 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          type="submit"
        >
          Create organization
        </button>
      </form>

      <p className="text-sm text-zinc-600">
        Back to <Link className="underline" href="/dashboard">dashboard</Link>.
      </p>
    </div>
  );
}

