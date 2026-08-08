import { AuthorizationError } from "@/src/lib/authz-guards";

/**
 * Seller dashboards load stores with `{ url: storeUrl, userId }`.
 * A manipulated storeUrl that belongs to another seller yields null — treat as deny.
 */
export function assertSellerOwnsStoreByUrl(args: {
  storeUrl: string;
  store: { id: string; userId: string } | null;
  callerUserId: string;
}): asserts args is {
  storeUrl: string;
  store: { id: string; userId: string };
  callerUserId: string;
} {
  if (args.store && args.store.userId === args.callerUserId) return;

  console.error("[authz] storeUrl access denied", {
    userId: args.callerUserId,
    storeUrl: args.storeUrl,
    foundOwner: args.store?.userId ?? null,
  });
  throw new AuthorizationError(
    "Unauthorized: you do not own a store at this URL."
  );
}
