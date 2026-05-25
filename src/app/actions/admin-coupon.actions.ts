"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

const CODE_REGEX = /^[A-Z0-9_-]{3,40}$/;

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

async function assertAdmin(): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await currentUser();
  if (!user) {
    return { ok: false, message: "You must be signed in." };
  }
  const role = user.privateMetadata?.role;
  if (role !== "ADMIN") {
    return { ok: false, message: "Admin access required." };
  }
  return { ok: true };
}

export async function createAdminCoupon(input: {
  isGlobal: boolean;
  storeId?: string | null;
  code: string;
  name: string;
  discount: number;
  startDateIso: string;
  endDateIso: string;
  isActive: boolean;
}): Promise<{ success: boolean; message?: string }> {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, message: gate.message };

  const code = normalizeCode(input.code);
  if (code.length < 3 || !CODE_REGEX.test(code)) {
    return { success: false, message: "Code must be 3–40 characters (letters, numbers, - _)." };
  }

  const discount = Number(input.discount);
  if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
    return { success: false, message: "Discount must be between 1 and 100." };
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

  if (input.isGlobal) {
    const dup = await prisma.coupon.findFirst({
      where: { code, isGlobal: true },
    });
    if (dup) {
      return { success: false, message: "A platform-wide coupon with this code already exists." };
    }
    try {
      await prisma.coupon.create({
        data: {
          isGlobal: true,
          storeId: null,
          code,
          name,
          discount,
          startDate,
          endDate,
          isActive: input.isActive,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { success: false, message: "Duplicate coupon code." };
      }
      return { success: false, message: "Could not create coupon." };
    }
  } else {
    const sid = input.storeId;
    if (!sid) {
      return { success: false, message: "Select a store, or enable platform-wide." };
    }
    const store = await prisma.store.findUnique({
      where: { id: sid },
      select: { id: true },
    });
    if (!store) {
      return { success: false, message: "Store not found." };
    }
    const dup = await prisma.coupon.findFirst({
      where: { storeId: sid, code, isGlobal: false },
    });
    if (dup) {
      return { success: false, message: "That code already exists for this store." };
    }
    try {
      await prisma.coupon.create({
        data: {
          isGlobal: false,
          storeId: sid,
          code,
          name,
          discount,
          startDate,
          endDate,
          isActive: input.isActive,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { success: false, message: "Duplicate coupon code for this store." };
      }
      return { success: false, message: "Could not create coupon." };
    }
  }

  revalidatePath("/dashboard/admin/coupons");
  return { success: true };
}

export async function updateAdminCoupon(
  couponId: string,
  input: {
    isGlobal: boolean;
    storeId?: string | null;
    code: string;
    name: string;
    discount: number;
    startDateIso: string;
    endDateIso: string;
    isActive: boolean;
  }
): Promise<{ success: boolean; message?: string }> {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, message: gate.message };

  const code = normalizeCode(input.code);
  if (code.length < 3 || !CODE_REGEX.test(code)) {
    return { success: false, message: "Code must be 3–40 characters (letters, numbers, - _)." };
  }

  const discount = Number(input.discount);
  if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
    return { success: false, message: "Discount must be between 1 and 100." };
  }

  const startDate = new Date(input.startDateIso);
  const endDate = new Date(input.endDateIso);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { success: false, message: "Invalid dates." };
  }
  if (endDate <= startDate) {
    return { success: false, message: "End date must be after start date." };
  }

  const existing = await prisma.coupon.findUnique({
    where: { id: couponId },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, message: "Coupon not found." };
  }

  if (input.isGlobal) {
    const dup = await prisma.coupon.findFirst({
      where: { code, isGlobal: true, NOT: { id: couponId } },
    });
    if (dup) {
      return { success: false, message: "Another platform-wide coupon already uses this code." };
    }
  } else {
    const sid = input.storeId;
    if (!sid) {
      return { success: false, message: "Select a store, or enable platform-wide." };
    }
    const dup = await prisma.coupon.findFirst({
      where: { storeId: sid, code, isGlobal: false, NOT: { id: couponId } },
    });
    if (dup) {
      return { success: false, message: "That code already exists for this store." };
    }
  }

  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        isGlobal: input.isGlobal,
        storeId: input.isGlobal ? null : input.storeId,
        code,
        name: input.name.trim().slice(0, 120),
        discount,
        startDate,
        endDate,
        isActive: input.isActive,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, message: "Duplicate coupon code." };
    }
    return { success: false, message: "Could not update coupon." };
  }

  revalidatePath("/dashboard/admin/coupons");
  return { success: true };
}

export async function deleteAdminCoupon(couponId: string): Promise<{ success: boolean; message?: string }> {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, message: gate.message };

  try {
    await prisma.coupon.delete({ where: { id: couponId } });
  } catch {
    return { success: false, message: "Could not delete coupon." };
  }

  revalidatePath("/dashboard/admin/coupons");
  return { success: true };
}

export async function setAdminCouponActive(
  couponId: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string }> {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, message: gate.message };

  const u = await prisma.coupon.updateMany({
    where: { id: couponId },
    data: { isActive },
  });
  if (u.count === 0) {
    return { success: false, message: "Coupon not found." };
  }

  revalidatePath("/dashboard/admin/coupons");
  return { success: true };
}
