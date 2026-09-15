import HomeHero from "@/components/store/HomeHero";
import HomePromiseStrip from "@/components/home/HomePromiseStrip";
import HomePathChooser from "@/components/home/HomePathChooser";
import HomeShopMosaic from "@/components/home/HomeShopMosaic";
import HomeFeaturedRail from "@/components/home/HomeFeaturedRail";
import HomeFashionBand from "@/components/home/HomeFashionBand";
import HomePersonalised from "@/components/home/HomePersonalised";
import HomeServicesBand from "@/components/home/HomeServicesBand";
import HomeSmartCrossSell from "@/components/home/HomeSmartCrossSell";
import HomeCourierBand from "@/components/home/HomeCourierBand";
import HomeNeedFinder from "@/components/home/HomeNeedFinder";
import HomeReviews from "@/components/home/HomeReviews";
import HomeBrandStory from "@/components/home/HomeBrandStory";
import HomeTrust from "@/components/home/HomeTrust";
import HomeClosing from "@/components/home/HomeClosing";
import { getPublicHomepage } from "@/lib/content/siteSettings";
import { listActiveProducts } from "@/lib/products/queries";
import { listPublishedReviews } from "@/lib/reviews/queries";

export default async function HomePage() {
  const [featured, homepage, reviews] = await Promise.all([
    listActiveProducts({ limit: 8 }),
    getPublicHomepage(),
    listPublishedReviews({ limit: 3 }),
  ]);

  return (
    <main>
      <div className="bg-vb-ink">
        <HomeHero content={homepage} />
        <HomePromiseStrip />
      </div>
      <HomePathChooser
        eyebrow={homepage.pathChooserEyebrow}
        title={homepage.pathChooserTitle}
      />
      <HomeShopMosaic />
      <HomeFeaturedRail products={featured} />
      <HomeFashionBand />
      <HomePersonalised />
      <HomeServicesBand />
      <HomeSmartCrossSell />
      <HomeCourierBand />
      <HomeNeedFinder />
      <HomeReviews reviews={reviews} />
      <HomeBrandStory
        headline={homepage.craftHeadline}
        body={homepage.craftBody}
      />
      <HomeTrust />
      <HomeClosing />
    </main>
  );
}
