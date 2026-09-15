import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "customer-uploads";
const DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 days for display

/** True if value looks like a storage path we own (not a full URL). */
export function isCustomerUploadPath(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return false;
  return (
    value.startsWith("personalisation/") ||
    value.startsWith("bookings/") ||
    value.includes("/")
  );
}

export async function signCustomerUpload(
  path: string,
  expiresIn = DEFAULT_TTL
): Promise<string | null> {
  if (!path || path.startsWith("http")) return path || null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    console.error("signCustomerUpload", error);
    return null;
  }
  return data.signedUrl;
}

export async function signCustomerUploads(
  paths: string[],
  expiresIn = DEFAULT_TTL
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(
    paths.map(async (path) => {
      if (!path) return;
      if (path.startsWith("http")) {
        out[path] = path;
        return;
      }
      const url = await signCustomerUpload(path, expiresIn);
      if (url) out[path] = url;
    })
  );
  return out;
}
