"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";
import type { AppliedCartCoupon, CartItemFull, GuestCartItem } from "@/types/cart.types";

const GUEST_CART_COOKIE = "guest_cart";
const GUEST_MAX_AGE = 60 * 60 * 24 * 7;

const toGuestItemId = (item: GuestCartItem) => `${item.variantId}:${item.sizeId}`;

const readGuestCart = async (): Promise<GuestCartItem[]> => {
  const cookieStore = cookies();
  const raw = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GuestCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        typeof item.variantId === "string" &&
        typeof item.sizeId === "string" &&
        typeof item.storeId === "string" &&
        typeof item.quantity === "number"
    );
  } catch {
    return [];
  }
};

const writeGuestCart = async (items: GuestCartItem[]): Promise<void> => {
  const cookieStore = cookies();
  cookieStore.set(GUEST_CART_COOKIE, JSON.stringify(items), {
    maxAge: GUEST_MAX_AGE,
    path: "/",
  });
};

const getSizeStock = async (sizeId: string): Promise<number> => {
  const size = await prisma.size.findUnique({
    where: { id: sizeId },
    select: { quantity: true },
  });
  return size?.quantity ?? 0;
};

function lineTotalForCoupon(item: CartItemFull): number {
  const unit = item.size.price - (item.size.price * item.size.discount) / 100;
  return unit * item.quantity;
}

async function clearCouponIfInvalidForCart(userId: string): Promise<void> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { select: { storeId: true } },
      coupon: { select: { id: true, storeId: true, isGlobal: true } },
    },
  });
  if (!cart?.couponId || !cart.coupon) return;
  const c = cart.coupon;
  if (c.isGlobal) {
    if (cart.items.length === 0) {
      await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    }
    return;
  }
  const hasLineForStore = cart.items.some(
    (i: { storeId: string }) => i.storeId === c.storeId
  );
  if (!hasLineForStore) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });
  }
}

export async function getCart(): Promise<{
  items: CartItemFull[];
  isGuest: boolean;
  appliedCoupon: AppliedCartCoupon | null;
}> {
  const { userId } = await auth();

  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { store: true, category: true } },
            variant: { include: { colors: true, images: true } },
            size: true,
          },
        },
        coupon: {
          include: {
            store: { select: { id: true, name: true } },
          },
        },
      },
    });

    const items = (cart?.items ?? []) as CartItemFull[];

    let appliedCoupon: AppliedCartCoupon | null = null;
    if (cart?.coupon) {
      const c = cart.coupon;
      const now = new Date();
      const dateOk = c.isActive && c.startDate <= now && c.endDate >= now;
      const stillValid = c.isGlobal
        ? dateOk && items.length > 0
        : dateOk && items.some((i) => i.storeId === c.storeId);
      if (!stillValid) {
        await prisma.cart.update({
          where: { id: cart.id },
          data: { couponId: null },
        });
      } else {
        appliedCoupon = {
          id: c.id,
          code: c.code,
          discount: c.discount,
          isGlobal: c.isGlobal,
          storeId: c.storeId,
          storeName: c.isGlobal ? "All products" : c.store!.name,
        };
      }
    }

    return {
      items,
      isGuest: false,
      appliedCoupon,
    };
  }

  const guestItems = await readGuestCart();
  if (guestItems.length === 0) return { items: [], isGuest: true, appliedCoupon: null };

  const enriched = await Promise.all(
    guestItems.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { store: true, category: true },
      });
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { colors: true, images: true },
      });
      const size = await prisma.size.findUnique({
        where: { id: item.sizeId },
      });

      if (!product || !variant || !size) return null;

      return {
        id: toGuestItemId(item),
        cartId: "guest",
        productId: item.productId,
        variantId: item.variantId,
        sizeId: item.sizeId,
        storeId: item.storeId,
        quantity: item.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
        product,
        variant,
        size,
      } as CartItemFull;
    })
  );

  return {
    items: enriched.filter((item): item is CartItemFull => item !== null),
    isGuest: true,
    appliedCoupon: null,
  };
}

export async function applyCartCoupon(
  rawCode: string
): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "Sign in to apply a coupon." };
  }

  const code = rawCode.trim().toUpperCase().replace(/\s+/g, "");
  if (code.length < 3) {
    return { success: false, message: "Enter a valid coupon code." };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { store: true, category: true } },
          variant: { include: { colors: true, images: true } },
          size: true,
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) {
    return { success: false, message: "Your cart is empty." };
  }

  const itemsFull = cart.items as CartItemFull[];
  const storeIds = [...new Set(itemsFull.map((i) => i.storeId))];
  const now = new Date();

  const matches = await prisma.coupon.findMany({
    where: {
      code,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [{ isGlobal: true }, { isGlobal: false, storeId: { in: storeIds } }],
    },
    include: {
      store: { select: { id: true, name: true } },
    },
  });

  if (matches.length === 0) {
    return {
      success: false,
      message:
        "Invalid or expired code, or no matching coupon for items in your cart.",
    };
  }

  const globalMatch = matches.find((m) => m.isGlobal);
  if (globalMatch) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: globalMatch.id },
    });
    revalidatePath("/cart");
    return {
      success: true,
      message: `${globalMatch.discount}% off your entire cart (all products & sellers).`,
    };
  }

  const storeSubtotal = (sid: string) =>
    itemsFull.filter((i) => i.storeId === sid).reduce((acc, i) => acc + lineTotalForCoupon(i), 0);

  const candidates = matches.filter(
    (m) => !m.isGlobal && m.storeId != null && storeSubtotal(m.storeId) > 0
  );

  if (candidates.length === 0) {
    return {
      success: false,
      message: "Add at least one product from the seller who gave you this coupon.",
    };
  }

  if (candidates.length > 1) {
    return {
      success: false,
      message:
        "This code is used by more than one seller in your cart. Remove items from other sellers, then try again.",
    };
  }

  const chosen = candidates[0]!;

  await prisma.cart.update({
    where: { id: cart.id },
    data: { couponId: chosen.id },
  });

  revalidatePath("/cart");
  return {
    success: true,
    message: `${chosen.discount}% off items from ${chosen.store!.name} only (other sellers unchanged).`,
  };
}

export async function removeCartCoupon(): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "Sign in to manage coupons." };
  }

  await prisma.cart.updateMany({
    where: { userId },
    data: { couponId: null },
  });

  revalidatePath("/cart");
  return { success: true, message: "Coupon removed." };
}

export async function addToCart(
  data: GuestCartItem
): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();

  if (userId) {
    const stock = await getSizeStock(data.sizeId);
    if (stock < data.quantity) {
      return { success: false, message: "Not enough stock for selected size." };
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId_sizeId: {
          cartId: cart.id,
          variantId: data.variantId,
          sizeId: data.sizeId,
        },
      },
    });

    const nextQty = (existing?.quantity ?? 0) + data.quantity;
    if (nextQty > stock) {
      return { success: false, message: "Requested quantity exceeds available stock." };
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId_sizeId: {
          cartId: cart.id,
          variantId: data.variantId,
          sizeId: data.sizeId,
        },
      },
      update: {
        quantity: { increment: data.quantity },
      },
      create: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId,
        sizeId: data.sizeId,
        storeId: data.storeId,
        quantity: data.quantity,
      },
    });

    revalidatePath("/cart");
    return { success: true, message: "Item added to cart." };
  }

  const items = await readGuestCart();
  const idx = items.findIndex(
    (item) => item.variantId === data.variantId && item.sizeId === data.sizeId
  );

  if (idx >= 0) {
    items[idx] = { ...items[idx], quantity: items[idx].quantity + data.quantity };
  } else {
    items.push(data);
  }

  await writeGuestCart(items);
  revalidatePath("/cart");
  return { success: true, message: "Item added to cart." };
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  if (quantity <= 0) return removeFromCart(itemId);

  const { userId } = await auth();

  if (userId) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { size: true, cart: true },
    });
    if (!item || item.cart.userId !== userId) {
      return { success: false, message: "Cart item not found." };
    }
    if (quantity > item.size.quantity) {
      return { success: false, message: "Quantity exceeds stock." };
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  } else {
    const items = await readGuestCart();
    const updated = items.map((item) =>
      toGuestItemId(item) === itemId ? { ...item, quantity } : item
    );
    await writeGuestCart(updated);
  }

  revalidatePath("/cart");
  return { success: true, message: "Cart quantity updated." };
}

export async function removeFromCart(
  itemId: string
): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();

  if (userId) {
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    await clearCouponIfInvalidForCart(userId);
  } else {
    const items = await readGuestCart();
    const updated = items.filter((item) => toGuestItemId(item) !== itemId);
    await writeGuestCart(updated);
  }

  revalidatePath("/cart");
  return { success: true, message: "Item removed from cart." };
}

export async function clearCart(): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();

  if (userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { couponId: null },
      });
    }
  } else {
    const cookieStore = cookies();
    cookieStore.delete(GUEST_CART_COOKIE);
  }

  revalidatePath("/cart");
  return { success: true, message: "Cart cleared." };
}

export async function mergeGuestCartOnLogin(userId: string): Promise<void> {
  const cookieStore = cookies();
  const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE);
  if (!guestCartCookie?.value || guestCartCookie.value === "[]") return;

  let guestItems: GuestCartItem[] = [];
  try {
    const parsed = JSON.parse(guestCartCookie.value) as unknown;
    if (!Array.isArray(parsed)) return;
    guestItems = parsed.filter(
      (item): item is GuestCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        typeof item.variantId === "string" &&
        typeof item.sizeId === "string" &&
        typeof item.storeId === "string" &&
        typeof item.quantity === "number"
    );
  } catch {
    return;
  }

  if (guestItems.length === 0) return;

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  await Promise.all(
    guestItems.map((item) =>
      prisma.cartItem.upsert({
        where: {
          cartId_variantId_sizeId: {
            cartId: cart.id,
            variantId: item.variantId,
            sizeId: item.sizeId,
          },
        },
        update: {
          quantity: { increment: item.quantity },
        },
        create: {
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          storeId: item.storeId,
          quantity: item.quantity,
        },
      })
    )
  );

  cookieStore.delete(GUEST_CART_COOKIE);
  revalidatePath("/cart");
}

export async function getCartItemCount(): Promise<number> {
  const { userId } = await auth();
  if (userId) {
    return prisma.cartItem.count({
      where: { cart: { userId } },
    });
  }

  const items = await readGuestCart();
  return items.length;
}
