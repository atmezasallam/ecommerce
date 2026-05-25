"use client";

import { ProductPageDataType } from "@/src/lib/types";
import { ProductVariantImage } from "@prisma/client";
import { FC, useEffect, useMemo, useState } from "react";
import ProductInfo from "./product-info/product-info";
import ProductSwiper from "./product-swiper";
import ShippingDetails from "./shipping/shipping-details";
import ReturnPrivacySecurityCard from "./returns-security-privacy-card";
import { cn } from "@/src/lib/utils";

interface Props {
  productData: ProductPageDataType | null | undefined;
  sizeId?: string;
  initialInWishlist?: boolean;
}

const ProductPageContainer: FC<Props> = ({ productData, sizeId, initialInWishlist }) => {
  const [variantImages, setVariantImages] = useState<ProductVariantImage[]>(
    []
  );
  const [activeImage, setActiveImage] = useState<ProductVariantImage | null>(
    null
  );

  const displayImages = useMemo(() => {
    if (variantImages.length > 0) return variantImages;
    return productData?.images ?? [];
  }, [variantImages, productData?.images]);

  useEffect(() => {
    const imgs = productData?.images;
    if (!imgs?.length) return;
    setActiveImage((prev) => prev ?? imgs[0] ?? null);
  }, [productData?.images, productData?.variantId]);

  if (!productData) return null;

  const quantity = 1;
  const shippingDetails = productData.shippingDetails;

  return (
    <div>
      <div
        className={cn(
          "flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10 w-full"
        )}
      >
        <div className="w-full shrink-0 xl:max-w-[600px] xl:w-[600px]">
          <ProductSwiper
            images={displayImages}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ProductInfo
            productData={productData}
            sizeId={sizeId}
            setVariantImages={setVariantImages}
            setActiveImage={setActiveImage}
            initialInWishlist={initialInWishlist}
          />
          {typeof shippingDetails !== "boolean" && shippingDetails && (
            <div className="mt-4 space-y-4">
              <ShippingDetails
                shippingDetails={shippingDetails}
                quantity={quantity}
                weight={productData.weight}
              />
              <ReturnPrivacySecurityCard
                returnPolicy={shippingDetails.returnPolicy}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPageContainer;
