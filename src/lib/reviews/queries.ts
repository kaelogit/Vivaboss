import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { hasPublicSupabaseConfig } from "@/lib/supabase/config";
import type { Review, ReviewServiceType } from "@/types/database";
import { reviewScopeLabel } from "@/lib/reviews/scope";
import { reviewMediaPublicUrl } from "@/lib/storage/reviewMedia";

export type PublicReview = Pick<
  Review,
  | "id"
  | "author_name"
  | "rating"
  | "body"
  | "created_at"
  | "product_id"
  | "service_type"
  | "image_path"
> & {
  product_name?: string | null;
  scope_label?: string;
  image_url?: string | null;
};

export type AdminReview = Review & {
  product_name: string | null;
  scope_label: string;
  image_url: string | null;
};

export async function listPublishedReviews(options?: {
  productId?: string;
  serviceType?: ReviewServiceType;
  /** When true, only general site reviews (no product / service). */
  generalOnly?: boolean;
  limit?: number;
}): Promise<PublicReview[]> {
  if (!hasPublicSupabaseConfig()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("reviews")
      .select(
        "id, author_name, rating, body, created_at, product_id, service_type, image_path, products(name)"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (options?.productId) {
      query = query.eq("product_id", options.productId).is("service_type", null);
    }
    if (options?.serviceType) {
      query = query
        .eq("service_type", options.serviceType)
        .is("product_id", null);
    }
    if (options?.generalOnly) {
      query = query.is("product_id", null).is("service_type", null);
    }
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row) => {
      const productJoin = row.products as { name?: string } | null;
      const productName = productJoin?.name ?? null;
      return {
        id: row.id,
        author_name: row.author_name,
        rating: row.rating,
        body: row.body,
        created_at: row.created_at,
        product_id: row.product_id,
        service_type: row.service_type,
        image_path: row.image_path,
        image_url: reviewMediaPublicUrl(row.image_path),
        product_name: productName,
        scope_label: reviewScopeLabel({
          productName,
          productId: row.product_id,
          serviceType: row.service_type,
        }),
      } satisfies PublicReview;
    });
  } catch {
    return [];
  }
}

export async function listAllReviewsForAdmin(): Promise<AdminReview[]> {
  if (!hasAdminClient()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return data.map((row) => {
    const productJoin = row.products as { name?: string } | null;
    const productName = productJoin?.name ?? null;
    const { products: _products, ...review } = row as Review & {
      products: { name?: string } | null;
    };
    return {
      ...(review as Review),
      product_name: productName,
      scope_label: reviewScopeLabel({
        productName,
        productId: review.product_id,
        serviceType: review.service_type,
      }),
      image_url: reviewMediaPublicUrl(review.image_path),
    };
  });
}
