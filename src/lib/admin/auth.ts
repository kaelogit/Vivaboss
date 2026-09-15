import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import {
  allowAdminPreview,
  hasPublicSupabaseConfig,
} from "@/lib/supabase/config";

export async function getSessionUser(): Promise<User | null> {
  if (!hasPublicSupabaseConfig()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  try {
    if (hasAdminClient()) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      return data?.role === "admin";
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    return data?.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdminUser(): Promise<User | null> {
  if (allowAdminPreview() && !hasPublicSupabaseConfig()) {
    return {
      id: "preview-admin",
      email: "preview@vivabossfusion.co.uk",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
  }

  const user = await getSessionUser();
  if (!user) return null;
  const ok = await isAdminUser(user.id);
  return ok ? user : null;
}
