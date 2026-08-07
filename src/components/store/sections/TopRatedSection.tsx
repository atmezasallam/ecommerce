import ProductList from "@/src/components/store/shared/product-list";
import { getTopRated } from "@/src/queries/products/homepage";

export default async function TopRatedSection() {
  const topRatedProductsData = await getTopRated();
  const mostRatedProducts = topRatedProductsData.products.filter(
    (product) => product.rating >= 4 && product.variants.length > 0
  );

  return (
    <section className="rounded-2xl border border-[#7dbfa4] bg-[#7dbfa4] p-2 shadow-sm sm:rounded-3xl sm:p-4 md:p-6">
      <ProductList
        products={mostRatedProducts}
        title="Most Rated"
        titleClassName="text-white"
        arrow
        horizontal
        link="/browse?sort=top-rated"
        showSeeAllTile
      />
    </section>
  );
}
