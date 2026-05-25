import ProductList from "@/src/components/store/shared/product-list";
import { getNewArrivals } from "@/src/queries/products/homepage";

export default async function NewArrivalsSection() {
  const newArrivalsData = await getNewArrivals();
  const products = newArrivalsData.products;

  return (
    <section className="rounded-3xl border border-[#7dbfa4] bg-[#7dbfa4] p-4 shadow-sm md:p-6">
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
