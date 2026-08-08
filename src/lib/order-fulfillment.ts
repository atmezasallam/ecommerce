import type { OrderItemFulfillmentStatus, OrderStatus } from "@prisma/client";

import { AuthorizationError } from "@/src/lib/authz-guards";

const ALLOWED_TRANSITIONS: Record<
  OrderItemFulfillmentStatus,
  readonly OrderItemFulfillmentStatus[]
> = {
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function assertValidFulfillmentTransition(
  from: OrderItemFulfillmentStatus,
  to: OrderItemFulfillmentStatus,
  context: { userId: string; orderItemId: string }
): void {
  if (from === to) {
    console.error("[fulfillment] no-op transition rejected", context);
    throw new AuthorizationError(`Item is already ${from}.`);
  }
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    console.error("[fulfillment] invalid transition", {
      ...context,
      from,
      to,
    });
    throw new AuthorizationError(
      `Invalid fulfillment transition: ${from} → ${to}. Allowed: ${allowed.join(", ") || "none"}.`
    );
  }
}

export function assertTrackingNumberAllowed(
  to: OrderItemFulfillmentStatus,
  trackingNumber: string | null | undefined,
  context: { userId: string; orderItemId: string }
): void {
  const hasTracking =
    typeof trackingNumber === "string" && trackingNumber.trim().length > 0;
  if (!hasTracking) return;
  if (to === "SHIPPED") return;

  console.error("[fulfillment] trackingNumber rejected", {
    ...context,
    to,
  });
  throw new AuthorizationError(
    "trackingNumber can only be set when moving an item to SHIPPED."
  );
}

/** Derive Order.status from item fulfillment statuses (seller never sets Order.status). */
export function deriveOrderStatusFromItems(
  statuses: readonly OrderItemFulfillmentStatus[]
): Extract<
  OrderStatus,
  "PROCESSING" | "PARTIALLY_SHIPPED" | "DELIVERED" | "CANCELLED"
> {
  if (statuses.length === 0) return "PROCESSING";

  if (statuses.every((s) => s === "DELIVERED")) return "DELIVERED";
  if (statuses.every((s) => s === "CANCELLED")) return "CANCELLED";
  if (
    statuses.some((s) => s === "SHIPPED") &&
    !statuses.every((s) => s === "DELIVERED")
  ) {
    return "PARTIALLY_SHIPPED";
  }
  return "PROCESSING";
}

export function nextFulfillmentOptions(
  current: OrderItemFulfillmentStatus
): OrderItemFulfillmentStatus[] {
  return [...ALLOWED_TRANSITIONS[current]];
}
