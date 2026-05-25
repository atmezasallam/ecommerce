import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: AppPrismaClient | undefined;
}

/**
 * Cart / wishlist / shipping-address delegates are used in `src/queries/user.ts` but may be
 * absent from the checked-in Prisma schema. Treat them as loosely typed so the rest of Prisma
 * stays fully typed.
 */
type AppPrismaClient = PrismaClient & {
  cart: any;
  cartItem: any;
  shippingAddress: any;
  wishlist: any;
  order: any;
  orderGroup: any;
  orderItem: any;
};

export const db: AppPrismaClient = (globalThis.prisma ||
  new PrismaClient()) as AppPrismaClient;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;