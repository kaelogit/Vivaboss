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
