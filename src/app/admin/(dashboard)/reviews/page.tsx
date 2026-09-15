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
        description="Customer name, star rating, and written feedback from the public site. Delete anything that shouldn’t stay live."
      />
      <ReviewsAdminClient reviews={reviews} />
    </div>
  );
}
