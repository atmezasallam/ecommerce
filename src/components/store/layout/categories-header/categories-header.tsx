import { getAllCategories } from "@/src/queries/category";
import { getAllOfferTags } from "@/src/queries/offerTag";
import CategoriesHeaderContainer from "@/src/components/store/layout/categories-header/container";

export default async function CategoriesHeader() {
  // Fetch all categories
  const categories = await getAllCategories();

  // Fetch all offer tags
  const offerTags = await getAllOfferTags();
  return (
    <div className="w-full border-b border-black/10 bg-[#7dbfa4] px-0 py-2 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.25)]">
      <CategoriesHeaderContainer
        categories={categories}
        offerTags={offerTags}
      />
    </div>
  );
}