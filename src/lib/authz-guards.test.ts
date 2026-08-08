import { describe, expect, it } from "vitest";

import {
  assertCanUpdateStore,
  assertNoClientMonetaryFields,
  assertOrderItemOwnedBySeller,
  assertProductBelongsToStore,
  AuthorizationError,
  lineShippingFee,
  sumShippingFees,
} from "@/src/lib/authz-guards";
import {
  assertTrackingNumberAllowed,
  assertValidFulfillmentTransition,
  deriveOrderStatusFromItems,
} from "@/src/lib/order-fulfillment";

describe("upsertStore ownership", () => {
  it("rejects seller A updating seller B store", () => {
    expect(() =>
      assertCanUpdateStore({
        storeId: "store-b",
        storeOwnerUserId: "seller-b",
        callerUserId: "seller-a",
        dbRole: "SELLER",
        clerkPrivateRole: "SELLER",
      })
    ).toThrow(AuthorizationError);
  });

  it("allows owner to update their store", () => {
    expect(() =>
      assertCanUpdateStore({
        storeId: "store-a",
        storeOwnerUserId: "seller-a",
        callerUserId: "seller-a",
        dbRole: "SELLER",
        clerkPrivateRole: "SELLER",
      })
    ).not.toThrow();
  });

  it("allows platform admin to bypass ownership", () => {
    expect(() =>
      assertCanUpdateStore({
        storeId: "store-b",
        storeOwnerUserId: "seller-b",
        callerUserId: "admin-1",
        dbRole: "ADMIN",
        clerkPrivateRole: undefined,
      })
    ).not.toThrow();
  });
});

describe("upsertProduct ownership", () => {
  it("rejects seller A updating seller B product via their storeUrl", () => {
    expect(() =>
      assertProductBelongsToStore({
        productId: "product-b",
        productStoreId: "store-b",
        routeStoreId: "store-a",
        callerUserId: "seller-a",
        storeUrl: "seller-a-shop",
      })
    ).toThrow(AuthorizationError);
  });

  it("allows update when product belongs to route store", () => {
    expect(() =>
      assertProductBelongsToStore({
        productId: "product-a",
        productStoreId: "store-a",
        routeStoreId: "store-a",
        callerUserId: "seller-a",
        storeUrl: "seller-a-shop",
      })
    ).not.toThrow();
  });
});

describe("client deliveryPrice / monetary fields", () => {
  it("rejects tampered deliveryPrice", () => {
    expect(() =>
      assertNoClientMonetaryFields(
        { fullName: "Ada", deliveryPrice: 0 },
        { userId: "buyer-1" }
      )
    ).toThrow(/deliveryPrice/);
  });

  it("allows address-only shipping payload", () => {
    expect(() =>
      assertNoClientMonetaryFields(
        {
          fullName: "Ada",
          country: "United States",
          deliveryMethod: "standard",
        },
        { userId: "buyer-1" }
      )
    ).not.toThrow();
  });

  it("computes ITEM shipping server-side", () => {
    expect(
      lineShippingFee({
        quantity: 3,
        weight: 1,
        shippingFeeMethod: "ITEM",
        fees: {
          shippingFeePerItem: 5,
          shippingFeeForAdditionalItem: 2,
          shippingFeePerKg: 1,
          shippingFeeFixed: 10,
        },
      })
    ).toBe(9);
  });

  it("sums multi-store lines", () => {
    expect(
      sumShippingFees([
        {
          quantity: 1,
          weight: 0,
          shippingFeeMethod: "FIXED",
          fees: {
            shippingFeePerItem: 0,
            shippingFeeForAdditionalItem: 0,
            shippingFeePerKg: 0,
            shippingFeeFixed: 4,
          },
        },
        {
          quantity: 2,
          weight: 1,
          shippingFeeMethod: "ITEM",
          fees: {
            shippingFeePerItem: 3,
            shippingFeeForAdditionalItem: 1,
            shippingFeePerKg: 0,
            shippingFeeFixed: 0,
          },
        },
      ])
    ).toBe(8);
  });
});

describe("order item fulfillment ownership", () => {
  it("rejects seller updating another store's item", () => {
    expect(() =>
      assertOrderItemOwnedBySeller({
        orderItemId: "item-b",
        itemStoreId: "store-b",
        ownedStoreId: "store-a",
        callerUserId: "seller-a",
      })
    ).toThrow(AuthorizationError);
  });

  it("allows seller updating their own store's item", () => {
    expect(() =>
      assertOrderItemOwnedBySeller({
        orderItemId: "item-a",
        itemStoreId: "store-a",
        ownedStoreId: "store-a",
        callerUserId: "seller-a",
      })
    ).not.toThrow();
  });
});

describe("fulfillment transitions", () => {
  it("allows PROCESSING → SHIPPED and PROCESSING → CANCELLED", () => {
    expect(() =>
      assertValidFulfillmentTransition("PROCESSING", "SHIPPED", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).not.toThrow();
    expect(() =>
      assertValidFulfillmentTransition("PROCESSING", "CANCELLED", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).not.toThrow();
  });

  it("allows SHIPPED → DELIVERED", () => {
    expect(() =>
      assertValidFulfillmentTransition("SHIPPED", "DELIVERED", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).not.toThrow();
  });

  it("rejects invalid transitions (un-ship, revive cancelled, skip ahead)", () => {
    expect(() =>
      assertValidFulfillmentTransition("SHIPPED", "PROCESSING", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).toThrow(AuthorizationError);
    expect(() =>
      assertValidFulfillmentTransition("CANCELLED", "PROCESSING", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).toThrow(AuthorizationError);
    expect(() =>
      assertValidFulfillmentTransition("PROCESSING", "DELIVERED", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).toThrow(AuthorizationError);
    expect(() =>
      assertValidFulfillmentTransition("DELIVERED", "SHIPPED", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).toThrow(AuthorizationError);
  });
});

describe("deriveOrderStatusFromItems", () => {
  it("returns PARTIALLY_SHIPPED for mixed-store order (one shipped, one pending)", () => {
    expect(deriveOrderStatusFromItems(["SHIPPED", "PROCESSING"])).toBe(
      "PARTIALLY_SHIPPED"
    );
  });

  it("returns DELIVERED when all items delivered", () => {
    expect(deriveOrderStatusFromItems(["DELIVERED", "DELIVERED"])).toBe("DELIVERED");
  });

  it("returns CANCELLED when all items cancelled", () => {
    expect(deriveOrderStatusFromItems(["CANCELLED", "CANCELLED"])).toBe("CANCELLED");
  });

  it("returns PROCESSING when no items are shipped yet", () => {
    expect(deriveOrderStatusFromItems(["PROCESSING", "PROCESSING"])).toBe("PROCESSING");
    expect(deriveOrderStatusFromItems(["PROCESSING", "CANCELLED"])).toBe("PROCESSING");
  });
});

describe("trackingNumber rules", () => {
  it("rejects trackingNumber on non-SHIPPED transitions", () => {
    expect(() =>
      assertTrackingNumberAllowed("DELIVERED", "TRACK-1", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).toThrow(/trackingNumber/);
    expect(() =>
      assertTrackingNumberAllowed("CANCELLED", "TRACK-1", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).toThrow(/trackingNumber/);
    expect(() =>
      assertTrackingNumberAllowed("PROCESSING", "TRACK-1", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).toThrow(/trackingNumber/);
  });

  it("allows trackingNumber when moving to SHIPPED", () => {
    expect(() =>
      assertTrackingNumberAllowed("SHIPPED", "TRACK-1", {
        userId: "s1",
        orderItemId: "i1",
      })
    ).not.toThrow();
  });
});
