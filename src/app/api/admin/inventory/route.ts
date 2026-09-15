import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { adjustInventory } from "@/lib/orders/inventory";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Not configured.", products: [] },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, track_stock, stock_quantity, low_stock_threshold, status, images, categories ( name )"
    )
    .eq("track_stock", true)
    .neq("status", "archived")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      productId: string;
      delta: number;
      note?: string;
    };
    if (!body.productId || !Number.isFinite(body.delta) || body.delta === 0) {
      return NextResponse.json({ error: "Invalid adjustment." }, { status: 400 });
    }
    const result = await adjustInventory(body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Adjust failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
