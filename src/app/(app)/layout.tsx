import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/app/(app)/_components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

