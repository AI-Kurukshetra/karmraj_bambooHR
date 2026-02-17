import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: { id: string; docId: string };
  },
) {
  const supabase = createSupabaseServerClient();

  const { data: doc, error } = await supabase
    .from("employee_documents")
    .select("id, employee_id, file_path")
    .eq("id", params.docId)
    .maybeSingle();

  if (error || !doc) {
    return NextResponse.json(
      { error: error?.message ?? "Not found" },
      { status: 404 },
    );
  }

  if (doc.employee_id !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("employee-documents")
    .createSignedUrl(doc.file_path, 60);

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signedError?.message ?? "Failed to sign URL" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}

