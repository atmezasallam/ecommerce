"use client";

import Image from "next/image";
import Link from "next/link";

import type { CartItemFull } from "@/types/cart.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

type Totals = {
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
};

type CheckoutOrderSummaryProps = {
  cart: { items: CartItemFull[] };
  totals: Totals;
  currentStep: number;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const getFinalPrice = (price: number, discount: number) => price - (price * discount) / 100;

export default function CheckoutOrderSummary({
  cart,
  totals,
  currentStep,
}: CheckoutOrderSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Order Summary</CardTitle>
          <Link href="/cart" className="text-xs text-muted-foreground hover:text-foreground">
            ← Edit cart
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {cart.items.map((item) => {
            const unit = getFinalPrice(item.size.price, item.size.discount);
            return (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={item.variant.variantImage}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant.variantName} • {item.size.size}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity} × {currencyFormatter.format(unit)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{currencyFormatter.format(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{totals.shippingTotal === 0 ? "FREE" : currencyFormatter.format(totals.shippingTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{currencyFormatter.format(totals.taxTotal)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{currencyFormatter.format(totals.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>🔒 Secure Checkout</span>
          <span>↩️ Easy Returns</span>
          <span>✓ Buyer Protection</span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Step {currentStep} of 3
        </p>
      </CardContent>
    </Card>
  );
}
