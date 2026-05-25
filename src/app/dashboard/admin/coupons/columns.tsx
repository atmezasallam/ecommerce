"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

import { deleteAdminCoupon, setAdminCouponActive } from "@/src/app/actions/admin-coupon.actions";
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
import { Switch } from "@/src/components/ui/switch";
import { useToast } from "@/src/components/ui/use-toast";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Coupon } from "@prisma/client";

import { Badge } from "@/src/components/ui/badge";

export type AdminCouponRow = Coupon & {
  store: { id: string; name: string; url: string } | null;
};

function statusLabel(row: AdminCouponRow, now: Date): string {
  if (!row.isActive) return "Disabled";
  if (now < row.startDate) return "Scheduled";
  if (now > row.endDate) return "Expired";
  return "Active";
}

function CouponActiveSwitch({ row }: { row: AdminCouponRow }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(row.isActive);

  return (
    <Switch
      checked={checked}
      disabled={loading}
      onCheckedChange={async (next) => {
        setLoading(true);
        setChecked(next);
        const res = await setAdminCouponActive(row.id, next);
        if (!res.success) {
          setChecked(!next);
          toast({ title: "Update failed", description: res.message, variant: "destructive" });
        } else {
          router.refresh();
        }
        setLoading(false);
      }}
      aria-label="Coupon active"
    />
  );
}

const CellActions = ({ row }: { row: AdminCouponRow }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    setLoading(true);
    const res = await deleteAdminCoupon(row.id);
    if (res.success) {
      toast({ title: "Coupon deleted" });
      router.refresh();
    } else {
      toast({ title: "Error", description: res.message, variant: "destructive" });
    }
    setLoading(false);
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
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/admin/coupons/new?id=${row.id}`} className="flex cursor-pointer gap-2">
              <Edit size={15} />
              Edit
            </Link>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
              <Trash size={15} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
          <AlertDialogDescription>
            Carts using this code will lose the association. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const columns: ColumnDef<AdminCouponRow>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono font-semibold tracking-wide">{row.original.code}</span>
    ),
  },
  {
    id: "store",
    accessorFn: (row) => (row.isGlobal ? "All products" : row.store?.name ?? ""),
    header: "Scope",
    cell: ({ row }) =>
      row.original.isGlobal ? (
        <Badge variant="secondary" className="font-normal">
          Platform — all products
        </Badge>
      ) : (
        <span className="max-w-[200px] truncate" title={row.original.store?.name ?? ""}>
          {row.original.store?.name ?? "—"}
        </span>
      ),
  },
  {
    accessorKey: "discount",
    header: "% off",
    cell: ({ row }) => <span>{row.original.discount}%</span>,
  },
  {
    id: "valid",
    header: "Valid window",
    cell: ({ row }) => {
      const s = row.original.startDate;
      const e = row.original.endDate;
      return (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {format(s, "MMM d, yyyy HH:mm")} → {format(e, "MMM d, yyyy HH:mm")}
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const label = statusLabel(row.original, new Date());
      return (
        <span
          className={
            label === "Active"
              ? "text-green-600 dark:text-green-400"
              : label === "Expired" || label === "Disabled"
                ? "text-muted-foreground"
                : ""
          }
        >
          {label}
        </span>
      );
    },
  },
  {
    id: "active",
    header: "Enabled",
    cell: ({ row }) => (
      <CouponActiveSwitch key={`${row.original.id}-${row.original.isActive}`} row={row.original} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions row={row.original} />,
  },
];
