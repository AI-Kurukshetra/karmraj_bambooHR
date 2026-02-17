import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/app/(app)/_components/Sidebar";
import { getPublicEnvSafe } from "@/lib/env";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const envOk = Boolean(getPublicEnvSafe());
  if (!envOk) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-semibold">Configuration required</div>
            <p className="mt-2 text-sm text-zinc-600">
              Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment
              (Vercel → Project → Settings → Environment Variables) to enable the
              authenticated app.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/health"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
              >
                View setup instructions
              </Link>
              <Link
                href="/"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const user = await requireUser();

  return (
    <div className="min-h-screen bg-zinc-50">
      <input id="app-nav" type="checkbox" className="peer hidden" />

      {/* Mobile overlay */}
      <label
        htmlFor="app-nav"
        className="fixed inset-0 z-40 hidden bg-black/40 opacity-0 transition peer-checked:block peer-checked:opacity-100 md:hidden"
      />

      {/* Sidebar drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-[18rem] -translate-x-full transition peer-checked:translate-x-0 md:translate-x-0">
        <Sidebar userEmail={user.email} />
      </div>

      {/* Content */}
      <div className="md:pl-[18rem]">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <label
                htmlFor="app-nav"
                className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 md:hidden"
              >
                Menu
              </label>
              <div className="text-sm font-semibold text-zinc-900">Workspace</div>
            </div>
            <div className="text-xs text-zinc-500">{user.email}</div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

