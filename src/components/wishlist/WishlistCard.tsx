"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Loader2, ShoppingCart, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { moveToCart, removeFromWishlist } from "@/src/app/actions/wishlist.actions";
import type { WishlistItemFull } from "@/types/wishlist.types";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import StarRating from "@/src/components/store/shared/star-rating";
import { cn } from "@/src/lib/utils";
import {
  formatWishlistUsd,
  isSaleActive,
  maxDiscountPercent,
  pickLowestInStockSize,
} from "@/src/lib/wishlist-pricing";

function colorDotStyle(name: string): React.CSSProperties {
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(name.trim())) {
    return { backgroundColor: name.trim() };
  }
  return { backgroundColor: "#E8EAFB" };
}

type WishlistCardProps = {
  item: WishlistItemFull;
  onRemoved: (id: string) => void;
};

export default function WishlistCard({ item, onRemoved }: WishlistCardProps) {
  const router = useRouter();
  const [pendingCart, startCart] = useTransition();
  const [pendingRemove, startRemove] = useTransition();
  const sizes = item.variant.sizes;
  const defaultSize = useMemo(() => pickLowestInStockSize(sizes), [sizes]);
  const [sizeId, setSizeId] = useState<string>(() => defaultSize?.id ?? sizes[0]?.id ?? "");

  const selected = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const effective = selected
    ? selected.price * (1 - selected.discount / 100)
    : 0;
  const saleLive = isSaleActive(item.variant.isSale, item.variant.saleEndDate);
  const saleEnded = item.variant.isSale && !saleLive;
  const discountPct = maxDiscountPercent(sizes);

  const img = item.variant.images[0]?.url ?? item.variant.variantImage;

  const onRemove = () => {
    startRemove(async () => {
      const res = await removeFromWishlist(item.id);
      if (res.success) {
        onRemoved(item.id);
        toast.success("Removed from wishlist");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const onMove = () => {
    if (!selected || selected.quantity < 1) return;
    startCart(async () => {
      const res = await moveToCart(item, selected.id);
      if (res.success) {
        onRemoved(item.id);
        toast.success("Moved to cart!");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const outOfStock = !selected || selected.quantity < 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
        "hover:z-[1] hover:scale-[1.02] hover:shadow-lg"
      )}
    >
      <div className="relative aspect-square bg-muted/40">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          disabled={pendingRemove}
          aria-label="Remove from wishlist"
        >
          {pendingRemove ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
        {item.variant.isSale && (
          <span
            className={cn(
              "absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-semibold text-black",
              saleLive ? "bg-[#95CFB2]" : "bg-base"
            )}
          >
            {saleEnded
              ? "Sale Ended"
              : discountPct > 0
                ? `${Math.round(discountPct)}% OFF`
                : "SALE"}
          </span>
        )}
        <Link
          href={`/product/${item.product.slug}/${item.variant.slug}`}
          className="absolute inset-0 block p-4"
        >
          <Image
            src={img}
            alt={item.product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/store/${item.product.store.url}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          {item.product.store.name}
        </Link>
        <Link
          href={`/product/${item.product.slug}/${item.variant.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary"
        >
          {item.product.name}
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">{item.variant.variantName}</p>

        {item.variant.colors.length > 0 && (
          <div className="flex items-center gap-1">
            {item.variant.colors.slice(0, 4).map((c) => (
              <span
                key={c.id}
                title={c.name}
                className="h-4 w-4 rounded-full border border-border shadow-sm"
                style={colorDotStyle(c.name)}
              />
            ))}
            {item.variant.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{item.variant.colors.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-[#2d6b54]">{formatWishlistUsd(effective)}</span>
          {selected && selected.discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatWishlistUsd(selected.price)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.product.rating > 0 && (
            <StarRating
              count={5}
              size={18}
              color1="#E8EAFB"
              color2="#95CFB2"
              value={item.product.rating}
              half
            />
          )}
          {item.product.rating > 0 && (
            <span>({item.product.rating.toFixed(1)})</span>
          )}
          {item.product.sales > 0 && (
            <span className="text-muted-foreground">· {item.product.sales} sold</span>
          )}
        </div>

        <div className="text-xs">
          {outOfStock ? (
            <span className="font-medium text-red-600 dark:text-red-400">Out of Stock</span>
          ) : selected.quantity <= 5 ? (
            <span className="font-medium text-amber-600 dark:text-amber-400">
              Only {selected.quantity} left!
            </span>
          ) : (
            <span className="text-green-700/90 dark:text-green-400/90">In Stock</span>
          )}
        </div>

        {sizes.length > 1 && (
          <Select value={sizeId} onValueChange={setSizeId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.size} — {formatWishlistUsd(s.price * (1 - s.discount / 100))}
                  {s.quantity < 1 ? " (out)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          type="button"
          className="mt-auto w-full gap-2"
          disabled={outOfStock || pendingCart}
          onClick={onMove}
        >
          {pendingCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          Move to Cart
        </Button>
        <Button variant="ghost" className="w-full" asChild>
          <Link href={`/product/${item.product.slug}/${item.variant.slug}`}>View Product</Link>
        </Button>
      </div>
    </motion.div>
  );
}
