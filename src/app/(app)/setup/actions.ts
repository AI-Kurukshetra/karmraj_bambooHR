"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function bootstrapOrg(formData: FormData) {
  const name = String(formData.get("org_name") ?? "").trim();
  if (!name) redirect("/setup?error=Organization%20name%20is%20required");

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("bootstrap_current_user_org", {
    p_org_name: name,
  });

  if (error) redirect(`/setup?error=${encodeURIComponent(error.message)}`);

  redirect(`/dashboard?org=${encodeURIComponent(String(data ?? ""))}`);
}

