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
          Supabase service role is not configured.
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
