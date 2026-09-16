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
        description="Approve new submissions to publish them, hide anything that shouldn’t stay live, or delete permanently."
      />
      <ReviewsAdminClient reviews={reviews} />
    </div>
  );
}
