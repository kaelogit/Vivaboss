import { createAdminClient } from "@/lib/supabase/admin";

/** Decrement stock for paid order items (once). */
export async function applyOrderInventory(orderId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, inventory_applied, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.inventory_applied) return;
  if (
    order.status !== "paid" &&
    order.status !== "processing" &&
    order.status !== "pre_order"
  )
    return;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, product_name, is_preorder")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    if (!item.product_id) continue;
    if (item.is_preorder) continue;

    const { data: product } = await supabase
      .from("products")
      .select("id, track_stock, stock_quantity")
      .eq("id", item.product_id)
      .maybeSingle();

    if (!product?.track_stock || product.stock_quantity == null) continue;

    const next = Math.max(0, product.stock_quantity - item.quantity);
    await supabase
      .from("products")
      .update({ stock_quantity: next })
      .eq("id", product.id);

    await supabase.from("inventory_movements").insert({
      product_id: product.id,
      delta: -item.quantity,
      reason: "order_paid",
      order_id: orderId,
      note: `Sold via order`,
    });
  }

  await supabase
    .from("orders")
    .update({ inventory_applied: true })
    .eq("id", orderId);
}

/**
 * Restore stock when an order is cancelled or refunded (once).
 * Only runs if inventory was previously applied.
 */
export async function restoreOrderInventory(
  orderId: string,
  reason: "order_cancelled" | "order_refunded" = "order_cancelled"
): Promise<void> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, inventory_applied, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || !order.inventory_applied) return;
  if (order.status !== "cancelled" && order.status !== "refunded") return;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, is_preorder")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    if (!item.product_id) continue;
    if (item.is_preorder) continue;

    const { data: product } = await supabase
      .from("products")
      .select("id, track_stock, stock_quantity")
      .eq("id", item.product_id)
      .maybeSingle();

    if (!product?.track_stock || product.stock_quantity == null) continue;

    const next = product.stock_quantity + item.quantity;
    await supabase
      .from("products")
      .update({ stock_quantity: next })
      .eq("id", product.id);

    await supabase.from("inventory_movements").insert({
      product_id: product.id,
      delta: item.quantity,
      reason,
      order_id: orderId,
      note:
        reason === "order_refunded"
          ? "Restored after refund"
          : "Restored after cancel",
    });
  }

  await supabase
    .from("orders")
    .update({ inventory_applied: false })
    .eq("id", orderId);
}

export async function adjustInventory(input: {
  productId: string;
  delta: number;
  note?: string;
}): Promise<{ stock_quantity: number | null }> {
  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, track_stock, stock_quantity")
    .eq("id", input.productId)
    .maybeSingle();

  if (error || !product) throw new Error(error?.message ?? "Product not found.");
  if (!product.track_stock) throw new Error("This product does not track stock.");

  const current = product.stock_quantity ?? 0;
  const next = Math.max(0, current + input.delta);

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock_quantity: next })
    .eq("id", product.id);
  if (updateError) throw new Error(updateError.message);

  await supabase.from("inventory_movements").insert({
    product_id: product.id,
    delta: input.delta,
    reason: "manual_adjust",
    note: input.note?.trim() || null,
  });

  return { stock_quantity: next };
}

/** Set absolute quantity (enables tracking if needed). */
export async function setInventoryQuantity(input: {
  productId: string;
  quantity: number;
  note?: string;
}): Promise<{
  stock_quantity: number;
  track_stock: boolean;
}> {
  const qty = Math.max(0, Math.floor(input.quantity));
  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, track_stock, stock_quantity")
    .eq("id", input.productId)
    .maybeSingle();

  if (error || !product) throw new Error(error?.message ?? "Product not found.");

  const current = product.stock_quantity ?? 0;
  const delta = qty - current;

  const { error: updateError } = await supabase
    .from("products")
    .update({ track_stock: true, stock_quantity: qty })
    .eq("id", product.id);
  if (updateError) throw new Error(updateError.message);

  if (delta !== 0) {
    await supabase.from("inventory_movements").insert({
      product_id: product.id,
      delta,
      reason: "manual_adjust",
      note: input.note?.trim() || `Set quantity to ${qty}`,
    });
  }

  return { stock_quantity: qty, track_stock: true };
}

export async function updateInventorySettings(input: {
  productId: string;
  track_stock?: boolean;
  low_stock_threshold?: number;
  stock_quantity?: number | null;
}): Promise<{
  track_stock: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number;
}> {
  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, track_stock, stock_quantity, low_stock_threshold")
    .eq("id", input.productId)
    .maybeSingle();

  if (error || !product) throw new Error(error?.message ?? "Product not found.");

  const track =
    input.track_stock !== undefined ? input.track_stock : product.track_stock;
  const threshold =
    input.low_stock_threshold !== undefined
      ? Math.max(0, Math.floor(input.low_stock_threshold))
      : product.low_stock_threshold ?? 5;

  let qty =
    input.stock_quantity !== undefined
      ? input.stock_quantity
      : product.stock_quantity;

  if (track && qty == null) qty = 0;
  if (!track) qty = null;
  if (qty != null) qty = Math.max(0, Math.floor(qty));

  const prevQty = product.stock_quantity;

  const { error: updateError } = await supabase
    .from("products")
    .update({
      track_stock: track,
      stock_quantity: qty,
      low_stock_threshold: threshold,
    })
    .eq("id", product.id);
  if (updateError) throw new Error(updateError.message);

  if (track && prevQty != null && qty != null && qty !== prevQty) {
    await supabase.from("inventory_movements").insert({
      product_id: product.id,
      delta: qty - prevQty,
      reason: "manual_adjust",
      note: "Inventory settings update",
    });
  }

  return {
    track_stock: track,
    stock_quantity: qty,
    low_stock_threshold: threshold,
  };
}
