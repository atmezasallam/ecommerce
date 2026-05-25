import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getActiveBanners } from "@/src/app/actions/banner.actions";
import AnnouncementBar from "@/src/components/banners/AnnouncementBar";
import { getCategoriesWithSubs } from "@/src/queries/categories";
import CategoryStrip from "@/src/components/store/shared/category-strip";
import { getActiveHomepageBrands } from "@/src/app/actions/homepage-brand.actions";
import TopRatedSection from "@/src/components/store/sections/TopRatedSection";
import FeaturedProductsSection from "@/src/components/store/sections/FeaturedProductsSection";
import NewArrivalsSection from "@/src/components/store/sections/NewArrivalsSection";

const HeroBannerSlider = dynamic(
  () => import("@/src/components/banners/HeroBannerSlider"),
  {
    ssr: false,
    loading: () => <div className="h-[400px] bg-muted animate-pulse w-full rounded-2xl" />,
  }
);
const PromotionalSixGrid = dynamic(
  () => import("@/src/components/banners/PromotionalSixGrid"),
  {
    ssr: false,
    loading: () => <div className="h-48 bg-muted animate-pulse rounded-xl w-full" />,
  }
);
const BrandsJustForYou = dynamic(
  () => import("@/src/components/banners/BrandsJustForYou"),
  {
    loading: () => <div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />,
  }
);

export default async function HomePage() {
  const categories = await getCategoriesWithSubs();
  const [heroBanners, promoBanners, homepageBrands] = await Promise.all([
    getActiveBanners("HERO"),
    getActiveBanners("PROMOTIONAL"),
    getActiveHomepageBrands(),
  ]);

  return (
    <main>
      <AnnouncementBar />
      <div className="px-4 pt-4 md:px-8 md:pt-6 lg:px-12">
        <Suspense fallback={<div className="h-[400px] bg-muted animate-pulse w-full rounded-2xl" />}>
          <HeroBannerSlider banners={heroBanners} />
        </Suspense>
      </div>

      <div className="space-y-8 p-6 md:p-14">
        <Suspense fallback={<div className="h-24 bg-muted/50 animate-pulse w-full rounded-xl" />}>
          <CategoryStrip categories={categories} />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton />}>
          <TopRatedSection />
        </Suspense>

        {promoBanners.length > 0 ? (
          <Suspense fallback={<div className="h-48 bg-muted animate-pulse rounded-xl w-full" />}>
            <PromotionalSixGrid banners={promoBanners} />
          </Suspense>
        ) : null}

        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedProductsSection />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton />}>
          <NewArrivalsSection />
        </Suspense>

        {homepageBrands.length > 0 ? (
          <Suspense fallback={<div className="h-32 bg-muted/50 animate-pulse rounded-xl w-full" />}>
            <BrandsJustForYou brands={homepageBrands} />
          </Suspense>
        ) : null}
      </div>
    </main>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
