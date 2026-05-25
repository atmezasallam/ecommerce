/*//DataTABLE
import DataTable from "@/src/components/ui/data-table";
import SubCategoriesDetails from "@/src/components/dashboard/forms/subCategory-details";

//queries 
import { getAllSubCategories } from "@/src/queries/subCategory";
import { getAllCategories } from "@/src/queries/category";

//react 
import { Plus } from "lucide-react";
import { columns } from "../subCategories/columns";

export default async function AdminSubCategoriesPage() {
//fetch subCategories data from the database
const subCategories=await getAllSubCategories();

//checking category data from the database
if(!subCategories) return null;//if no subcategories found, return null

// fetching categories data from the database
const categories=await getAllCategories();



return (
<DataTable 

actionButtonText={
        <>
        <Plus size={15} />
        Create SubCategory
        </>
     }
     modalChildren={<SubCategoriesDetails categories={categories}/>}
     filterValue="name"
     data={subCategories}
     searchPlaceholder="Search subCategory name...."
     columns={columns}
   />
);
}
*/





// DataTABLE
import DataTable from "@/src/components/ui/data-table";
import SubCategoriesDetails from "@/src/components/dashboard/forms/subCategory-details";

// queries 
import { getAllSubCategories } from "@/src/queries/subCategory";
import { getAllCategories } from "@/src/queries/category";

// react / ui
import Link from "next/link";
import { Plus } from "lucide-react";
import { columns } from "../subCategories/columns";

export default async function AdminSubCategoriesPage() {
  // fetch subCategories data from the database
  const subCategories = await getAllSubCategories();

  // checking category data from the database
  if (!subCategories) return null; // لو null (مش لو array فاضية)

  // fetching categories data from the database
  const categories = await getAllCategories();

  return (

  


    <DataTable
      actionButtonText={
        // 👇👇👇 التعديل الوحيد المهم
        <Link
          href="/dashboard/admin/subCategories/new"
          className="flex items-center gap-2"
        >
          <Plus size={15} />
          Create SubCategory
        </Link>
      }
      modalChildren={<SubCategoriesDetails categories={categories} />}
      filterValue="name"
      data={subCategories}
      searchPlaceholder="Search subCategory name...."
      columns={columns}
    />
  );
}
