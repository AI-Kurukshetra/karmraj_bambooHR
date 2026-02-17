import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import { getCurrentUser } from "@/lib/auth";
import { getPublicEnvSafe } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function MarketingHomePage() {
  // Marketing pages should render even if Supabase env vars are not configured yet
  // (common on a fresh Vercel deploy). If env is available, redirect signed-in users.
  if (getPublicEnvSafe()) {
    const user = await getCurrentUser();
    if (user) redirect("/dashboard");
  }

  return (
    <main>
      <Hero />
      <TrustBar />
      <Announcements />
      <PlatformSections />
      <ImpactStats />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b3a73] text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="relative">
          <div className="mb-6">
            <Image
              src="/peopleops-wordmark-light.svg"
              alt="PeopleOps HR"
              width={280}
              height={72}
              className="h-10 w-auto"
              priority
              unoptimized
            />
          </div>
          <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
            Production-grade HRIS · Phase 1
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            The powerfully simple HR platform for growing teams
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">
            Keep employee data accurate, secure, and auditable—with role-based
            access, leave workflows, onboarding checklists, and CSV reporting.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0b3a73] hover:bg-white/90"
            >
              Get started
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Explore features
            </Link>
          </div>

          <div className="mt-10 grid gap-2 text-sm text-white/85 sm:grid-cols-2">
            {[
              "Employee Master",
              "RBAC + RLS",
              "Leave & approvals",
              "Onboarding tasks",
              "Audit logging",
              "Soft deletes",
              "CSV reporting",
              "Document storage",
            ].map((x) => (
              <div key={x} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                <span>{x}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl">
            <div className="text-sm font-semibold">Preview</div>
            <p className="mt-1 text-sm text-white/80">
              A clean dashboard + employee directory experience.
            </p>
            <div className="mt-4 grid gap-3">
              <MockCard title="Directory" subtitle="Search employees, managers, departments" />
              <MockCard title="Leave" subtitle="Requests, approvals, balances" />
              <MockCard title="Reports" subtitle="Server-side filters + CSV export" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-white/80">
          Combine HR workflows into one secure system—without brittle integrations.
        </div>
      </div>
    </section>
  );
}

function MockCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-white/80">{subtitle}</div>
      <div className="mt-3 h-2 w-2/3 rounded bg-white/30" />
      <div className="mt-2 h-2 w-1/2 rounded bg-white/20" />
    </div>
  );
}

function TrustBar() {
  return (
    <section className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-center text-sm font-medium text-zinc-300">
          Trusted patterns for teams scaling to 1,000+ employees
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-center text-xs text-zinc-400 sm:grid-cols-4">
          {["RLS everywhere", "Audit trails", "Soft deletes", "CSV exports"].map((x) => (
            <div
              key={x}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
            >
              {x}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Announcements() {
  const items = [
    {
      title: "Compensation controls",
      body: "Keep salary data restricted to approved roles with separate tables + policies.",
      href: "/features#compensation",
    },
    {
      title: "Manager visibility rules",
      body: "Managers see direct reports—no accidental access across the org.",
      href: "/security",
    },
    {
      title: "Reporting built for ops",
      body: "Server-side filters and CSV exports, permission-gated for compliance.",
      href: "/features#reporting",
    },
  ];

  return (
    <section className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-sm font-semibold text-zinc-50">Announcements</div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((i) => (
            <Link
              key={i.title}
              href={i.href}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-colors hover:bg-zinc-900/70 motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <div className="text-sm font-semibold">{i.title}</div>
              <p className="mt-2 text-sm text-zinc-300">{i.body}</p>
              <div className="mt-4 text-sm font-medium text-sky-200">
                Learn more →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformSections() {
  const sections = [
    {
      title: "Core HR",
      body: "Maintain a single, accurate employee record with department/designation structure and manager hierarchy.",
    },
    {
      title: "Leave & PTO",
      body: "Requests, balances, holiday-aware day counts, and approvals with transactional balance updates.",
    },
    {
      title: "Onboarding & Offboarding",
      body: "Assign checklists, track tasks, and keep workflows visible across teams.",
    },
    {
      title: "Reporting",
      body: "Operational reports with server-side filters and controlled CSV export for compliance.",
    },
  ];

  return (
    <section className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-2xl font-semibold tracking-tight">
          One platform, fewer spreadsheets
        </div>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          The core modules you need for Phase 1, designed with security and scale
          as first-class requirements.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <div className="text-sm font-semibold">{s.title}</div>
              <p className="mt-2 text-sm text-zinc-300">{s.body}</p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200">
                  RLS
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200">
                  Audit
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200">
                  Soft delete
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactStats() {
  const stats = [
    { k: "40%", v: "less manual admin work" },
    { k: "1,000+", v: "employee-ready architecture" },
    { k: "RLS", v: "table-level access control" },
  ];

  return (
    <section className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <div className="text-3xl font-semibold tracking-tight text-sky-200">
                {s.k}
              </div>
              <div className="mt-2 text-sm text-zinc-300">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      quote:
        "We finally stopped duplicating employee data across tools. HR, managers, and finance all work from one source of truth.",
      name: "Head of People",
      org: "Mid-market SaaS",
    },
    {
      quote:
        "Permission boundaries are clear and enforceable. Compensation access is restricted without relying on “don’t click that” processes.",
      name: "HR Operations Lead",
      org: "Services org",
    },
    {
      quote:
        "Audit logs turned out to be essential—especially around leave approvals and role changes.",
      name: "IT Admin",
      org: "Distributed team",
    },
  ];

  return (
    <section className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-2xl font-semibold tracking-tight">
          Hear from teams like yours
        </div>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          Built for internal HR operations where security and clarity matter.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {quotes.map((q) => (
            <div
              key={q.name}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <p className="text-sm text-zinc-200">“{q.quote}”</p>
              <div className="mt-4 text-sm font-semibold">{q.name}</div>
              <div className="text-xs text-zinc-400">{q.org}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Is this a demo app?",
      a: "No—this project is structured to be production-ready with RLS, audit logging, indexing, and soft deletes.",
    },
    {
      q: "How is access controlled?",
      a: "Row Level Security is enabled on all tables. RBAC permissions determine who can view or mutate data.",
    },
    {
      q: "How do exports work?",
      a: "Reports are server-generated and exported as CSV only, gated by a dedicated permission key.",
    },
    {
      q: "What about documents?",
      a: "Documents are stored in Supabase Storage (private bucket) with Storage policies tied to employee visibility rules.",
    },
  ];

  return (
    <section className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-2xl font-semibold tracking-tight">FAQ</div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((i) => (
            <div
              key={i.q}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]"
            >
              <div className="text-sm font-semibold">{i.q}</div>
              <p className="mt-2 text-sm text-zinc-300">{i.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#0b3a73] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              Ready to run your HRIS?
            </div>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Sign in and run initial setup to create your org, seed roles, and
              start managing employee records.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0b3a73] hover:bg-white/90"
            >
              Sign in
            </Link>
            <Link
              href="/health"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Check configuration
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

