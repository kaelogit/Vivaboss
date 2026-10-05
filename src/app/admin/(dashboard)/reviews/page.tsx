import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ReviewsAdminClient from "@/components/admin/ReviewsAdminClient";
import { listAllReviewsForAdmin } from "@/lib/reviews/queries";

export const metadata = { title: "Reviews · Admin" };

export default async function AdminReviewsPage() {
  const reviews = await listAllReviewsForAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description="Site, product, and service reviews — filter by status or scope, then approve, hide, or delete."
      />
      <ReviewsAdminClient reviews={reviews} />
    </div>
  );
}
