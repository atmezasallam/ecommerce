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
  const [variant, setVariant] = useState<VariantSimplified>(variants[0]);
  const { variantSlug, variantName, images, sizes } = variant;

  /*const handleaddToWishlist = async () => {
    try {
      const res = await addToWishlist(id, variant.variantId);
      if (res) toast.success("Product successfully added to wishlist.");
    } catch (error: any) {
      toast.error(error.toString());
    } 
  };*/

  return (
    <div className="w-full">
      <div
        className={cn(
          "group w-full relative z-0 transition-all duration-200 bg-surface ease-in-out p-4 rounded-3xl border border-transparent hover:shadow-xl hover:border-border hover:z-20",
          {
            "": true,
          }
        )}
      >
        <div className="relative w-full h-full">
          <AddToWishlistButton
            productId={id}
            variantId={variant.variantId}
            className="absolute right-1 top-1 z-20 h-9 w-9 bg-background/80 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
          />
          <Link
            href={`/product/${slug}/${variantSlug}`}
            className="w-full relative inline-block overflow-hidden"
          >
            {/* Images Swiper */}
            <ProductCardImageSwiper images={images} />
            {/* Title */}
            <div className="text-sm text-main-primary h-[18px] overflow-hidden overflow-ellipsis line-clamp-1">
              {name} · {variantName}
            </div>
            {/* Rating - Sales */}
            {(product.rating > 0 || product.sales > 0) && (
              <div className="flex items-center gap-x-1 h-5">
                {product.rating > 0 && (
                  <StarRating
                    count={5}
                    size={24}
                    color1="#E8EAFB"
                    color2="#95CFB2"
                    value={Number(rating) || 0}
                    half
                  />
                )}
                {product.sales > 0 && (
                  <div className="text-xs text-main-secondary">{sales} sold</div>
                )}
              </div>
            )}
            {/* Price */}
            <ProductPrice sizes={sizes} isCard />
          </Link>
        </div>
        <div className="max-h-0 overflow-hidden opacity-0 pointer-events-none transition-all duration-200 group-hover:max-h-48 group-hover:opacity-100 group-hover:pointer-events-auto pt-2 space-y-2">
          {/* Variant switcher */}
          <VariantSwitcher
            images={variantImages}
            variants={variants}
            setVariant={setVariant}
            selectedVariant={variant}
          />
          {/* Action buttons */}
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