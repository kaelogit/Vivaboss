import SectionIntro from "@/components/store/SectionIntro";
import ReviewForm from "@/components/store/ReviewForm";
import ReviewsList from "@/components/store/ReviewsList";
import { listPublishedReviews } from "@/lib/reviews/queries";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Reviews",
  description: `Customer reviews of ${siteConfig.name}.`,
};

export default async function ReviewsPage() {
  const reviews = await listPublishedReviews();

  return (
    <main>
      <SectionIntro
        eyebrow="Reviews"
        title="From people who used Vivaboss"
      />

      <section className="border-b border-vb-line bg-vb-white py-14 sm:py-20">
        <div className="vb-container grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="vb-eyebrow">All reviews</p>
                <h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                  {reviews.length
                    ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                    : "Reviews"}
                </h2>
              </div>
              <a
                href="#write"
                className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-accent lg:hidden"
              >
                Write a review →
              </a>
            </div>
            <div className="mt-8">
              <ReviewsList reviews={reviews} showScope />
            </div>
          </div>

          <div id="write" className="scroll-mt-28">
            <p className="vb-eyebrow">Write a review</p>
            <div className="mt-6">
              <ReviewForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
