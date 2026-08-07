"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

type SellerOrderStatus = "PROCESSING" | "SHIPPED" | "DELIVERED";

const SELLER_ORDER_STATUSES: SellerOrderStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED"];

function isSellerOrderStatus(value: unknown): value is SellerOrderStatus {
  return typeof value === "string" && SELLER_ORDER_STATUSES.includes(value as SellerOrderStatus);
}

export async function updateSellerOrderStatus(formData: FormData): Promise<void> {
  const { userId } = await auth();
  const storeUrl = formData.get("storeUrl");
  const orderId = formData.get("orderId");
  const status = formData.get("status");

  const ordersPath =
    typeof storeUrl === "string" && storeUrl.length > 0
      ? `/dashboard/seller/stores/${storeUrl}/orders`
      : "/dashboard/seller/stores";

  if (!userId) {
    redirect(`${ordersPath}?err=${encodeURIComponent("You must be signed in.")}`);
  }

  if (typeof storeUrl !== "string" || storeUrl.length === 0) {
    redirect("/dashboard/seller/stores?err=Missing+store");
  }

  if (typeof orderId !== "string" || orderId.length === 0) {
    redirect(`${ordersPath}?err=${encodeURIComponent("Missing order id.")}`);
  }

  if (!isSellerOrderStatus(status)) {
    redirect(`${ordersPath}?err=${encodeURIComponent("Invalid status.")}`);
  }

  const store = await prisma.store.findFirst({
    where: { url: storeUrl, userId },
    select: { id: true },
  });

  if (!store) {
    redirect("/dashboard/seller/stores?err=Store+not+found");
  }

  const orderItem = await prisma.orderItem.findFirst({
    where: { orderId, storeId: store.id },
    select: { id: true },
  });

  if (!orderItem) {
    redirect(`${ordersPath}?err=${encodeURIComponent("Order not found for this store.")}`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath(ordersPath);
  revalidatePath(`/dashboard/seller/stores/${storeUrl}`);
  redirect(`${ordersPath}?saved=1`);
}
