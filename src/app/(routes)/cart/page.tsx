import Link from "next/link";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

import CartContent from "@/src/components/cart/CartContent";
import CartEmptyState from "@/src/components/cart/CartEmptyState";
import OrderSummary from "@/src/components/cart/OrderSummary";
import { getCart } from "@/src/app/actions/cart.actions";
import type { CartStore, CartItemFull } from "@/types/cart.types";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";

const groupByStore = (items: CartItemFull[]): CartStore[] => {
  const groups = new Map<string, CartStore>();

  for (const item of items) {
    const existing = groups.get(item.storeId);
    if (!existing) {
      groups.set(item.storeId, {
        storeId: item.storeId,
        storeName: item.product.store.name,
        storeLogo: item.product.store.logo,
        storeUrl: item.product.store.url,
        items: [item],
      });
      continue;
    }

    (existing.items as CartItemFull[]).push(item);
  }

  return Array.from(groups.values());
};

export default async function CartPage() {
  const { items, isGuest, appliedCoupon } = await getCart();

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  const groupedByStore = groupByStore(items);
  const totalItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-base dark:bg-base">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4">
          <Link href="/" className="text-2xl font-extrabold font-mono tracking-tight">
            Salamo
          </Link>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">{totalItemCount} items</Badge>
        </div>

        {isGuest && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-sm text-blue-800">
              <Info className="h-4 w-4" />
              <span>Sign in to save your cart and sync across devices</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartContent stores={groupedByStore} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary items={items} appliedCoupon={appliedCoupon} isGuest={isGuest} />
          </div>
        </div>
      </div>
    </div>
  );
}
