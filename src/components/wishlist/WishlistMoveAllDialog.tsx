"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { moveAllToCart } from "@/src/app/actions/wishlist.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { toast } from "sonner";

type WishlistMoveAllDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCount: number;
  onDone: () => void;
};

export default function WishlistMoveAllDialog({
  open,
  onOpenChange,
  itemCount,
  onDone,
}: WishlistMoveAllDialogProps) {
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      const res = await moveAllToCart();
      toast.message(res.message);
      onDone();
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move all to cart?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              This will move all {itemCount} item{itemCount === 1 ? "" : "s"} to your cart and
              remove them from your wishlist.
            </span>
            <span className="block text-foreground">
              Items will be added using each variant&apos;s lowest-priced size that is in stock.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); confirm(); }} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving…
              </>
            ) : (
              "Move all"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
