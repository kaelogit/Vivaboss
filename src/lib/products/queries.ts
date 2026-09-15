import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseConfig } from "@/lib/supabase/config";
import type { CustomFieldOption, Product, ProductCustomField } from "@/types/database";

export type ProductWithCategory = Product & {
  categories: { id: string; slug: string; name: string } | null;
};

export type ProductDetail = ProductWithCategory & {
  custom_fields: Array<
    ProductCustomField & { options: CustomFieldOption[] }
  >;
};

function parseOptions(raw: unknown): CustomFieldOption[] {
  if (!Array.isArray(raw)) return [];
  return raw as CustomFieldOption[];
}

export async function listActiveProducts(options?: {
  categorySlug?: string;
  limit?: number;
}): Promise<ProductWithCategory[]> {
  if (!hasPublicSupabaseConfig()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, categories ( id, slug, name )")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (options?.categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", options.categorySlug)
        .maybeSingle();
      if (!cat) return [];
      query = query.eq("category_id", cat.id);
    }

    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as ProductWithCategory[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  if (!hasPublicSupabaseConfig()) return null;

  try {
    const supabase = await createClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*, categories ( id, slug, name )")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error || !product) return null;

    const { data: fields } = await supabase
      .from("product_custom_fields")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true });

    return {
      ...(product as ProductWithCategory),
      custom_fields: (fields ?? []).map((f) => ({
        ...f,
        options: parseOptions(f.options),
      })),
    };
  } catch {
    return null;
  }
}

export async function listRelatedProducts(
  product: ProductWithCategory,
  limit = 4
): Promise<ProductWithCategory[]> {
  if (!hasPublicSupabaseConfig()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, categories ( id, slug, name )")
      .eq("status", "active")
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (product.category_id) {
      query = query.eq("category_id", product.category_id);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    if (data.length >= limit) return data as ProductWithCategory[];

    const { data: extra } = await supabase
      .from("products")
      .select("*, categories ( id, slug, name )")
      .eq("status", "active")
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    const seen = new Set(data.map((p) => p.id));
    const merged = [...data];
    for (const p of extra ?? []) {
      if (seen.has(p.id)) continue;
      merged.push(p);
      if (merged.length >= limit) break;
    }
    return merged as ProductWithCategory[];
  } catch {
    return [];
  }
}
