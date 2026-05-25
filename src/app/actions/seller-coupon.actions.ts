"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

const CODE_REGEX = /^[A-Z0-9_-]{3,40}$/;

async function getOwnedStore(storeUrl: string) {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.store.findFirst({
    where: { url: storeUrl, userId },
    select: { id: true },
  });
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function createSellerCoupon(
  storeUrl: string,
  input: {
    code: string;
    name: string;
    discount: number;
    startDateIso: string;
    endDateIso: string;
  }
): Promise<{ success: boolean; message?: string }> {
  const store = await getOwnedStore(storeUrl);
  if (!store) {
    return { success: false, message: "Store not found or access denied." };
  }

  const code = normalizeCode(input.code);
  if (code.length < 3 || code.length > 40) {
    return { success: false, message: "Code must be 3–40 characters." };
  }
  if (!CODE_REGEX.test(code)) {
    return {
      success: false,
      message: "Use letters, numbers, hyphens, and underscores only.",
    };
  }

  const discount = Number(input.discount);
  if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
    return { success: false, message: "Discount must be between 1% and 100%." };
  }

  const startDate = new Date(input.startDateIso);
  const endDate = new Date(input.endDateIso);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { success: false, message: "Invalid dates." };
  }
  if (endDate <= startDate) {
    return { success: false, message: "End date must be after start date." };
  }

  const name = input.name.trim().slice(0, 120);

  const dup = await prisma.coupon.findFirst({
    where: { storeId: store.id, code, isGlobal: false },
  });
  if (dup) {
    return { success: false, message: "A coupon with this code already exists for your store." };
  }

  try {
    await prisma.coupon.create({
      data: {
        storeId: store.id,
        code,
        name,
        discount,
        startDate,
        endDate,
        isActive: true,
        isGlobal: false,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, message: "A coupon with this code already exists for your store." };
    }
    return { success: false, message: "Could not create coupon." };
  }

  revalidatePath(`/dashboard/seller/stores/${storeUrl}/coupons`);
  return { success: true };
}

export async function deleteSellerCoupon(
  storeUrl: string,
  couponId: string
): Promise<{ success: boolean; message?: string }> {
  const store = await getOwnedStore(storeUrl);
  if (!store) {
    return { success: false, message: "Store not found or access denied." };
  }

  const deleted = await prisma.coupon.deleteMany({
    where: { id: couponId, storeId: store.id },
  });
  if (deleted.count === 0) {
    return { success: false, message: "Coupon not found." };
  }

  revalidatePath(`/dashboard/seller/stores/${storeUrl}/coupons`);
  return { success: true };
}

export async function setSellerCouponActive(
  storeUrl: string,
  couponId: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string }> {
  const store = await getOwnedStore(storeUrl);
  if (!store) {
    return { success: false, message: "Store not found or access denied." };
  }

  const updated = await prisma.coupon.updateMany({
    where: { id: couponId, storeId: store.id },
    data: { isActive },
  });
  if (updated.count === 0) {
    return { success: false, message: "Coupon not found." };
  }

  revalidatePath(`/dashboard/seller/stores/${storeUrl}/coupons`);
  return { success: true };
}
