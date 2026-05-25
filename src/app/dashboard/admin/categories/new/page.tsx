/*import CategoriesDetails from "@/src/components/ui/dashboard/forms/category-details";

   
   
   export default function AdminNewCategoriesPage() {


return (

<div className="w-full ">
   <CategoriesDetails/>

     </div>
    

);
}

*/

// src/app/dashboard/admin/categories/new/page.tsx

import { getCategory } from "@/src/queries/category";
import CategoryDetails from "@/src/components/dashboard/forms/category-details";

interface CategoryNewPageProps {
  searchParams?: {
    id?: string;
  };
}

export default async function CategoryNewPage({
  searchParams,
}: CategoryNewPageProps) {
  const id = searchParams?.id;
  let category = null;

  if (id) {
    category = await getCategory(id);
  }

  const isEdit = !!category;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit Category" : "Create Category"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the selected category."
            : "Create a new category for your products."}
        </p>
      </div>

      <CategoryDetails
        // لو تعديل نمرّر الداتا، لو إنشاء تضل undefined
        data={category ?? undefined}
       
      />
    </div>
  );
}
