import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseConfig } from "@/lib/supabase/config";
import { shopCategories } from "@/lib/navigation";
import type { Category } from "@/types/database";

export type CategoryView = {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  href: string;
};

/** DB categories when Supabase is live; otherwise navigation fallback. */
export async function getVisibleCategories(): Promise<CategoryView[]> {
  if (!hasPublicSupabaseConfig()) {
    return shopCategories.map((c) => ({
      slug: c.slug,
      name: c.label,
      description: c.blurb,
      href: c.href,
    }));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, sort_order")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return shopCategories.map((c) => ({
        slug: c.slug,
        name: c.label,
        description: c.blurb,
        href: c.href,
      }));
    }

    return (data as Pick<Category, "id" | "slug" | "name" | "description">[]).map(
      (row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        href: `/shop/${row.slug}`,
      })
    );
  } catch {
    return shopCategories.map((c) => ({
      slug: c.slug,
      name: c.label,
      description: c.blurb,
      href: c.href,
    }));
  }
}
