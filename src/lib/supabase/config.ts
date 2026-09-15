/** Public Supabase env — safe on server and client. */
export function getSupabaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return undefined;
  // Reject leftover placeholders like NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(raw)) return undefined;
  return raw.replace(/\/$/, "");
}

export function getSupabaseAnonKey(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!raw || raw.length < 40) return undefined;
  if (raw === "NEXT_PUBLIC_SUPABASE_ANON_KEY") return undefined;
  return raw;
}

export function hasPublicSupabaseConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Stub credentials so prerender/build does not throw when env is missing. */
export const SUPABASE_BUILD_STUB_URL = "http://127.0.0.1:54321";
export const SUPABASE_BUILD_STUB_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export function resolvePublicSupabaseConfig() {
  return {
    url: getSupabaseUrl() ?? SUPABASE_BUILD_STUB_URL,
    anonKey: getSupabaseAnonKey() ?? SUPABASE_BUILD_STUB_ANON_KEY,
  };
}

/** Temporary shell access before Supabase is connected (dev only). */
export function allowAdminPreview(): boolean {
  return (
    process.env.ALLOW_ADMIN_PREVIEW === "true" &&
    process.env.NODE_ENV !== "production"
  );
}
