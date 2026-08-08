/*
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";


import {
  BadgeCheck,
  BadgeMinus,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@prisma/client";
//types
import { SubCategoryWithCategoryType } from "@/src/lib/types";
import { getAllCategories } from "@/src/queries/category";
// =====================
// Columns
// =====================

export const columns: ColumnDef<SubCategoryWithCategoryType>[] = [
  {
   

    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <div className="relative h-44 min-w-64 rounded-xl overflow-hidden">
        <Image
          src={row.original.image}
          alt=""
          width={1000}
          height={1000}
          className="w-40 h-40 rounded-full object-cover shadow-2xl"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-extrabold text-lg capitalize">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => <span>/{row.original.url}</span>,
  },

  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>{
      return <span>{row.original.category.name}</span>;
  },
},
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => (
      <span className="text-muted-foreground flex justify-center">
        {row.original.featured ? (
          <BadgeCheck className="stroke-green-300" />
        ) : (
          <BadgeMinus />
        )}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions rowData={row.original} />,
  },
];

// =====================
// CellActions
// =====================

interface CellActionsProps {
  rowData: SubCategoryWithCategoryType;
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!rowData || !rowData.id) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/webhooks?subCategoryId=${rowData.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete sub-category");
      }

      toast({
        title: "Deleted sub-category",
        description: "The sub-category has been deleted.",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [categories, setCategories] = useState<Category[]>([]);
useEffect(() => {
  const fetchCategories = async () => {
    const categories = await getAllCategories();
    setCategories(categories);
  };
  fetchCategories();
},[]);



  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Edit → روح على صفحة /new مع id */                                /*}
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() =>
              router.push(
                `/dashboard/admin/subCategories/new?id=${rowData.id}`
              )
            }
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete */                                                            /*}
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2 text-red-500">
              <Trash size={15} />
              Delete sub-category
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alert for delete */                                                               /*}
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            sub-category and related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};*/



"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import { toast } from "sonner";

import {
  BadgeCheck,
  BadgeMinus,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";
//types
import { SubCategoryWithCategoryType } from "@/src/lib/types";

// =====================
// Columns
// =====================

export const columns: ColumnDef<SubCategoryWithCategoryType>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <div className="relative h-44 min-w-64 rounded-xl overflow-hidden">
        <Image
          src={row.original.image}
          alt=""
          width={1000}
          height={1000}
          className="w-40 h-40 rounded-full object-cover shadow-2xl"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-extrabold text-lg capitalize">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => <span>/{row.original.url}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span>{row.original.category.name}</span>;
    },
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => (
      <span className="text-muted-foreground flex justify-center">
        {row.original.featured ? (
          <BadgeCheck className="stroke-green-300" />
        ) : (
          <BadgeMinus />
        )}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions rowData={row.original} />,
  },
];

// =====================
// CellActions
// =====================

interface CellActionsProps {
  rowData: SubCategoryWithCategoryType;
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!rowData || !rowData.id) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/webhooks?subCategoryId=${rowData.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete sub-category");
      }

      toast.success("Deleted sub-category", {
        description: "The sub-category has been deleted.",
      });

      router.refresh();
    } catch (error: any) {
      toast.error("Error", {
        description: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Edit → روح على صفحة /new مع id */}
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() =>
              router.push(
                `/dashboard/admin/subCategories/new?id=${rowData.id}`
              )
            }
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete */}
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2 text-red-500">
              <Trash size={15} />
              Delete sub-category
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alert for delete */}
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            sub-category and related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};



