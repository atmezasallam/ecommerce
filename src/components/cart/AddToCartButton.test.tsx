import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/src/app/actions/cart.actions", () => ({
  addToCart: vi.fn(),
  removeFromCartLine: vi.fn(),
}));

import AddToCartButton from "@/src/components/cart/AddToCartButton";

describe("AddToCartButton", () => {
  it("shows Out of Stock when stock is zero", () => {
    render(
      <AddToCartButton
        productId="p1"
        variantId="v1"
        sizeId="s1"
        storeId="st1"
        stock={0}
      />
    );
    expect(screen.getByRole("button", { name: /out of stock/i })).toBeDisabled();
  });
});
