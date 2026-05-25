import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/src/components/ui/button";

export default function CartEmptyState() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <ShoppingCart className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">Your cart is empty</h2>
      <p className="text-sm text-muted-foreground">
        Looks like you haven&apos;t added anything yet.
      </p>
      <Button asChild>
        <Link href="/">Start Shopping</Link>
      </Button>
    </div>
  );
}
