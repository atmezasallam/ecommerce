/**
 * Models the optimistic stock check used in confirmOrder:
 * `updateMany({ where: { quantity: { gte: qty } }, data: { decrement: qty } })`.
 * Concurrent claims are applied in order; a claim fails when remaining < requested.
 */
export function applyConcurrentStockClaims(
  initialStock: number,
  claims: readonly number[]
): { remaining: number; results: boolean[] } {
  let remaining = initialStock;
  const results = claims.map((qty) => {
    if (qty <= 0 || remaining < qty) return false;
    remaining -= qty;
    return true;
  });
  return { remaining, results };
}

export function isOutOfStock(available: number): boolean {
  return available <= 0;
}
