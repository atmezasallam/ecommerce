"use client";

import { useMemo, useOptimistic, useTransition } from "react";
import Image from "next/image";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { updateCartItemQuantity, removeFromCart } from "@/src/app/actions/cart.actions";
import type { CartItemFull } from "@/types/cart.types";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

type CartItemRowProps = {
  item: CartItemFull;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const getFinalPrice = (price: number, discount: number) => price - (price * discount) / 100;

const getSaleCountdown = (saleEndDate: string | null): string | null => {
  if (!saleEndDate) return null;
  const endDate = new Date(saleEndDate);
  if (Number.isNaN(endDate.getTime())) return null;
  const ms = endDate.getTime() - Date.now();
  if (ms <= 0) return "Sale ended";

  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

export default function CartItemRow({ item }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticQty, setOptimisticQty] = useOptimistic(item.quantity);

  const finalPrice = useMemo(
    () => getFinalPrice(item.size.price, item.size.discount),
    [item.size.discount, item.size.price]
  );
  const subtotal = finalPrice * optimisticQty;
  const countdown = item.variant.isSale ? getSaleCountdown(item.variant.saleEndDate) : null;
  const selectedColor = item.variant.colors[0]?.name ?? "N/A";
  const maxStockReached = optimisticQty >= item.size.quantity;

  const onQuantityChange = (nextQty: number) => {
    setOptimisticQty(nextQty);
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, nextQty);
      if (!result.success) toast.error(result.message);
    });
  };

  const onRemove = () => {
    startTransition(async () => {
      const result = await removeFromCart(item.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Item removed from cart.");
    });
  };

  return (
    <div className="flex gap-4 rounded-lg p-4 transition-colors hover:bg-accent/30">
      <Image
        src={item.variant.variantImage}
        alt={item.variant.variantName}
        width={120}
        height={120}
        className="h-[120px] w-[120px] rounded-xl bg-surface object-contain shadow-sm"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="line-clamp-2 text-base font-semibold">{item.product.name}</p>
          <p className="text-sm italic text-muted-foreground">{item.variant.variantName}</p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 text-xs">
              Color: {selectedColor}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 text-xs">
              Size: {item.size.size}
            </Badge>
            {countdown && countdown === "Sale ended" ? (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                {countdown}
              </span>
            ) : (
              countdown && <Badge variant="destructive">{countdown}</Badge>
            )}
          </div>

          <div className="text-sm">
            {item.size.discount > 0 ? (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground line-through">
                  {currencyFormatter.format(item.size.price)}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {currencyFormatter.format(finalPrice)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold">{currencyFormatter.format(finalPrice)}</span>
            )}
          </div>

          {maxStockReached && (
            <p className="text-sm font-medium text-amber-600">Max stock reached</p>
          )}
        </div>

        <div className="flex min-w-[150px] flex-col items-end gap-3">
          <div className="flex h-9 items-center rounded-lg border border-input bg-background px-1">
          {optimisticQty <= 1 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending} className="size-8 hover:bg-accent">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This item will be removed from your cart.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemove}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-accent"
              disabled={isPending}
              onClick={() => onQuantityChange(optimisticQty - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}

          <div className="w-10 text-center text-sm font-medium">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : optimisticQty}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-accent"
            disabled={isPending || optimisticQty >= item.size.quantity}
            onClick={() => onQuantityChange(optimisticQty + 1)}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onRemove}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove item</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Subtotal:</p>
            <p className="text-xl font-bold">{currencyFormatter.format(subtotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
