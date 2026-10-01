import { NextResponse } from "next/server";
import { listActiveProducts } from "@/lib/products/queries";

export async function GET() {
  const products = await listActiveProducts({ limit: 4 });
  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] ?? null,
      price_gbp: Number(p.price_gbp),
      category: p.categories?.name ?? null,
    })),
  });
}
