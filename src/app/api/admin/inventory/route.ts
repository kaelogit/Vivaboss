import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import {
  adjustInventory,
  setInventoryQuantity,
  updateInventorySettings,
} from "@/lib/orders/inventory";

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
      "id, name, slug, track_stock, stock_quantity, low_stock_threshold, allow_preorder, status, images, price_gbp, categories ( id, name, slug )"
    )
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
      productId?: string;
      action?: "adjust" | "set" | "settings";
      delta?: number;
      quantity?: number;
      track_stock?: boolean;
      low_stock_threshold?: number;
      note?: string;
    };

    if (!body.productId) {
      return NextResponse.json({ error: "Missing product." }, { status: 400 });
    }

    const action = body.action ?? "adjust";

    if (action === "adjust") {
      if (!Number.isFinite(body.delta) || body.delta === 0) {
        return NextResponse.json(
          { error: "Invalid adjustment." },
          { status: 400 }
        );
      }
      const result = await adjustInventory({
        productId: body.productId,
        delta: body.delta!,
        note: body.note,
      });
      return NextResponse.json(result);
    }

    if (action === "set") {
      if (!Number.isFinite(body.quantity) || body.quantity! < 0) {
        return NextResponse.json(
          { error: "Invalid quantity." },
          { status: 400 }
        );
      }
      const result = await setInventoryQuantity({
        productId: body.productId,
        quantity: body.quantity!,
        note: body.note,
      });
      return NextResponse.json(result);
    }

    if (action === "settings") {
      const result = await updateInventorySettings({
        productId: body.productId,
        track_stock: body.track_stock,
        low_stock_threshold: body.low_stock_threshold,
        stock_quantity:
          body.quantity !== undefined ? body.quantity : undefined,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
