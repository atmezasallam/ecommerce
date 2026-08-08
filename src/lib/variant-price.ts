import { calcFinalPrice } from "@/src/lib/cart-money";

export type PricedSize = {
  id: string;
  size: string;
  price: number;
  discount: number;
  quantity: number;
};

/** Effective (post size-discount) unit price for a size. */
export function effectiveSizePrice(size: Pick<PricedSize, "price" | "discount">): number {
  return calcFinalPrice(size.price, size.discount);
}

/** Pick the size matching variant selection (sizeId). */
export function selectSizeById(
  sizes: PricedSize[],
  sizeId: string
): PricedSize | undefined {
  return sizes.find((s) => s.id === sizeId);
}

/** Min/max display string when no size is selected across a variant's sizes. */
export function variantPriceRangeLabel(sizes: PricedSize[]): string | null {
  if (!sizes.length) return null;
  const prices = sizes.map(effectiveSizePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const minLabel = min.toFixed(2);
  const maxLabel = max.toFixed(2);
  return minLabel === maxLabel ? `$${minLabel}` : `$${minLabel} - $${maxLabel}`;
}
