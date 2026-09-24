import HomeHero from "@/components/store/HomeHero";
import HomePromiseStrip from "@/components/home/HomePromiseStrip";
import HomePathChooser from "@/components/home/HomePathChooser";
import HomeShopMosaic from "@/components/home/HomeShopMosaic";
import HomeProductMarquee from "@/components/home/HomeProductMarquee";
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
    listActiveProducts({ limit: 16 }),
    getPublicHomepage(),
    listPublishedReviews({ limit: 3 }),
  ]);

  const splitCatalogue = featured.length >= 4;
  const marqueeProducts = splitCatalogue
    ? featured.slice(0, Math.min(6, featured.length - 1))
    : [];
  const railProducts = (
    splitCatalogue ? featured.slice(marqueeProducts.length) : featured
  ).slice(0, 8);

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
      <HomeProductMarquee products={marqueeProducts} />
      <HomeFeaturedRail products={railProducts} />
      <HomeFashionBand />
      <HomePersonalised />
      <HomeServicesBand />
      <HomeSmartCrossSell />
      <HomeCourierBand />
      <HomeNeedFinder />
      <HomeReviews reviews={reviews} />
      <HomeBrandStory />
      <HomeTrust />
      <HomeClosing />
    </main>
  );
}
