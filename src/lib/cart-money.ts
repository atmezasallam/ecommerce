/** Unit price after a percent-off size discount. */
export function calcFinalPrice(price: number, discountPercent: number): number {
  return price - (price * discountPercent) / 100;
}

export type CartCouponLike = {
  discount: number;
  isGlobal: boolean;
  storeId: string | null;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
};

export function isCouponActive(
  coupon: Pick<CartCouponLike, "isActive" | "startDate" | "endDate">,
  now: Date = new Date()
): boolean {
  return coupon.isActive && coupon.startDate <= now && coupon.endDate >= now;
}

export type CartMoneyLine = {
  storeId: string;
  quantity: number;
  size: { price: number; discount: number };
};

export type CartTotals = {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
};

/**
 * Server checkout math (mirrors order.actions). Size % off is baked into line
 * prices; a cart coupon applies on top (cart holds one coupon). Totals never go
 * below zero even if coupon percent exceeds 100.
 */
export function calculateCartTotals(
  items: CartMoneyLine[],
  coupon: CartCouponLike | null | undefined = null,
  shippingTotal = 0,
  now: Date = new Date()
): CartTotals {
  const subtotal = items.reduce((acc, item) => {
    return acc + calcFinalPrice(item.size.price, item.size.discount) * item.quantity;
  }, 0);

  let discountTotal = 0;
  if (coupon && isCouponActive(coupon, now)) {
    const eligibleSubtotal = coupon.isGlobal
      ? subtotal
      : items
          .filter((item) => item.storeId === coupon.storeId)
          .reduce(
            (acc, item) =>
              acc + calcFinalPrice(item.size.price, item.size.discount) * item.quantity,
            0
          );
    discountTotal = (eligibleSubtotal * coupon.discount) / 100;
  }

  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const taxTotal = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shippingTotal + taxTotal;

  return { subtotal, discountTotal, shippingTotal, taxTotal, total };
}
