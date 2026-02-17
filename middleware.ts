import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - static files (_next/static)
     * - image optimization (_next/image)
     * - favicon
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

