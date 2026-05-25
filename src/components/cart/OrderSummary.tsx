"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowRight, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";

import { applyCartCoupon, removeCartCoupon } from "@/src/app/actions/cart.actions";
import type { AppliedCartCoupon, CartItemFull } from "@/types/cart.types";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

type OrderSummaryProps = {
  items: CartItemFull[];
  appliedCoupon: AppliedCartCoupon | null;
  isGuest: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const getFinalPrice = (price: number, discount: number) => price - (price * discount) / 100;

const lineTotal = (item: CartItemFull) =>
  getFinalPrice(item.size.price, item.size.discount) * item.quantity;

export default function OrderSummary({ items, appliedCoupon, isGuest }: OrderSummaryProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState("");

  const byStore = useMemo(() => {
    const map = new Map<string, { name: string; sub: number }>();
    for (const item of items) {
      const sid = item.storeId;
      const name = item.product.store.name;
      const cur = map.get(sid) ?? { name, sub: 0 };
      cur.sub += lineTotal(item);
      map.set(sid, cur);
    }
    return Array.from(map.entries()).map(([storeId, v]) => ({ storeId, ...v }));
  }, [items]);

  const multiStore = byStore.length > 1;

  const subtotal = items.reduce((acc, item) => acc + lineTotal(item), 0);

  const storeSubtotalForCoupon = appliedCoupon
    ? appliedCoupon.isGlobal
      ? subtotal
      : items
          .filter((i) => i.storeId === appliedCoupon.storeId)
          .reduce((acc, i) => acc + lineTotal(i), 0)
    : 0;

  const couponDiscountAmount = appliedCoupon
    ? (storeSubtotalForCoupon * appliedCoupon.discount) / 100
    : 0;

  const orderTotal = Math.max(0, subtotal - couponDiscountAmount);

  const hasOutOfStock = items.some((item) => item.quantity > item.size.quantity);

  const onApply = () => {
    if (isGuest) {
      toast.info("Sign in to apply a coupon.");
      return;
    }
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Enter a coupon code.");
      return;
    }
    startTransition(async () => {
      const res = await applyCartCoupon(trimmed);
      if (res.success) {
        toast.success(res.message);
        setCode("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const onRemoveCoupon = () => {
    startTransition(async () => {
      const res = await removeCartCoupon();
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Card className="rounded-2xl shadow-md lg:sticky lg:top-4">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="mb-6 text-xl font-bold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        {multiStore && (
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Items by seller
            </p>
            <ul className="space-y-2">
              {byStore.map(({ storeId, name, sub }) => {
                const couponHere = Boolean(
                  appliedCoupon &&
                    (appliedCoupon.isGlobal || appliedCoupon.storeId === storeId)
                );
                return (
                  <li key={storeId} className="flex items-start justify-between gap-2 text-sm">
                    <span className="min-w-0 flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-foreground">{name}</span>
                      {couponHere && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          Coupon applies here
                        </Badge>
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {currencyFormatter.format(sub)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Each seller ships separately. Store coupons only lower that seller&apos;s lines; platform
              coupons lower every line.
            </p>
          </div>
        )}

        <div className="flex justify-between border-b border-dashed border-muted py-2">
          <span className="text-sm text-muted-foreground">
            {multiStore ? "Cart subtotal (all sellers)" : "Subtotal"}
          </span>
          <span className="text-sm font-medium tabular-nums">{currencyFormatter.format(subtotal)}</span>
        </div>

        {appliedCoupon && storeSubtotalForCoupon > 0 && (
          <div className="space-y-2 border-b border-dashed border-muted py-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {appliedCoupon.isGlobal
                  ? "Eligible — entire cart (all sellers)"
                  : `Eligible items — ${appliedCoupon.storeName} only`}
              </span>
              <span className="tabular-nums">{currencyFormatter.format(storeSubtotalForCoupon)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                Coupon{" "}
                <span className="font-mono font-medium text-foreground">{appliedCoupon.code}</span>
                <span className="mt-0.5 block text-xs">
                  −{appliedCoupon.discount}%
                  {appliedCoupon.isGlobal
                    ? " on all products in your cart"
                    : ` on that seller's items only`}
                </span>
              </span>
              <span className="shrink-0 text-sm font-medium text-green-600 dark:text-green-400 tabular-nums">
                −{currencyFormatter.format(couponDiscountAmount)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between border-b border-dashed border-muted py-2">
          <span className="text-sm text-muted-foreground">Shipping</span>
          <span className="text-sm font-medium">Calculated at checkout</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sm text-muted-foreground">Tax</span>
          <span className="text-sm font-medium">Calculated at checkout</span>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-4">
          <span className="text-base font-bold">Total</span>
          <span className="text-2xl font-extrabold text-primary tabular-nums">
            {currencyFormatter.format(orderTotal)}
          </span>
        </div>

        <div className="rounded-xl border border-dashed bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Have a coupon?</p>
            {appliedCoupon && !isGuest && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-muted-foreground"
                disabled={pending}
                onClick={onRemoveCoupon}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={isGuest ? "Sign in to use coupons" : "Enter coupon code"}
              className="flex-1"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isGuest || pending || Boolean(appliedCoupon)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onApply();
                }
              }}
            />
            <Button
              variant="outline"
              className="shrink-0"
              disabled={pending || isGuest || Boolean(appliedCoupon)}
              onClick={onApply}
            >
              {pending ? "…" : "Apply"}
            </Button>
          </div>
          {!isGuest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Store codes discount only that seller&apos;s items. Platform-wide codes (from Salamo admin)
              discount your whole cart.
            </p>
          )}
          {isGuest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Sign in to apply store coupons. Codes are tied to one seller per order.
            </p>
          )}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-xl text-base font-semibold"
                  disabled={hasOutOfStock}
                >
                  <Link href="/checkout" className="inline-flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TooltipTrigger>
            {hasOutOfStock && (
              <TooltipContent>Remove out-of-stock items to continue</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
