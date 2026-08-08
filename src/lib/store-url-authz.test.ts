import { describe, expect, it } from "vitest";

import { AuthorizationError } from "@/src/lib/authz-guards";
import { assertProductBelongsToStore } from "@/src/lib/authz-guards";
import { assertSellerOwnsStoreByUrl } from "@/src/lib/store-url-guard";

describe("seller storeUrl authorization", () => {
  it("denies access when storeUrl resolves to another seller's store", () => {
    expect(() =>
      assertSellerOwnsStoreByUrl({
        storeUrl: "other-shop",
        store: { id: "store-b", userId: "seller-b" },
        callerUserId: "seller-a",
      })
    ).toThrow(AuthorizationError);
  });

  it("denies product writes when storeUrl is manipulated to another store", () => {
    // Dashboard route is seller-a's URL, but payload product belongs to store-b.
    expect(() =>
      assertProductBelongsToStore({
        productId: "prod-b",
        productStoreId: "store-b",
        routeStoreId: "store-a",
        callerUserId: "seller-a",
        storeUrl: "seller-a-shop",
      })
    ).toThrow(/does not belong to this store/);
  });
});
