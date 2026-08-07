"use client";
import { ProductType, VariantSimplified } from "@/src/lib/types";
import Link from "next/link";
import { useState } from "react";
import StarRating from "@/src/components/store/shared/star-rating";
import ProductCardImageSwiper from "@/src/components/store/cards/product/swiper";
import VariantSwitcher from "@/src/components/store/cards/product/variant-switcher";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import ProductPrice from "@/src/components/store/product-page/product-info/product-price";
import AddToWishlistButton from "@/src/components/wishlist/AddToWishlistButton";

export default function ProductCard({ product }: { product: ProductType }) {
  const { name, slug, rating, sales, variantImages, variants, id } = product;
  const [variant, setVariant] = useState<VariantSimplified | null>(variants[0] ?? null);

  if (!variant) {
    return null;
  }

  const { variantSlug, variantName, images, sizes } = variant;

  return (
    <div className="w-full">
      <div
        className={cn(
          "group relative z-0 w-full rounded-2xl border border-transparent bg-surface p-2 transition-all duration-200 ease-in-out hover:z-20 hover:border-border hover:shadow-xl lg:rounded-3xl lg:p-4"
        )}
      >
        <div className="relative h-full w-full">
          <AddToWishlistButton
            productId={id}
            variantId={variant.variantId}
            className="absolute right-0.5 top-0.5 z-20 h-8 w-8 bg-background/80 text-foreground shadow-sm backdrop-blur-sm hover:bg-background lg:right-1 lg:top-1 lg:h-9 lg:w-9"
          />
          <Link
            href={`/product/${slug}/${variantSlug}`}
            className="relative inline-block w-full overflow-hidden"
          >
            <ProductCardImageSwiper images={images} />
            <div className="line-clamp-1 text-xs text-main-primary lg:h-[18px] lg:text-sm">
              {name} · {variantName}
            </div>
            {(product.rating > 0 || product.sales > 0) && (
              <div className="flex items-center gap-x-1 lg:h-5">
                {product.rating > 0 && (
                  <>
                    <StarRating
                      count={5}
                      size={14}
                      color1="#E8EAFB"
                      color2="#95CFB2"
                      value={Number(rating) || 0}
                      half
                      className="lg:hidden"
                    />
                    <StarRating
                      count={5}
                      size={24}
                      color1="#E8EAFB"
                      color2="#95CFB2"
                      value={Number(rating) || 0}
                      half
                      className="hidden lg:inline-flex"
                    />
                  </>
                )}
                {product.sales > 0 && (
                  <div className="text-xs text-main-secondary">{sales} sold</div>
                )}
              </div>
            )}
            <ProductPrice sizes={sizes} isCard />
          </Link>
        </div>
        <div className="pointer-events-none max-h-0 space-y-2 overflow-hidden pt-2 opacity-0 transition-all duration-200 group-hover:max-h-48 group-hover:opacity-100 group-hover:pointer-events-auto">
          <VariantSwitcher
            images={variantImages}
            variants={variants}
            setVariant={setVariant}
            selectedVariant={variant}
          />
          <div className="flex flex-items gap-x-1">
            <Button>
              <Link href={`/product/${slug}/${variantSlug}`}>Add to cart</Link>
            </Button>
            <AddToWishlistButton
              productId={id}
              variantId={variant.variantId}
              className="h-9 w-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
