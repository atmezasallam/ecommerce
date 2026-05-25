"use client";
import { ProductPageDataType } from "@/src/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, FC, SetStateAction } from "react";
import { ShoppingCart } from "lucide-react";
import { CopyIcon } from "@/src/components/store/icons";
import toast from "react-hot-toast";
import StarRating from "@/src/components/store/shared/star-rating";
import ProductPrice from "./product-price";
import Countdown from "../../shared/countdown";
import { Separator } from "@/src/components/ui/separator";
import ColorWheel from "@/src/components/shared/color-wheel";
import ProductVariantSelector from "./variant-selector";
import SizeSelector from "./size-selector";
import ProductAssurancePolicy from "./assurance-policy";
import { ProductVariantImage } from "@prisma/client";
import ProductWatch from "@/src/components/store/product-page/product-info/product-watch";
import AddToCartButton from "@/src/components/cart/AddToCartButton";
import AddToWishlistButton from "@/src/components/wishlist/AddToWishlistButton";
import { Button } from "@/src/components/ui/button";

interface Props {
  productData: ProductPageDataType;
  sizeId: string | undefined;
  setVariantImages: Dispatch<SetStateAction<ProductVariantImage[]>>;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
  initialInWishlist?: boolean;
}

const ProductInfo: FC<Props> = ({
  productData,
  sizeId,
  setVariantImages,
  setActiveImage,
  initialInWishlist = false,
}) => {
  // Check if productData exists, return null if it's missing (prevents rendering when there's no data)
  if (!productData) return null;

  // Destructure necessary properties from the productData object
  const {
    name,
    sku,
    colors,
    variantInfo,
    sizes,
    isSale,
    saleEndDate,
    variantName,
    variantId,
    store,
    rating,
    reviewsStatistics,
  } = productData;

  const { totalReviews } = reviewsStatistics;
  const selectedSize = sizes.find((size) => size.id === sizeId) ?? null;

  // Function to copy the SKU to the clipboard
  const copySkuToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sku);
      toast.success("Copied successfully");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="relative w-full xl:w-[540px]">
      {/* Title */}
      <div>
        <h1 className="text-main-primary inline font-bold leading-5">
          {name} · {variantName}
        </h1>
      </div>
      {/* Sku - Rating - Num reviews */}
      <div className="flex items-center text-xs mt-2">
        {/* Store details */}
        <Link
          href={`/store/${store.url}`}
          className="hidden sm:inline-block md:hidden lg:inline-block mr-2 hover:underline"
        >
          <div className="w-full flex items-center gap-x-1">
            <Image
              src={store.logo}
              alt={store.name}
              width={100}
              height={100}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </Link>
        {/* Sku - Rating - Num reviews */}
        <div className="whitespace-nowrap">
          <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-subtle">
            SKU: {sku}
          </span>
          <span
            className="inline-block align-middle text-primary mx-1 cursor-pointer"
            onClick={copySkuToClipboard}
          >
            <CopyIcon />
          </span>
        </div>
        <div className="ml-4 flex items-center gap-x-2 flex-1 whitespace-nowrap">
          <StarRating
            count={5}
            size={24}
            color1="#E8EAFB"
            color2="#95CFB2"
            value={Number(rating) || 0}
            half
          />
          <Link href="#reviews" className="text-accent hover:underline">
            (
            {totalReviews === 0
              ? "No review yet"
              : totalReviews === 1
              ? "1 review"
              : `${totalReviews} reviews`}
            )
          </Link>
        </div>
      </div>
      {/* Price - Sale countdown */}
      <div className="my-2 relative flex flex-col sm:flex-row justify-between">
        <ProductPrice sizeId={sizeId} sizes={sizes} />
        {isSale && saleEndDate && (
          <div className="mt-4 pb-2">
            <Countdown targetDate={saleEndDate} />
          </div>
        )}
      </div>
      {/* Product live watchers count */}
      <ProductWatch productId={variantId} />
      <Separator className="mt-2" />
      {/* Color wheel - variant switcher */}
      <div className="mt-4 space-y-2">
        <div className="relative flex items-center justify-between text-main-primary font-bold">
          <span className="flex items-center gap-x-2">
            {colors.length > 1 ? "Colors" : "Color"}
            <ColorWheel colors={colors} size={25} />
          </span>
        </div>
        <div className="mt-4">
          {(variantInfo?.length ?? 0) > 0 && (
            <ProductVariantSelector
              variants={variantInfo ?? []}
              slug={productData.variantSlug}
              setVariantImages={setVariantImages}
              setActiveImage={setActiveImage}
            />
          )}
        </div>
      </div>
      {/* Size selector */}
      <div className="space-y-2 pb-2 mt-4">
        <div>
          <h1 className="text-main-primary font-bold">Size </h1>
        </div>
        <SizeSelector sizes={sizes} sizeId={sizeId} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {selectedSize ? (
          <AddToCartButton
            productId={productData.productId}
            variantId={variantId}
            sizeId={selectedSize.id}
            storeId={store.id}
            stock={selectedSize.quantity}
          />
        ) : (
          <Button type="button" disabled variant="secondary" className="min-w-[200px] gap-2">
            <ShoppingCart className="h-4 w-4" />
            Select a size first
          </Button>
        )}
        <AddToWishlistButton
          productId={productData.productId}
          variantId={variantId}
          showLabel
          initialState={initialInWishlist}
        />
      </div>
      {/* Product assurance */}
      <Separator className="mt-2" />
      <ProductAssurancePolicy />
    </div>
  );
};

export default ProductInfo;