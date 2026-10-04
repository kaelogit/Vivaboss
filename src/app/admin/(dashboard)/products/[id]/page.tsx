import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import {
  type ProductFormInput,
} from "@/lib/admin/productForm";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { CustomFieldOption } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  if (!hasAdminClient()) {
    return (
      <div>
        <AdminPageHeader title="Edit product" />
        <p className="text-sm text-vb-muted">
          Product admin is temporarily unavailable.
        </p>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  const { data: fields } = await supabase
    .from("product_custom_fields")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  const initial: ProductFormInput = {
    name: product.name,
    slug: product.slug,
    category_id: product.category_id ?? "",
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    price_gbp: Number(product.price_gbp),
    compare_at_gbp:
      product.compare_at_gbp == null ? null : Number(product.compare_at_gbp),
    cost_gbp: product.cost_gbp == null ? null : Number(product.cost_gbp),
    images: product.images ?? [],
    status: product.status,
    is_customisable: product.is_customisable,
    requires_approval: product.requires_approval,
    offers_installation: product.offers_installation,
    installation_service_key: product.installation_service_key ?? "",
    installation_price_gbp:
      product.installation_price_gbp == null
        ? null
        : Number(product.installation_price_gbp),
    track_stock: product.track_stock,
    stock_quantity: product.stock_quantity,
    allow_preorder: product.allow_preorder ?? true,
    low_stock_threshold: product.low_stock_threshold,
    meta_title: product.meta_title ?? "",
    meta_description: product.meta_description ?? "",
    preview_image_index: product.preview_image_index ?? 0,
    custom_fields: (fields ?? []).map((f) => ({
      id: f.id,
      label: f.label,
      key: f.key,
      field_type: f.field_type,
      required: f.required,
      options: Array.isArray(f.options)
        ? (f.options as CustomFieldOption[])
        : [],
      sort_order: f.sort_order,
      show_on_preview: f.show_on_preview ?? false,
      preview_x: f.preview_x == null ? null : Number(f.preview_x),
      preview_y: f.preview_y == null ? null : Number(f.preview_y),
      preview_w: f.preview_w == null ? null : Number(f.preview_w),
      preview_h: f.preview_h == null ? null : Number(f.preview_h),
      preview_caption: f.preview_caption ?? "",
      max_length: f.max_length ?? null,
      preview_ink: f.preview_ink === "dark" ? "dark" : "light",
      preview_fit: f.preview_fit === "contain" ? "contain" : "cover",
      preview_image_index: f.preview_image_index ?? 0,
      preview_font:
        f.preview_font === "serif" || f.preview_font === "script"
          ? f.preview_font
          : "sans",
      preview_size:
        f.preview_size === "sm" || f.preview_size === "lg" ? f.preview_size : "md",
    })),
  };

  return (
    <div>
      <AdminPageHeader
        title={product.name}
        description="Update catalogue details, custom fields, and media."
      />
      <ProductForm productId={id} initial={initial} />
    </div>
  );
}
