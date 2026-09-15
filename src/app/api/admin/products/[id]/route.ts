import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  normalizeCustomFields,
  productFormToRow,
  validateProductForm,
  type CustomFieldInput,
  type ProductFormInput,
} from "@/lib/admin/productForm";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { CustomFieldOption } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

function parseOptions(raw: unknown): CustomFieldOption[] {
  if (!Array.isArray(raw)) return [];
  return raw as CustomFieldOption[];
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase service role not configured." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: fields } = await supabase
    .from("product_custom_fields")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  const form: ProductFormInput = {
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
    custom_fields: (fields ?? []).map(
      (f): CustomFieldInput => ({
        id: f.id,
        label: f.label,
        key: f.key,
        field_type: f.field_type,
        required: f.required,
        options: parseOptions(f.options),
        sort_order: f.sort_order,
      })
    ),
  };

  return NextResponse.json({ product, form });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase service role not configured." },
      { status: 503 }
    );
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as ProductFormInput;
    const validationError = validateProductForm(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createAdminClient();
    const row = productFormToRow(body);

    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A product with this slug already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("product_custom_fields").delete().eq("product_id", id);
    const fields = normalizeCustomFields(body.custom_fields);
    if (fields.length) {
      const { error: fieldsError } = await supabase
        .from("product_custom_fields")
        .insert(fields.map((f) => ({ ...f, product_id: id })));
      if (fieldsError) {
        return NextResponse.json({ error: fieldsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id, slug: row.slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase service role not configured." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Soft archive by default
  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
