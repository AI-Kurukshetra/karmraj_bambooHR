import Link from "next/link";
import Image from "next/image";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-[#0b3a73] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <Image
              src="/peopleops-wordmark-light.svg"
              alt="PeopleOps HR"
              width={220}
              height={58}
              className="h-8 w-auto"
              priority
              unoptimized
            />
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-white/90 md:flex">
            <Link className="hover:text-white" href="/features">
              Features
            </Link>
            <Link className="hover:text-white" href="/pricing">
              Pricing
            </Link>
            <Link className="hover:text-white" href="/customers">
              Customers
            </Link>
            <Link className="hover:text-white" href="/security">
              Security
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link className="text-sm text-white/90 hover:text-white" href="/login">
              Sign in
            </Link>
            <Link
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#0b3a73] hover:bg-white/90"
              href="/login"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <Image
                src="/peopleops-icon.svg"
                alt="PeopleOps HR"
                width={24}
                height={24}
                className="h-6 w-6"
                unoptimized
              />
              <span>PeopleOps HR</span>
            </div>
            <p className="mt-2 max-w-md text-sm text-zinc-600">
              A secure HRIS foundation built for growing teams: employee master,
              RBAC, leave, onboarding, reporting, and audit logging.
            </p>
          </div>
          <div className="text-sm">
            <div className="font-medium text-zinc-900">Product</div>
            <div className="mt-3 grid gap-2 text-zinc-600">
              <Link className="hover:text-zinc-900" href="/features">
                Features
              </Link>
              <Link className="hover:text-zinc-900" href="/security">
                Security
              </Link>
              <Link className="hover:text-zinc-900" href="/pricing">
                Pricing
              </Link>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-zinc-900">Company</div>
            <div className="mt-3 grid gap-2 text-zinc-600">
              <Link className="hover:text-zinc-900" href="/customers">
                Customers
              </Link>
              <Link className="hover:text-zinc-900" href="/health">
                Status
              </Link>
              <Link className="hover:text-zinc-900" href="/login">
                Sign in
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-zinc-500">
            <div>© {new Date().getFullYear()} PeopleOps HR</div>
            <div>Enterprise-ready by design</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

