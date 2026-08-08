"use client";

// React, Next.js imports
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// UI components
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
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

// Hooks and utilities
import { toast } from "sonner";


// Lucide icons
import { CopyPlus, FilePenLine, MoreHorizontal, Trash } from "lucide-react";

// Queries
import { deleteProduct } from "@/src/queries/product";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Types
import { StoreProductType } from "@/src/lib/types";
import Link from "next/link";

export const columns: ColumnDef<StoreProductType>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-3">
          {/* Product name */}
          <h1 className="font-bold truncate pb-3 border-b capitalize">
            {row.original.name}
          </h1>
          {/* Product variants */}
          <div className="relative flex flex-wrap gap-2">
            {row.original.variants.map((variant) => (
              <div key={variant.id} className="flex flex-col gap-y-2">
                <div className="relative p-2">
                  <Image
                    src={variant.images[0]?.url ?? variant.variantImage}
                    alt={`${variant.variantName} image`}
                    width={1000}
                    height={1000}
                    className="max-w-72 h-72 rounded-md object-cover shadow-sm"
                  />
                  {/* Info */}
                  <div className="flex mt-2 gap-2 p-1">
                    {/* Colors */}
                    <div className="w-7 flex flex-col gap-2 rounded-md">
                      {variant.colors.map((color) => (
                        <span
                          key={color.name}
                          className="w-5 h-5 rounded-full shadow-2xl"
                          style={{ backgroundColor: color.name }}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      {/* Name of variant */}
                      <h1 className="max-w-40 capitalize text-sm">
                        {variant.variantName}
                      </h1>
                      <Button variant="outline" size="sm" className="mt-2 gap-1.5" asChild>
                        <Link
                          href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/${variant.id}`}
                        >
                          <FilePenLine className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      {/* Sizes */}
                      <div className="flex flex-wrap gap-2 max-w-72 mt-1">
                        {variant.sizes.map((size) => (
                          <span
                            key={size.size}
                            className="w-fit p-1 rounded-md text-[11px] font-medium border-2 bg-surface/10"
                          >
                            {size.size} - ({size.quantity}) - {size.price}$
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span>{row.original.category.name}</span>;
    },
  },
  {
    accessorKey: "subCategory",
    header: "SubCategory",
    cell: ({ row }) => {
      return <span>{row.original.subCategory.name}</span>;
    },
  },
 
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      return <span>{row.original.brand}</span>;
    },
  },

  {
    accessorKey: "new-variant",
    header: "",
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/new`}
        >
          <CopyPlus className="hover:text-blue-200" />
        </Link>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;

      return (
        <CellActions
          productId={rowData.id}
          storeUrl={rowData.store.url}
          variants={rowData.variants}
        />
      );
    },
  },
];

// Define props interface for CellActions component
interface CellActionsProps {
  productId: string;
  storeUrl: string;
  variants: StoreProductType["variants"];
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({
  productId,
  storeUrl,
  variants,
}) => {
  // Hooks
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Return null if rowData or rowData.id don't exist
  if (!productId) return null;

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
          {variants.map((variant) => (
            <DropdownMenuItem key={variant.id} asChild>
              <Link
                href={`/dashboard/seller/stores/${storeUrl}/products/${productId}/variants/${variant.id}`}
                className="flex gap-2"
              >
                <FilePenLine size={15} />
                Edit {variant.variantName}
              </Link>
            </DropdownMenuItem>
          ))}
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
              <Trash size={15} /> Delete product
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the
            product and variants that exist inside product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={async () => {
              try {
                setLoading(true);
                await deleteProduct(productId);
                toast.success("Deleted product", {
                  description: "The product has been deleted.",
                });
                router.refresh();
              } catch (error: any) {
                toast.error("Error", {
                  description: error?.message || "Something went wrong",
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};