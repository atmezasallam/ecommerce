import ProductList from "@/src/components/store/shared/product-list";
import { getTopRated } from "@/src/queries/products/homepage";

export default async function TopRatedSection() {
  const topRatedProductsData = await getTopRated();
  const mostRatedProducts = topRatedProductsData.products.filter(
    (product) => product.rating > 4
  );

  return (
    <section className="rounded-3xl border border-[#7dbfa4] bg-[#7dbfa4] p-4 shadow-sm md:p-6">
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
