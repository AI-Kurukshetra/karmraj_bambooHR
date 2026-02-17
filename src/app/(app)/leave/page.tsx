import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeavePage() {
  const supabase = createSupabaseServerClient();

  const { data: requests, error } = await supabase
    .from("leave_requests")
    .select("id, start_date, end_date, reason, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load leave requests: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leave</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Showing up to 50 leave requests (RLS-filtered).
          </p>
        </div>
        <Link
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          href="/reports"
        >
          Go to reports
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Requested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(requests ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  {r.start_date} → {r.end_date}
                </td>
                <td className="px-4 py-3 text-zinc-700">{r.reason}</td>
                <td className="px-4 py-3 font-medium">{r.status}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

