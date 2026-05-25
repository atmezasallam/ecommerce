"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma";

type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user || user.privateMetadata?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const orderId = formData.get("orderId");
  const status = formData.get("status");

  if (typeof orderId !== "string" || orderId.length === 0) {
    throw new Error("Missing order id");
  }
  if (
    status !== "PENDING_PAYMENT" &&
    status !== "PAYMENT_FAILED" &&
    status !== "PROCESSING" &&
    status !== "SHIPPED" &&
    status !== "DELIVERED" &&
    status !== "CANCELLED" &&
    status !== "REFUNDED"
  ) {
    throw new Error("Invalid status");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  revalidatePath("/dashboard/admin/orders");
  revalidatePath("/dashboard/admin");
  revalidateTag("admin:orders");
  revalidateTag("admin:dashboard");
}
