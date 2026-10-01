import SectionIntro from "@/components/store/SectionIntro";
import OrderTrackForm from "@/components/shop/OrderTrackForm";

export const metadata = {
  title: "Track order",
  description: "Look up your Vivaboss Fusion order with your order number and email.",
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
        compact
        title="Track your order"
        description="Order number and the email used at checkout."
      />
      <div className="vb-container py-8 sm:py-10">
        <OrderTrackForm
          initialOrderNumber={order ?? ""}
          initialEmail={email ?? ""}
        />
      </div>
    </main>
  );
}
