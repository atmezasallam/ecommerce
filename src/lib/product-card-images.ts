type VariantImageRecord = {
  id: string;
  url: string;
  productVariantId: string;
};

type VariantWithImages = {
  id: string;
  variantImage?: string | null;
  images: VariantImageRecord[];
};

export function getProductCardImages(variant: VariantWithImages): VariantImageRecord[] {
  if (variant.images.length > 0) {
    return variant.images;
  }

  if (variant.variantImage) {
    return [
      {
        id: `variant-image-${variant.id}`,
        url: variant.variantImage,
        productVariantId: variant.id,
      },
    ];
  }

  return [];
}
