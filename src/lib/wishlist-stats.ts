import type { WishlistItemFull } from "@/types/wishlist.types";

import { pickLowestEffectivePriceSize } from "@/src/lib/wishlist-pricing";

export function computeWishlistStats(items: WishlistItemFull[]) {
  let totalValue = 0;
  let totalSavings = 0;
  for (const item of items) {
    const picked = pickLowestEffectivePriceSize(item.variant.sizes);
    if (!picked) continue;
    const { size, effective } = picked;
    totalValue += effective;
    totalSavings += Math.max(0, size.price - effective);
  }
  return {
    totalItems: items.length,
    totalValue,
    totalSavings,
  };
}
