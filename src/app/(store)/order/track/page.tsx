import SectionIntro from "@/components/store/SectionIntro";
import OrderTrackForm from "@/components/shop/OrderTrackForm";

export const metadata = {
  title: "Track order",
  description: "Look up your Vivaboss Fusion order status with order number and email.",
};

export default async function OrderTrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { order, email } = await searchParams;

  return (
    <main>
      <SectionIntro
        eyebrow="Orders"
        title="Track your order"
        description="Enter the order number from your confirmation email and the email you used at checkout."
      />
      <div className="vb-container py-12 sm:py-16">
        <OrderTrackForm
          initialOrderNumber={order ?? ""}
          initialEmail={email ?? ""}
        />
      </div>
    </main>
  );
}
