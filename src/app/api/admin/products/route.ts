import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  normalizeCustomFields,
  productFormToRow,
  validateProductForm,
  type ProductFormInput,
} from "@/lib/admin/productForm";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase service role not configured.", products: [] },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, price_gbp, status, images, stock_quantity, track_stock, is_customisable, requires_approval, offers_installation, created_at, categories ( id, slug, name )"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase service role not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as ProductFormInput;
    const validationError = validateProductForm(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createAdminClient();
    const row = productFormToRow(body);

    const { data, error } = await supabase
      .from("products")
      .insert(row)
      .select("id, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A product with this slug already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const fields = normalizeCustomFields(body.custom_fields);
    if (fields.length) {
      const { error: fieldsError } = await supabase
        .from("product_custom_fields")
        .insert(fields.map((f) => ({ ...f, product_id: data.id })));
      if (fieldsError) {
        await supabase.from("products").delete().eq("id", data.id);
        return NextResponse.json({ error: fieldsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id: data.id, slug: data.slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
