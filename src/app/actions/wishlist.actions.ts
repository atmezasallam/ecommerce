"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";
import { addToCart } from "@/src/app/actions/cart.actions";
import type { GuestWishlistItem, WishlistItemFull, WishlistResult } from "@/types/wishlist.types";
import type { Prisma } from "@prisma/client";

const GUEST_WISHLIST_COOKIE = "guest_wishlist";
const GUEST_MAX_AGE = 60 * 60 * 24 * 7;

const wishlistItemInclude = {
  product: {
    include: {
      store: true,
      freeShipping: true,
    },
  },
  variant: {
    include: {
      sizes: { orderBy: { price: "asc" as const } },
      colors: true,
      images: true,
    },
  },
} satisfies Prisma.WishlistItemInclude;

function guestItemId(variantId: string): string {
  return `guest:${variantId}`;
}

async function readGuestWishlist(): Promise<GuestWishlistItem[]> {
  const cookieStore = cookies();
  const raw = cookieStore.get(GUEST_WISHLIST_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is GuestWishlistItem =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as GuestWishlistItem).productId === "string" &&
        typeof (row as GuestWishlistItem).variantId === "string"
    );
  } catch {
    return [];
  }
}

async function writeGuestWishlist(items: GuestWishlistItem[]): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(GUEST_WISHLIST_COOKIE, JSON.stringify(items), {
    maxAge: GUEST_MAX_AGE,
    path: "/",
  });
}

async function enrichGuestRows(
  rows: GuestWishlistItem[]
): Promise<WishlistItemFull[]> {
  const out: WishlistItemFull[] = [];
  for (const row of rows) {
    const product = await prisma.product.findUnique({
      where: { id: row.productId },
      include: { store: true, freeShipping: true },
    });
    const variant = await prisma.productVariant.findUnique({
      where: { id: row.variantId },
      include: {
        sizes: { orderBy: { price: "asc" } },
        colors: true,
        images: true,
      },
    });
    if (!product || product.isArchived || !variant || variant.productId !== product.id) {
      continue;
    }
    out.push({
      id: guestItemId(row.variantId),
      wishlistId: "guest",
      productId: row.productId,
      variantId: row.variantId,
      createdAt: new Date(),
      product,
      variant,
    });
  }
  return out;
}

export async function getWishlist(): Promise<WishlistResult> {
  const { userId } = await auth();
  if (userId) {
    const list = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: wishlistItemInclude,
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const items = (list?.items ?? []).filter(
      (i: { product: { isArchived: boolean } }) => !i.product.isArchived
    ) as WishlistItemFull[];
    return { items, isGuest: false, shareToken: userId };
  }
  const guest = await readGuestWishlist();
  const items = await enrichGuestRows(guest);
  return { items, isGuest: true, shareToken: null };
}

export async function getPublicWishlistByUserId(
  userId: string
): Promise<WishlistItemFull[]> {
  const list = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: wishlistItemInclude,
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return (list?.items ?? []).filter(
    (i: { product: { isArchived: boolean } }) => !i.product.isArchived
  ) as WishlistItemFull[];
}

export async function toggleWishlist(
  productId: string,
  variantId: string
): Promise<{ added: boolean; message: string }> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, productId: true },
  });
  if (!variant || variant.productId !== productId) {
    return { added: false, message: "Invalid product or variant." };
  }

  const { userId } = await auth();
  if (userId) {
    let list = await prisma.wishlist.findUnique({ where: { userId } });
    if (!list) {
      list = await prisma.wishlist.create({ data: { userId } });
    }
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_variantId: { wishlistId: list.id, variantId },
      },
    });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/profile/wishlist");
      revalidatePath("/");
      return { added: false, message: "Removed from wishlist." };
    }
    await prisma.wishlistItem.create({
      data: {
        wishlistId: list.id,
        productId,
        variantId,
      },
    });
    revalidatePath("/profile/wishlist");
    revalidatePath("/");
    return { added: true, message: "Added to wishlist." };
  }

  const guest = await readGuestWishlist();
  const idx = guest.findIndex((g) => g.variantId === variantId);
  if (idx >= 0) {
    guest.splice(idx, 1);
    await writeGuestWishlist(guest);
    revalidatePath("/profile/wishlist");
    revalidatePath("/");
    return { added: false, message: "Removed from wishlist." };
  }
  guest.push({ productId, variantId });
  await writeGuestWishlist(guest);
  revalidatePath("/profile/wishlist");
  revalidatePath("/");
  return { added: true, message: "Added to wishlist." };
}

function parseGuestVariantIdFromItemId(itemId: string): string | null {
  if (itemId.startsWith("guest:")) {
    return itemId.slice("guest:".length);
  }
  return null;
}

export async function removeFromWishlist(
  itemId: string
): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (userId) {
    const guestVariant = parseGuestVariantIdFromItemId(itemId);
    if (guestVariant) {
      return { success: false, message: "Invalid item." };
    }
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: { wishlist: true },
    });
    if (!item || item.wishlist.userId !== userId) {
      return { success: false, message: "Item not found." };
    }
    await prisma.wishlistItem.delete({ where: { id: itemId } });
  } else {
    const variantId = parseGuestVariantIdFromItemId(itemId);
    if (!variantId) {
      return { success: false, message: "Item not found." };
    }
    const guest = (await readGuestWishlist()).filter((g) => g.variantId !== variantId);
    await writeGuestWishlist(guest);
  }
  revalidatePath("/profile/wishlist");
  revalidatePath("/");
  return { success: true, message: "Removed from wishlist." };
}

function pickLowestPriceInStockSize(sizes: { id: string; quantity: number; price: number; discount: number }[]) {
  const sorted = [...sizes].sort((a, b) => {
    const pa = a.price * (1 - a.discount / 100);
    const pb = b.price * (1 - b.discount / 100);
    return pa - pb;
  });
  return sorted.find((s) => s.quantity > 0) ?? sorted[0] ?? null;
}

export async function moveToCart(
  item: WishlistItemFull,
  sizeId: string
): Promise<{ success: boolean; message: string }> {
  const size = item.variant.sizes.find((s) => s.id === sizeId);
  if (!size || size.quantity < 1) {
    return { success: false, message: "Size unavailable or out of stock." };
  }
  const res = await addToCart({
    productId: item.productId,
    variantId: item.variantId,
    sizeId,
    storeId: item.product.storeId,
    quantity: 1,
  });
  if (!res.success) {
    return res;
  }
  await removeFromWishlist(item.id);
  revalidatePath("/cart");
  return { success: true, message: "Moved to cart." };
}

export async function moveAllToCart(): Promise<{
  success: boolean;
  message: string;
  moved: number;
}> {
  const { items } = await getWishlist();
  let moved = 0;
  for (const item of items) {
    const size = pickLowestPriceInStockSize(item.variant.sizes);
    if (!size || size.quantity < 1) continue;
    const res = await addToCart({
      productId: item.productId,
      variantId: item.variantId,
      sizeId: size.id,
      storeId: item.product.storeId,
      quantity: 1,
    });
    if (res.success) {
      moved += 1;
      await removeFromWishlist(item.id);
    }
  }
  revalidatePath("/profile/wishlist");
  revalidatePath("/cart");
  revalidatePath("/");
  return {
    success: moved > 0 || items.length === 0,
    message:
      moved > 0
        ? `Moved ${moved} item(s) to cart.`
        : items.length === 0
          ? "Wishlist is already empty."
          : "No items could be moved (check stock).",
    moved,
  };
}

export async function clearWishlist(): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (userId) {
    const list = await prisma.wishlist.findUnique({ where: { userId } });
    if (list) {
      await prisma.wishlistItem.deleteMany({ where: { wishlistId: list.id } });
    }
  } else {
    const cookieStore = cookies();
    cookieStore.delete(GUEST_WISHLIST_COOKIE);
  }
  revalidatePath("/profile/wishlist");
  revalidatePath("/");
  return { success: true, message: "Wishlist cleared." };
}

export async function getWishlistCount(): Promise<number> {
  const { userId } = await auth();
  if (userId) {
    return prisma.wishlistItem.count({
      where: { wishlist: { userId } },
    });
  }
  const guest = await readGuestWishlist();
  return guest.length;
}

export async function isInWishlist(variantId: string): Promise<boolean> {
  const { userId } = await auth();
  if (userId) {
    const row = await prisma.wishlistItem.findFirst({
      where: { variantId, wishlist: { userId } },
      select: { id: true },
    });
    return Boolean(row);
  }
  const guest = await readGuestWishlist();
  return guest.some((g) => g.variantId === variantId);
}

export async function mergeGuestWishlistOnLogin(userId: string): Promise<void> {
  const cookieStore = cookies();
  const guestWishlistCookie = cookieStore.get(GUEST_WISHLIST_COOKIE);
  if (!guestWishlistCookie?.value || guestWishlistCookie.value === "[]") return;

  let guest: GuestWishlistItem[] = [];
  try {
    const parsed = JSON.parse(guestWishlistCookie.value) as unknown;
    if (!Array.isArray(parsed)) return;
    guest = parsed.filter(
      (row): row is GuestWishlistItem =>
        typeof row === "object" &&
        row !== null &&
        typeof row.productId === "string" &&
        typeof row.variantId === "string"
    );
  } catch {
    return;
  }

  if (guest.length === 0) return;

  let list = await prisma.wishlist.findUnique({ where: { userId } });
  if (!list) {
    list = await prisma.wishlist.create({ data: { userId } });
  }

  await Promise.all(
    guest.map((row) =>
      prisma.wishlistItem.upsert({
        where: {
          wishlistId_variantId: { wishlistId: list.id, variantId: row.variantId },
        },
        create: {
          wishlistId: list.id,
          productId: row.productId,
          variantId: row.variantId,
        },
        update: {},
      })
    )
  );

  cookieStore.delete(GUEST_WISHLIST_COOKIE);
  revalidatePath("/profile/wishlist");
  revalidatePath("/");
}
