import { notFound } from "next/navigation";
import ProductDetailView from "@/components/shop/ProductDetailView";
import {
  getProductBySlug,
  listRelatedProducts,
} from "@/lib/products/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.short_description ||
      product.description ||
      undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await listRelatedProducts(product, 4);
  return <ProductDetailView product={product} related={related} />;
}
