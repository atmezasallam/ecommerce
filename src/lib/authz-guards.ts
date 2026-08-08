import { isPlatformAdmin } from "@/src/lib/admin-access";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Reject update when the store is not owned by the caller (admins may bypass). */
export function assertCanUpdateStore(args: {
  storeId: string;
  storeOwnerUserId: string;
  callerUserId: string;
  dbRole: string | null | undefined;
  clerkPrivateRole: unknown;
}): void {
  const admin = isPlatformAdmin(args.dbRole, args.clerkPrivateRole);
  if (admin) return;
  if (args.storeOwnerUserId === args.callerUserId) return;

  console.error("[authz] upsertStore denied", {
    userId: args.callerUserId,
    storeId: args.storeId,
    storeOwnerUserId: args.storeOwnerUserId,
  });
  throw new AuthorizationError(
    "Unauthorized: you can only update a store you own."
  );
}

/** Reject product update when product is not in the store identified by storeUrl. */
export function assertProductBelongsToStore(args: {
  productId: string;
  productStoreId: string;
  routeStoreId: string;
  callerUserId: string;
  storeUrl: string;
}): void {
  if (args.productStoreId === args.routeStoreId) return;

  console.error("[authz] upsertProduct denied", {
    userId: args.callerUserId,
    productId: args.productId,
    productStoreId: args.productStoreId,
    routeStoreId: args.routeStoreId,
    storeUrl: args.storeUrl,
  });
  throw new AuthorizationError(
    "Unauthorized: product does not belong to this store."
  );
}

const CLIENT_MONETARY_KEYS = [
  "deliveryPrice",
  "shippingTotal",
  "taxTotal",
  "discountTotal",
  "subtotal",
  "total",
  "amount",
  "price",
  "fee",
  "shippingFee",
  "extraShippingFee",
] as const;

/** Reject payloads that include any client-supplied monetary field. */
export function assertNoClientMonetaryFields(
  payload: Record<string, unknown>,
  context: { userId?: string }
): void {
  const present = CLIENT_MONETARY_KEYS.filter((key) => {
    const value = payload[key];
    return value !== undefined && value !== null;
  });
  if (present.length === 0) return;

  console.error("[authz] client monetary fields rejected", {
    userId: context.userId,
    fields: present,
  });
  throw new AuthorizationError(
    `Client must not supply monetary fields: ${present.join(", ")}. Prices are computed server-side.`
  );
}

export type ShippingRateFees = {
  shippingFeePerItem: number;
  shippingFeeForAdditionalItem: number;
  shippingFeePerKg: number;
  shippingFeeFixed: number;
};

export type ShippingLineInput = {
  quantity: number;
  weight: number;
  shippingFeeMethod: "ITEM" | "WEIGHT" | "FIXED";
  fees: ShippingRateFees;
};

/** Pure fee math for one cart line (mirrors product shipping methods). */
export function lineShippingFee(line: ShippingLineInput): number {
  const { quantity, weight, shippingFeeMethod, fees } = line;
  if (quantity <= 0) return 0;

  switch (shippingFeeMethod) {
    case "ITEM":
      return (
        fees.shippingFeePerItem +
        Math.max(0, quantity - 1) * fees.shippingFeeForAdditionalItem
      );
    case "WEIGHT":
      return weight * quantity * fees.shippingFeePerKg;
    case "FIXED":
      return fees.shippingFeeFixed;
    default:
      return 0;
  }
}

export function sumShippingFees(lines: ShippingLineInput[]): number {
  return lines.reduce((acc, line) => acc + lineShippingFee(line), 0);
}

/** Seller may only update OrderItems that belong to a store they own. Call per item. */
export function assertOrderItemOwnedBySeller(args: {
  orderItemId: string;
  itemStoreId: string;
  ownedStoreId: string;
  callerUserId: string;
}): void {
  if (args.itemStoreId === args.ownedStoreId) return;

  console.error("[authz] order item fulfillment denied", {
    userId: args.callerUserId,
    orderItemId: args.orderItemId,
    itemStoreId: args.itemStoreId,
    ownedStoreId: args.ownedStoreId,
  });
  throw new AuthorizationError(
    "Unauthorized: you can only update fulfillment for your own store's items."
  );
}

