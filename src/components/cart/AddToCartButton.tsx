"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { addToCart, removeFromCartLine } from "@/src/app/actions/cart.actions";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  variantId: string;
  sizeId: string;
  storeId: string;
  stock: number;
  className?: string;
  initialInCart?: boolean;
};

type AddToCartState = "idle" | "loading" | "in_cart" | "out_of_stock";

function resolveInitialState(
  stock: number,
  initialInCart: boolean
): AddToCartState {
  if (stock === 0) return "out_of_stock";
  if (initialInCart) return "in_cart";
  return "idle";
}

export default function AddToCartButton({
  productId,
  variantId,
  sizeId,
  storeId,
  stock,
  className,
  initialInCart = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pendingRemove = useRef(false);
  const [state, setState] = useState<AddToCartState>(() =>
    resolveInitialState(stock, initialInCart)
  );

  useEffect(() => {
    setState(resolveInitialState(stock, initialInCart));
  }, [initialInCart, variantId, sizeId, stock]);

  const onClick = async () => {
    if (state === "loading" || state === "out_of_stock") return;

    const removing = state === "in_cart";
    pendingRemove.current = removing;
    setState("loading");

    const result = removing
      ? await removeFromCartLine(variantId, sizeId)
      : await addToCart({
          productId,
          variantId,
          sizeId,
          storeId,
          quantity: 1,
        });

    if (result.success) {
      setState(removing ? "idle" : "in_cart");
      toast.success(
        removing ? "Removed from cart." : "Item added to cart!"
      );
      router.refresh();
      return;
    }

    setState(resolveInitialState(stock, initialInCart));
    toast.error(result.message);
  };

  if (state === "out_of_stock") {
    return (
      <Button disabled className={cn("w-full min-w-[200px]", className)}>
        Out of Stock
      </Button>
    );
  }

  if (state === "loading") {
    return (
      <Button disabled className={cn("w-full min-w-[200px]", className)}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {pendingRemove.current ? "Removing..." : "Adding..."}
      </Button>
    );
  }

  if (state === "in_cart") {
    return (
      <Button
        onClick={onClick}
        className={cn(
          "w-full min-w-[200px] bg-green-600 hover:bg-green-700",
          className
        )}
      >
        <Check className="mr-2 h-4 w-4" />
        In cart
      </Button>
    );
  }

  return (
    <Button onClick={onClick} className={cn("w-full min-w-[200px]", className)}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  );
}
