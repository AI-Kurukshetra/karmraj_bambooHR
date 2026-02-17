import { NextResponse } from "next/server";

import { toCsv } from "@/lib/csv";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await requirePermission("reports.export");

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("report_active_vs_inactive");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : undefined;

  const csv = toCsv([
    {
      active: row?.active_count ?? 0,
      inactive: row?.inactive_count ?? 0,
    },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="active_vs_inactive.csv"`,
      "cache-control": "no-store",
    },
  });
}

