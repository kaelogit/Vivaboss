import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductsList from "@/components/admin/ProductsList";

export default function AdminProductsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Catalogue, personalisation flags, installation offers, and media."
        action={{ href: "/admin/products/new", label: "Add product" }}
      />
      <ProductsList />
    </div>
  );
}
