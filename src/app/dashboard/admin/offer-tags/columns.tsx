"use client";

import { useState } from "react";
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

import { useToast } from "@/src/components/ui/use-toast";
import { useModal } from "@/src/providers/modal.provider";
import CustomModal from "@/src/components/dashboard/shared/custom-model";
import OfferTagDetails from "@/src/components/dashboard/forms/offer-tag-details";

import { Edit, MoreHorizontal, Trash } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";
import type { OfferTag } from "@prisma/client";
import { deleteOfferTag, getOfferTag } from "@/src/queries/offerTag";

// =====================
// Columns
// =====================

export const columns: ColumnDef<OfferTag>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.original.id.substring(0, 8)}...
      </span>
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
    cell: ({ row }) => (
      <a
        href={row.original.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#95CFB2] hover:underline"
      >
        {row.original.url}
      </a>
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
  rowData: OfferTag;
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { setOpen, setClose } = useModal();

  if (!rowData || !rowData.id) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteOfferTag(rowData.id);

      toast({
        title: "Deleted offer tag",
        description: "The offer tag has been deleted successfully.",
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

          {/* Edit */}
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal heading="Edit Offer Tag" subheading="Update offer tag details">
                  <OfferTagDetails data={rowData} />
                </CustomModal>,
                async () => {
                  return {
                    rowData: await getOfferTag(rowData.id),
                  };
                }
              );
            }}
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete */}
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2 text-red-500">
              <Trash size={15} />
              Delete offer tag
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
            offer tag. If this tag is associated with any products, the deletion
            will be prevented to maintain data integrity.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={handleDelete}
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

