import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="New product"
        description="Create a standard, customisable, or approval-required product."
      />
      <ProductForm />
    </div>
  );
}
