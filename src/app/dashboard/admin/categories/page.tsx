/*// data table 
import DataTable from "@/src/components/ui/data-table";
import { Plus } from "lucide-react";
import CategoryDetails from "@/src/components/dashboard/forms/category-details";
import { columns } from "@/src/app/dashboard/admin/categories/new/columns";
// queries
import { getAllCategories } from "@/src/queries/category";

export default async function AdminCategoriesPage() {
  // Fetching categories data from database
  const categories = await getAllCategories();

  // if no categories found, return null (or ممكن تعرضي رسالة بدلها)
  if (!categories || categories.length === 0) return null;

  return (
    <DataTable
    heading="jsjldjddddddjjd"
      actionButtonText={
        <>
          <Plus size={15} />
          Create Category
        </>
      }
      // إمّا تعطي قيمة للـ cloudinary_key
      modalChildren={
        <CategoryDetails />
      }
      // أو لو خلتّيه optional في CategoryDetailsProps:
      // modalChildren={<CategoryDetails />}

      newTabLink="/dashboard/admin/categories/new"
      filterValue="name"
      data={categories}
      searchPlaceholder="Search category name..."
      columns={columns}
    />
  );
}





*/
// src/app/dashboard/admin/categories/page.tsx

import DataTable from "@/src/components/ui/data-table";
import { getAllCategories } from "@/src/queries/category";
import { columns } from "./columns";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  if (!categories) return null;

  return (




    
    <div className="space-y-4">






      
      {/* HEADER — العنوان + زر الإضافة */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>

        <Button asChild className="h-12 flex items-center gap-2">
          <Link href="/dashboard/admin/categories/new">
            <Plus size={15} />
            Create Category
          </Link>
        </Button>
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={categories}
        filterValue="name"
        searchPlaceholder="Search category name..."
      />
    </div>
  );
}













/*

 <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>*/