export const dynamic = "force-dynamic";

export default function HealthPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-lg font-semibold">OK</h1>
      <p className="mt-2 text-sm text-zinc-600">
        App is running. Configure Supabase env vars in <code>.env.local</code>.
      </p>
    </main>
  );
}

