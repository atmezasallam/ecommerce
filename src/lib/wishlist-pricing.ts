import type { Size } from "@prisma/client";

export function formatWishlistUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function effectiveUnitPrice(size: Pick<Size, "price" | "discount">): number {
  return size.price * (1 - size.discount / 100);
}

export function pickLowestEffectivePriceSize(
  sizes: Size[]
): { size: Size; effective: number } | null {
  if (sizes.length === 0) return null;
  let best: Size | null = null;
  let bestEff = Infinity;
  for (const s of sizes) {
    const eff = effectiveUnitPrice(s);
    if (eff < bestEff) {
      bestEff = eff;
      best = s;
    }
  }
  if (!best) return null;
  return { size: best, effective: bestEff };
}

export function pickLowestInStockSize(sizes: Size[]): Size | null {
  const inStock = sizes.filter((s) => s.quantity > 0);
  const pool = inStock.length > 0 ? inStock : sizes;
  if (pool.length === 0) return null;
  return pool.reduce((a, b) =>
    effectiveUnitPrice(a) <= effectiveUnitPrice(b) ? a : b
  );
}

export function isSaleActive(isSale: boolean, saleEndDate: string | null): boolean {
  if (!isSale) return false;
  if (!saleEndDate) return true;
  const t = new Date(saleEndDate).getTime();
  if (!Number.isFinite(t)) return true;
  return t > Date.now();
}

export function maxDiscountPercent(sizes: Pick<Size, "discount">[]): number {
  if (sizes.length === 0) return 0;
  return Math.max(...sizes.map((s) => s.discount));
}
