"use client";

import { useState } from "react";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { addToCart } from "@/src/app/actions/cart.actions";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  variantId: string;
  sizeId: string;
  storeId: string;
  stock: number;
  className?: string;
};

type AddToCartState = "idle" | "loading" | "added" | "out_of_stock";

export default function AddToCartButton({
  productId,
  variantId,
  sizeId,
  storeId,
  stock,
  className,
}: AddToCartButtonProps) {
  const [state, setState] = useState<AddToCartState>(stock === 0 ? "out_of_stock" : "idle");

  const onClick = async () => {
    if (state === "loading" || state === "out_of_stock") return;

    setState("loading");
    const result = await addToCart({
      productId,
      variantId,
      sizeId,
      storeId,
      quantity: 1,
    });

    if (result.success) {
      setState("added");
      toast.success("Item added to cart!");
      setTimeout(() => setState(stock === 0 ? "out_of_stock" : "idle"), 2000);
      return;
    }

    setState("idle");
    toast.error(result.message);
  };

  if (state === "out_of_stock") {
    return (
      <Button disabled className={cn("w-full", className)}>
        Out of Stock
      </Button>
    );
  }

  if (state === "loading") {
    return (
      <Button disabled className={cn("w-full", className)}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Adding...
      </Button>
    );
  }

  if (state === "added") {
    return (
      <Button disabled className={cn("w-full bg-green-600 hover:bg-green-600", className)}>
        <Check className="mr-2 h-4 w-4" />
        Added!
      </Button>
    );
  }

  return (
    <Button onClick={onClick} className={cn("w-full", className)}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  );
}
