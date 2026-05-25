"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

import {
  deleteSellerCoupon,
  setSellerCouponActive,
} from "@/src/app/actions/seller-coupon.actions";
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
import { MoreHorizontal, Trash } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export type SellerCouponRow = {
  id: string;
  code: string;
  name: string;
  discount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

function statusLabel(row: SellerCouponRow, now: Date): string {
  const start = new Date(row.startDate);
  const end = new Date(row.endDate);
  if (!row.isActive) return "Disabled";
  if (now < start) return "Scheduled";
  if (now > end) return "Expired";
  return "Active";
}

function CouponActiveSwitch({ row }: { row: SellerCouponRow }) {
  const params = useParams<{ storeUrl: string }>();
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
        const res = await setSellerCouponActive(params.storeUrl, row.id, next);
        if (!res.success) {
          setChecked(!next);
          toast({
            title: "Update failed",
            description: res.message,
            variant: "destructive",
          });
        } else {
          router.refresh();
        }
        setLoading(false);
      }}
      aria-label="Coupon active"
    />
  );
}

const CellActions = ({ row }: { row: SellerCouponRow }) => {
  const params = useParams<{ storeUrl: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onSelect={(e) => e.preventDefault()}>
              <Trash size={15} /> Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
          <AlertDialogDescription>
            Customers will no longer be able to use <strong>{row.code}</strong>. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              setLoading(true);
              const res = await deleteSellerCoupon(params.storeUrl, row.id);
              if (res.success) {
                toast({ title: "Coupon deleted" });
                router.refresh();
              } else {
                toast({
                  title: "Error",
                  description: res.message,
                  variant: "destructive",
                });
              }
              setLoading(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const couponColumns: ColumnDef<SellerCouponRow>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono font-semibold tracking-wide">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Label",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.name || "—"}</span>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => <span>{row.original.discount}%</span>,
  },
  {
    id: "window",
    header: "Valid",
    cell: ({ row }) => {
      const s = new Date(row.original.startDate);
      const e = new Date(row.original.endDate);
      return (
        <span className="text-sm text-muted-foreground">
          {format(s, "MMM d, yyyy HH:mm")} → {format(e, "MMM d, yyyy HH:mm")}
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const now = new Date();
      const label = statusLabel(row.original, now);
      return (
        <span
          className={
            label === "Active"
              ? "text-green-600 dark:text-green-400"
              : label === "Expired"
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
      <CouponActiveSwitch
        key={`${row.original.id}-${row.original.isActive}`}
        row={row.original}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions row={row.original} />,
  },
];
