import Image from "next/image";
import Link from "next/link";

import { signOut } from "@/app/login/actions";

export function Sidebar({
  userEmail,
}: {
  userEmail: string | null | undefined;
}) {
  return (
    <aside className="flex h-full flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <Image
          src="/peopleops-icon.svg"
          alt="PeopleOps HR"
          width={28}
          height={28}
          className="h-7 w-7"
          priority
          unoptimized
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-zinc-900">
            PeopleOps HR
          </div>
          <div className="text-xs text-zinc-500">Internal HRIS</div>
        </div>
      </div>

      <nav className="px-3 pb-3">
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/employees" label="Employees" />
        <NavItem href="/leave" label="Leave" />
        <NavItem href="/onboarding" label="Onboarding" />
        <NavItem href="/reports" label="Reports" />

        <div className="my-3 border-t border-zinc-200" />

        <NavItem href="/setup" label="Setup" />
        <NavItem href="/employees/reference-data" label="Reference data" />
      </nav>

      <div className="mt-auto border-t border-zinc-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-zinc-900">
              {userEmail ?? "Signed in"}
            </div>
            <div className="text-[11px] text-zinc-500">Authenticated</div>
          </div>
          <form action={signOut}>
            <button
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs hover:bg-zinc-50"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
    >
      <span className="font-medium">{label}</span>
      <span className="text-zinc-300 group-hover:text-zinc-400">→</span>
    </Link>
  );
}

