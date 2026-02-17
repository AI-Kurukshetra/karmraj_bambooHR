import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPublicEnvSafe } from "@/lib/env";
import type { Database } from "@/types/database";

export async function updateSupabaseSession(request: NextRequest) {
  const env = getPublicEnvSafe();
  if (!env) {
    // Allow the app to render a config page in dev if env vars are missing.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = env;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh session if expired (required for Server Components).
  try {
    await supabase.auth.getUser();
  } catch {
    // Ignore invalid refresh token errors; user will be treated as signed out.
  }

  return response;
}

