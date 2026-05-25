"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import type { CartStore, CartItemFull } from "@/types/cart.types";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import CartItemRow from "@/src/components/cart/CartItemRow";

type CartContentProps = {
  stores: CartStore[];
};

export default function CartContent({ stores }: CartContentProps) {
  return (
    <div className="space-y-6">
      {stores.map((store) => (
        <Card key={store.storeId}>
          <CardHeader className="bg-base px-6 py-4 dark:bg-base/50">
            <div className="flex items-center gap-3">
              <Image
                src={store.storeLogo}
                alt={store.storeName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
              />
              <Link href={`/store/${store.storeUrl}`} className="group inline-flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sold by:</span>
                <span className="font-semibold text-primary group-hover:underline">
                  {store.storeName}
                </span>
                <BadgeCheck className="h-4 w-4 text-[#95CFB2]" />
              </Link>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-0">
            {(store.items as CartItemFull[]).map((item, idx, arr) => (
              <div key={item.id}>
                <CartItemRow item={item} />
                {idx !== arr.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
