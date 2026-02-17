import Link from "next/link";
import Image from "next/image";

import { signInWithPassword } from "@/app/login/actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="/peopleops-wordmark.svg"
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
        <p className="mt-1 text-sm text-zinc-600">
          Use your work email and password.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <form action={signInWithPassword} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
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
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            type="submit"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-500">
          Need an account? Create it in Supabase Auth (email/password) and assign
          roles in this app.
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
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

