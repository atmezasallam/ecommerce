/*import SupCategoryDetails from "@/src/components/ui/dashboard/forms/subCategory-details";
import { getAllCategories } from "@/src/queries/category";

export default async function AdminNewSubCategoriesPage() {
const categories=await getAllCategories();

return <SupCategoryDetails categories={categories}/>;


}

*/





// src/app/dashboard/admin/subCategories/new/page.tsx

import SubCategoryDetails from "@/src/components/dashboard/forms/subCategory-details";
import { getAllCategories } from "@/src/queries/category";
import { getSubCategory } from "@/src/queries/subCategory";

type AdminNewSubCategoriesPageProps = {
  searchParams: {
    id?: string;
  };
};

export default async function AdminNewSubCategoriesPage({
  searchParams,
}: AdminNewSubCategoriesPageProps) {

  const categories = await getAllCategories();

  const subCategoryId = searchParams.id;

  // لو جاي id → جبّي السطر من الداتابيس
  const subCategory = subCategoryId
    ? await getSubCategory(subCategoryId)
    : null;

  return (
    <SubCategoryDetails
      categories={categories}
      data={subCategory ?? undefined}   // 👈 هذا المهم
    />
  );
}



