import ProductList from "@/src/components/store/shared/product-list";
import { getNewArrivals } from "@/src/queries/products/homepage";

export default async function NewArrivalsSection() {
  const newArrivalsData = await getNewArrivals();
  const products = newArrivalsData.products;

  return (
    <section className="rounded-2xl border border-[#7dbfa4] bg-[#7dbfa4] p-2 shadow-sm sm:rounded-3xl sm:p-4 md:p-6">
      <ProductList
        products={products}
        title="New Arrivals"
        titleClassName="text-white"
        arrow
        horizontal
        link="/browse?sort=new-arrivals"
        showSeeAllTile
      />
    </section>
  );
}
