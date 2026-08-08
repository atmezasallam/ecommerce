import { describe, expect, it } from "vitest";

import { calculateCartTotals, type CartCouponLike } from "@/src/lib/cart-money";
import { formatUsd, roundToCents, toStripeCents } from "@/src/lib/money";
import { applyConcurrentStockClaims, isOutOfStock } from "@/src/lib/stock";
import {
  effectiveSizePrice,
  selectSizeById,
  variantPriceRangeLabel,
} from "@/src/lib/variant-price";
import { CheckoutShippingSchema } from "@/src/lib/checkout-schema";
import { ProductFormSchema } from "@/src/lib/schema";

const now = new Date("2026-06-15T12:00:00.000Z");

function coupon(partial: Partial<CartCouponLike> & { discount: number }): CartCouponLike {
  return {
    isGlobal: true,
    storeId: null,
    isActive: true,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    ...partial,
  };
}

const line = (
  storeId: string,
  price: number,
  quantity: number,
  discount = 0
) => ({
  storeId,
  quantity,
  size: { price, discount },
});

describe("cart totals", () => {
  it("computes subtotal, shipping, tax, and grand total", () => {
    const totals = calculateCartTotals(
      [line("s1", 100, 2), line("s1", 50, 1)],
      null,
      10,
      now
    );
    expect(totals.subtotal).toBe(250);
    expect(totals.shippingTotal).toBe(10);
    expect(totals.discountTotal).toBe(0);
    expect(totals.taxTotal).toBe(20); // 8% of 250
    expect(totals.total).toBe(280);
  });

  it("ignores expired coupons", () => {
    const totals = calculateCartTotals(
      [line("s1", 100, 1)],
      coupon({
        discount: 50,
        endDate: new Date("2026-01-01"),
        startDate: new Date("2025-01-01"),
      }),
      0,
      now
    );
    expect(totals.discountTotal).toBe(0);
    expect(totals.total).toBe(108);
  });

  it("applies size discount + coupon together without negative total", () => {
    // 20% size off → $80 line; then 50% coupon on that subtotal
    const totals = calculateCartTotals(
      [line("s1", 100, 1, 20)],
      coupon({ discount: 50 }),
      5,
      now
    );
    expect(totals.subtotal).toBe(80);
    expect(totals.discountTotal).toBe(40);
    expect(totals.taxTotal).toBe(3.2);
    expect(totals.total).toBe(48.2);
    expect(totals.total).toBeGreaterThanOrEqual(0);
  });

  it("clamps 100%+ coupon so grand total cannot go negative", () => {
    const full = calculateCartTotals(
      [line("s1", 40, 1)],
      coupon({ discount: 100 }),
      0,
      now
    );
    expect(full.discountTotal).toBe(40);
    expect(full.total).toBe(0);

    const over = calculateCartTotals(
      [line("s1", 40, 1)],
      coupon({ discount: 150 }),
      0,
      now
    );
    expect(over.total).toBe(0);
    expect(over.total).toBeGreaterThanOrEqual(0);
  });

  it("scopes non-global coupons to one store (not full-cart stack)", () => {
    const totals = calculateCartTotals(
      [line("store-a", 100, 1), line("store-b", 100, 1)],
      coupon({ discount: 50, isGlobal: false, storeId: "store-a" }),
      0,
      now
    );
    expect(totals.subtotal).toBe(200);
    expect(totals.discountTotal).toBe(50);
    expect(totals.taxTotal).toBe(12); // 8% of 150
    expect(totals.total).toBe(162);
  });
});

describe("currency formatting / rounding", () => {
  it("rounds to cents and avoids Stripe cent drift on classic floats", () => {
    expect(roundToCents(19.99)).toBe(19.99);
    expect(toStripeCents(19.99)).toBe(1999);
    expect(toStripeCents(0.1 + 0.2)).toBe(30);
    expect(formatUsd(19.99)).toBe("$19.99");
  });
});

describe("stock concurrency", () => {
  it("lets only claims that fit remaining stock succeed", () => {
    const { remaining, results } = applyConcurrentStockClaims(5, [3, 3, 2]);
    expect(results).toEqual([true, false, true]);
    expect(remaining).toBe(0);
  });

  it("treats zero stock as out of stock", () => {
    expect(isOutOfStock(0)).toBe(true);
    expect(isOutOfStock(2)).toBe(false);
  });
});

describe("variant price selection", () => {
  const sizes = [
    { id: "sm", size: "S", price: 30, discount: 0, quantity: 3 },
    { id: "lg", size: "L", price: 50, discount: 0, quantity: 1 },
  ];

  it("selects the chosen size price when a product has multiple sizes/variants", () => {
    const selected = selectSizeById(sizes, "lg");
    expect(selected).toBeDefined();
    expect(effectiveSizePrice(selected!)).toBe(50);
    expect(variantPriceRangeLabel(sizes)).toBe("$30.00 - $50.00");
  });
});

describe("Zod schemas", () => {
  it("rejects invalid checkout shipping payloads", () => {
    const bad = CheckoutShippingSchema.safeParse({
      fullName: "A",
      email: "not-an-email",
      phone: "123",
      address: "x",
      city: "Y",
      zipCode: "1",
      country: "US",
      saveAddress: false,
    });
    expect(bad.success).toBe(false);

    const good = CheckoutShippingSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "12345678",
      address: "123 Main Street",
      city: "London",
      zipCode: "SW1A",
      country: "United Kingdom",
      saveAddress: true,
    });
    expect(good.success).toBe(true);
  });

  it("rejects product creation without required sizes/images", () => {
    const result = ProductFormSchema.safeParse({
      name: "Tee",
      description: "<p>Short</p>",
      variantName: "Default",
      images: [{ url: "https://x/1.jpg" }],
      variantImages: [{ url: "https://x/v.jpg" }],
      categoryId: "cat",
      subCategoryId: "sub",
      brand: "Acme",
      sku: "SKU001",
      weight: 0,
      keywords: [],
      colors: [{ color: "red" }],
      isSale: false,
      sizes: [],
      product_specs: [{ name: "Material", value: "Cotton" }],
      variant_specs: [{ name: "Fit", value: "Regular" }],
    });
    expect(result.success).toBe(false);
  });
});
