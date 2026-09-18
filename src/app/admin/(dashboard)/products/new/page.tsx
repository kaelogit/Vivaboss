import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="New product"
        description="First pick how customers buy it — then fill in the simple bits."
      />
      <ProductForm />
    </div>
  );
}
