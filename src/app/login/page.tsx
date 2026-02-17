import Link from "next/link";
import Image from "next/image";

import { signInWithPassword } from "@/app/login/actions";
import { getPublicEnvSafe } from "@/lib/env";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;
  const envOk = Boolean(getPublicEnvSafe());

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_500ms_ease-out_both]">
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="/peopleops-wordmark-light.svg"
              alt="PeopleOps HR"
              width={220}
              height={58}
              className="h-9 w-auto"
              priority
              unoptimized
            />
          </Link>
        </div>

        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-300">
          Use your work email and password.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {!envOk ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Supabase env vars are not configured for this deployment yet. Add{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel, then redeploy.
          </div>
        ) : (
          <form action={signInWithPassword} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-600"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
              type="submit"
            >
              Sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-zinc-400">
          Need an account? Create it in Supabase Auth (email/password) and assign
          roles in this app.
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-400">
        <Link className="underline" href="/">
          Home
        </Link>{" "}
        ·{" "}
        <Link className="underline" href="/health">
          Health
        </Link>
      </p>
    </main>
  );
}

