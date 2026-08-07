import ProductList from "@/src/components/store/shared/product-list";
import { getFeaturedProducts } from "@/src/queries/products/homepage";

export default async function FeaturedProductsSection() {
  const productsData = await getFeaturedProducts();
  const products = productsData.products;

  return (
    <section className="rounded-2xl border border-[#7dbfa4] bg-[#7dbfa4] p-2 shadow-sm sm:rounded-3xl sm:p-4 md:p-6">
      <ProductList
        products={products}
        title="All Products"
        titleClassName="text-white"
        arrow
        horizontal
        link="/browse"
        showSeeAllTile
      />
    </section>
  );
}
