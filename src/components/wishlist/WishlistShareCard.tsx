"use client";

import Image from "next/image";
import Link from "next/link";

import type { WishlistItemFull } from "@/types/wishlist.types";
import AddToWishlistButton from "@/src/components/wishlist/AddToWishlistButton";
import { Button } from "@/src/components/ui/button";
import { formatWishlistUsd, pickLowestEffectivePriceSize } from "@/src/lib/wishlist-pricing";
import { cn } from "@/src/lib/utils";

type WishlistShareCardProps = {
  item: WishlistItemFull;
  initialInWishlist?: boolean;
};

export default function WishlistShareCard({
  item,
  initialInWishlist = false,
}: WishlistShareCardProps) {
  const picked = pickLowestEffectivePriceSize(item.variant.sizes);
  const effective = picked?.effective ?? 0;
  const img = item.variant.images[0]?.url ?? item.variant.variantImage;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
      )}
    >
      <Link
        href={`/product/${item.product.slug}/${item.variant.slug}`}
        className="relative block aspect-square bg-muted/40 p-4"
      >
        <Image
          src={img}
          alt={item.product.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium text-primary">{item.product.store.name}</p>
        <p className="line-clamp-2 text-sm font-semibold">{item.product.name}</p>
        <p className="text-lg font-bold">{formatWishlistUsd(effective)}</p>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/product/${item.product.slug}/${item.variant.slug}`}>View Product</Link>
        </Button>
        <AddToWishlistButton
          productId={item.productId}
          variantId={item.variantId}
          showLabel
          initialState={initialInWishlist}
          className="w-full justify-center"
        />
      </div>
    </div>
  );
}
