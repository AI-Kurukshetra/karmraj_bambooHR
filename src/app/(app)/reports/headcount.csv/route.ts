import { NextResponse } from "next/server";

import { toCsv } from "@/lib/csv";
import { requirePermission } from "@/lib/permissions/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await requirePermission("reports.export");

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("report_headcount_by_department");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv(
    (data ?? []).map((r) => ({
      department: r.department_name,
      headcount: r.headcount,
    })),
  );

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="headcount_by_department.csv"`,
      "cache-control": "no-store",
    },
  });
}

