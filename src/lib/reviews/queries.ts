import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { hasPublicSupabaseConfig } from "@/lib/supabase/config";
import type { Review } from "@/types/database";

export type PublicReview = Pick<
  Review,
  "id" | "author_name" | "rating" | "body" | "created_at" | "product_id"
>;

export async function listPublishedReviews(options?: {
  productId?: string;
  limit?: number;
}): Promise<PublicReview[]> {
  if (!hasPublicSupabaseConfig()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("reviews")
      .select("id, author_name, rating, body, created_at, product_id")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (options?.productId) {
      query = query.eq("product_id", options.productId);
    }
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as PublicReview[];
  } catch {
    return [];
  }
}

export async function listAllReviewsForAdmin(): Promise<Review[]> {
  if (!hasAdminClient()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Review[];
}
