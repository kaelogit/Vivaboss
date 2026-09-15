import { Suspense } from "react";
import { CheckoutShell } from "@/components/shop/CheckoutClient";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="vb-container py-16 text-sm text-vb-muted">
          Loading checkout…
        </div>
      }
    >
      <CheckoutShell />
    </Suspense>
  );
}
