import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requirePermission(permissionKey: string) {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase.rpc("has_permission", {
    p_permission_key: permissionKey,
  });

  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Forbidden");
}

