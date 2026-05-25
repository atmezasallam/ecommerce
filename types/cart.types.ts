import type { CartItem, Color } from "@prisma/client";

export type CartItemFull = CartItem & {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    shippingFeeMethod: string;
    store: {
      id: string;
      name: string;
      logo: string;
      url: string;
    };
    category: {
      name: string;
      url: string;
    };
  };
  variant: {
    id: string;
    variantName: string;
    variantImage: string;
    slug: string;
    isSale: boolean;
    saleEndDate: string | null;
    colors: Color[];
  };
  size: {
    id: string;
    size: string;
    price: number;
    discount: number;
    quantity: number;
  };
};

export type GuestCartItem = {
  productId: string;
  variantId: string;
  sizeId: string;
  storeId: string;
  quantity: number;
};

/** Active coupon on the signed-in user's cart (one per cart). */
export type AppliedCartCoupon = {
  id: string;
  code: string;
  discount: number;
  /** Platform-wide admin coupon — discount applies to entire cart. */
  isGlobal: boolean;
  storeId: string | null;
  storeName: string;
};

export type CartStore = {
  storeId: string;
  storeName: string;
  storeLogo: string;
  storeUrl: string;
  items: CartItemFull[] | GuestCartItem[];
};
