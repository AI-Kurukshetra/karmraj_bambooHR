import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof serverSchema>;

export function getPublicEnvSafe(): PublicEnv | null {
  const parsed = serverSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) return null;
  return parsed.data;
}

export function getPublicEnv(): PublicEnv {
  const parsed = getPublicEnvSafe();

  if (!parsed) {
    throw new Error(
      "Missing/invalid env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example -> .env.local and fill values.",
    );
  }

  return parsed;
}

