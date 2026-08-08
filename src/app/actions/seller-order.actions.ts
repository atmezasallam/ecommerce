"use server";

import { auth } from "@clerk/nextjs/server";
import type { OrderItemFulfillmentStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import {
  assertOrderItemOwnedBySeller,
  AuthorizationError,
} from "@/src/lib/authz-guards";
import {
  assertTrackingNumberAllowed,
  assertValidFulfillmentTransition,
  deriveOrderStatusFromItems,
} from "@/src/lib/order-fulfillment";

const FULFILLMENT_STATUSES: OrderItemFulfillmentStatus[] = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function isFulfillmentStatus(value: unknown): value is OrderItemFulfillmentStatus {
  return (
    typeof value === "string" &&
    FULFILLMENT_STATUSES.includes(value as OrderItemFulfillmentStatus)
  );
}

/**
 * Update one OrderItem's fulfillment status for the seller's own store.
 * Order.status is re-derived from all items after the update.
 */
export async function updateOrderItemFulfillment(formData: FormData): Promise<void> {
  const { userId } = await auth();
  const storeUrl = formData.get("storeUrl");
  const orderItemId = formData.get("orderItemId");
  const status = formData.get("status");
  const trackingRaw = formData.get("trackingNumber");

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

  if (typeof orderItemId !== "string" || orderItemId.length === 0) {
    redirect(`${ordersPath}?err=${encodeURIComponent("Missing order item id.")}`);
  }

  if (!isFulfillmentStatus(status)) {
    redirect(`${ordersPath}?err=${encodeURIComponent("Invalid fulfillment status.")}`);
  }

  const trackingNumber =
    typeof trackingRaw === "string" && trackingRaw.trim().length > 0
      ? trackingRaw.trim()
      : null;

  const store = await prisma.store.findFirst({
    where: { url: storeUrl, userId },
    select: { id: true },
  });

  if (!store) {
    redirect("/dashboard/seller/stores?err=Store+not+found");
  }

  try {
    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: {
        id: true,
        storeId: true,
        orderId: true,
        fulfillmentStatus: true,
        order: { select: { paymentStatus: true, status: true } },
      },
    });

    if (!item) {
      redirect(`${ordersPath}?err=${encodeURIComponent("Order item not found.")}`);
    }

    assertOrderItemOwnedBySeller({
      orderItemId: item.id,
      itemStoreId: item.storeId,
      ownedStoreId: store.id,
      callerUserId: userId,
    });

    if (item.order.paymentStatus !== "PAID") {
      redirect(
        `${ordersPath}?err=${encodeURIComponent("Fulfillment updates require a paid order.")}`
      );
    }

    assertValidFulfillmentTransition(item.fulfillmentStatus, status, {
      userId,
      orderItemId: item.id,
    });
    assertTrackingNumberAllowed(status, trackingNumber, {
      userId,
      orderItemId: item.id,
    });

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: item.id },
        data: {
          fulfillmentStatus: status,
          fulfillmentUpdatedAt: new Date(),
          ...(status === "SHIPPED" && trackingNumber
            ? { trackingNumber }
            : {}),
        },
      });

      const siblings = await tx.orderItem.findMany({
        where: { orderId: item.orderId },
        select: { fulfillmentStatus: true },
      });

      const derived = deriveOrderStatusFromItems(
        siblings.map((s) => s.fulfillmentStatus)
      );

      await tx.order.update({
        where: { id: item.orderId },
        data: { status: derived },
      });
    });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    const message =
      error instanceof AuthorizationError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to update fulfillment.";
    redirect(`${ordersPath}?err=${encodeURIComponent(message)}`);
  }

  redirect(`${ordersPath}?saved=1`);
}
