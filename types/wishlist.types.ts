import type {
  Color,
  FreeShipping,
  Product,
  ProductVariant,
  ProductVariantImage,
  Size,
  Store,
  WishlistItem,
} from "@prisma/client";

export type WishlistItemFull = WishlistItem & {
  product: Product & {
    store: Store;
    freeShipping: FreeShipping | null;
  };
  variant: ProductVariant & {
    sizes: Size[];
    colors: Color[];
    images: ProductVariantImage[];
  };
};

export type GuestWishlistItem = {
  productId: string;
  variantId: string;
};

export type WishlistResult = {
  items: WishlistItemFull[];
  isGuest: boolean;
  shareToken: string | null;
};
