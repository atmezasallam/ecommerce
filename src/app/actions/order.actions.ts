"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  assertNoClientMonetaryFields,
  sumShippingFees,
  type ShippingLineInput,
  type ShippingRateFees,
} from "@/src/lib/authz-guards";
import {
  calcFinalPrice,
  calculateCartTotals,
  type CartCouponLike,
} from "@/src/lib/cart-money";
import { toStripeCents } from "@/src/lib/money";

export type ShippingFormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  saveAddress: boolean;
  /** Identifier only — never a price. */
  deliveryMethod?: "standard" | "express" | "next_day";
  countryId?: string;
};

type CartCoupon = CartCouponLike;

type CartCheckoutItem = {
  productId: string;
  variantId: string;
  sizeId: string;
  storeId: string;
  quantity: number;
  product: {
    name: string;
    shippingFeeMethod: "ITEM" | "WEIGHT" | "FIXED";
    store: {
      name: string;
      defaultShippingFeePerItem: number;
      defaultShippingFeeForAdditionalItem: number;
      defaultShippingFeePerKg: number;
      defaultShippingFeeFixed: number;
    };
  };
  variant: {
    variantName: string;
    variantImage: string;
    sku: string;
    weight: number;
    colors: Array<{ name: string }>;
  };
  size: { size: string; price: number; discount: number; quantity: number };
};

type CartWithCheckoutItems = {
  id: string;
  userId: string;
  items: CartCheckoutItem[];
  coupon: CartCoupon | null;
};

async function resolveCountryId(
  shippingData: ShippingFormData
): Promise<string> {
  if (shippingData.countryId) {
    const byId = await prisma.country.findUnique({
      where: { id: shippingData.countryId },
      select: { id: true },
    });
    if (byId) return byId.id;
  }

  const byName = await prisma.country.findFirst({
    where: { name: shippingData.country },
    select: { id: true },
  });
  if (byName) return byName.id;

  throw new Error(
    `Shipping country not found: ${shippingData.country}. Choose a valid country.`
  );
}

function feesFromStoreDefaults(store: {
  defaultShippingFeePerItem: number;
  defaultShippingFeeForAdditionalItem: number;
  defaultShippingFeePerKg: number;
  defaultShippingFeeFixed: number;
}): ShippingRateFees {
  return {
    shippingFeePerItem: store.defaultShippingFeePerItem,
    shippingFeeForAdditionalItem: store.defaultShippingFeeForAdditionalItem,
    shippingFeePerKg: store.defaultShippingFeePerKg,
    shippingFeeFixed: store.defaultShippingFeeFixed,
  };
}

async function computeServerShippingTotal(
  items: CartCheckoutItem[],
  countryId: string
): Promise<number> {
  const storeIds = [...new Set(items.map((item) => item.storeId))];
  const rates = await prisma.shippingRate.findMany({
    where: { countryId, storeId: { in: storeIds } },
  });
  const rateByStore = new Map(rates.map((rate) => [rate.storeId, rate]));

  const lines: ShippingLineInput[] = items.map((item) => {
    const rate = rateByStore.get(item.storeId);
    const fees: ShippingRateFees = rate
      ? {
          shippingFeePerItem: rate.shippingFeePerItem,
          shippingFeeForAdditionalItem: rate.shippingFeeForAdditionalItem,
          shippingFeePerKg: rate.shippingFeePerKg,
          shippingFeeFixed: rate.shippingFeeFixed,
        }
      : feesFromStoreDefaults(item.product.store);

    return {
      quantity: item.quantity,
      weight: item.variant.weight ?? 0,
      shippingFeeMethod: item.product.shippingFeeMethod,
      fees,
    };
  });

  return sumShippingFees(lines);
}

function sanitizeShippingMetadata(shippingData: ShippingFormData): ShippingFormData {
  return {
    fullName: shippingData.fullName,
    email: shippingData.email,
    phone: shippingData.phone,
    address: shippingData.address,
    city: shippingData.city,
    state: shippingData.state,
    zipCode: shippingData.zipCode,
    country: shippingData.country,
    saveAddress: shippingData.saveAddress,
    deliveryMethod: shippingData.deliveryMethod,
    countryId: shippingData.countryId,
  };
}

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();

  while (true) {
    const randomFive = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SAL-${year}-${randomFive}`;
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });
    if (!existing) return orderNumber;
  }
}

const cartCheckoutInclude = {
  coupon: true,
  items: {
    include: {
      product: {
        include: {
          store: {
            select: {
              name: true,
              defaultShippingFeePerItem: true,
              defaultShippingFeeForAdditionalItem: true,
              defaultShippingFeePerKg: true,
              defaultShippingFeeFixed: true,
            },
          },
        },
      },
      variant: { include: { colors: true, images: true } },
      size: true,
    },
  },
} as const;

export async function createPaymentIntent(shippingData: ShippingFormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  assertNoClientMonetaryFields(
    shippingData as unknown as Record<string, unknown>,
    { userId }
  );

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartCheckoutInclude,
  });

  const typedCart = cart as unknown as CartWithCheckoutItems | null;
  if (!typedCart || typedCart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  for (const item of typedCart.items) {
    if (item.quantity > item.size.quantity) {
      throw new Error(
        `Insufficient stock for ${item.product.name} (${item.variant.variantName}).`
      );
    }
  }

  const countryId = await resolveCountryId(shippingData);
  const shippingTotal = await computeServerShippingTotal(typedCart.items, countryId);
  const totals = calculateCartTotals(typedCart.items, typedCart.coupon, shippingTotal);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeCents(totals.total),
    currency: "usd",
    metadata: {
      userId,
      cartId: typedCart.id,
      shippingData: JSON.stringify(
        sanitizeShippingMetadata({ ...shippingData, countryId })
      ),
    },
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    total: totals.total,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    shippingTotal: totals.shippingTotal,
    taxTotal: totals.taxTotal,
    paymentIntentId: paymentIntent.id,
  };
}

export async function confirmOrder(paymentIntentId: string) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") {
    throw new Error("Payment has not succeeded.");
  }

  const existingOrder = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { id: true, orderNumber: true },
  });
  if (existingOrder) {
    return {
      success: true,
      orderNumber: existingOrder.orderNumber,
      orderId: existingOrder.id,
    };
  }

  const userId = intent.metadata.userId;
  const cartId = intent.metadata.cartId;
  if (!userId || !cartId) {
    throw new Error("Payment metadata is incomplete.");
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: cartCheckoutInclude,
  });

  const typedCart = cart as unknown as CartWithCheckoutItems | null;
  if (!typedCart || typedCart.userId !== userId || typedCart.items.length === 0) {
    throw new Error("Cart no longer exists.");
  }

  for (const item of typedCart.items) {
    if (item.quantity > item.size.quantity) {
      throw new Error(`Stock changed for ${item.product.name}.`);
    }
  }

  const shippingDataRaw = intent.metadata.shippingData ?? "{}";
  const shippingData = JSON.parse(shippingDataRaw) as ShippingFormData;
  assertNoClientMonetaryFields(shippingData as unknown as Record<string, unknown>, {
    userId,
  });

  const countryId = await resolveCountryId(shippingData);
  const shippingTotal = await computeServerShippingTotal(typedCart.items, countryId);
  const totals = calculateCartTotals(typedCart.items, typedCart.coupon, shippingTotal);
  const orderNumber = await generateOrderNumber();

  const charge =
    typeof intent.latest_charge === "string" && intent.latest_charge.length > 0
      ? await stripe.charges.retrieve(intent.latest_charge)
      : null;
  const paymentMethod = charge?.payment_method_details?.type ?? "card";

  const createdOrder = await prisma.$transaction(async (tx) => {
    const transaction = tx as unknown as {
      size: {
        updateMany: (args: {
          where: { id: string; quantity: { gte: number } };
          data: { quantity: { decrement: number } };
        }) => Promise<{ count: number }>;
      };
      order: {
        create: (args: {
          data: Record<string, unknown>;
          select: { id: true; orderNumber: true };
        }) => Promise<{ id: string; orderNumber: string }>;
      };
      cartItem: { deleteMany: (args: { where: { cartId: string } }) => Promise<unknown> };
      cart: {
        update: (args: {
          where: { id: string };
          data: { couponId: null };
        }) => Promise<unknown>;
      };
    };

    for (const item of typedCart.items) {
      const stockUpdate = await transaction.size.updateMany({
        where: { id: item.sizeId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (stockUpdate.count === 0) {
        throw new Error(`Insufficient stock for ${item.product.name}.`);
      }
    }

    const order = await transaction.order.create({
      data: {
        orderNumber,
        userId,
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: "PAID",
        paymentMethod,
        subtotal: totals.subtotal,
        shippingTotal: totals.shippingTotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        total: totals.total,
        shippingName: shippingData.fullName,
        shippingEmail: shippingData.email,
        shippingPhone: shippingData.phone,
        shippingAddress: shippingData.address,
        shippingCity: shippingData.city,
        shippingState: shippingData.state ?? null,
        shippingZip: shippingData.zipCode,
        shippingCountry: shippingData.country,
        status: "PROCESSING",
        items: {
          create: typedCart.items.map((item) => {
            const finalPrice = calcFinalPrice(item.size.price, item.size.discount);
            return {
              productId: item.productId,
              variantId: item.variantId,
              sizeId: item.sizeId,
              storeId: item.storeId,
              storeId_: item.storeId,
              productName: item.product.name,
              variantName: item.variant.variantName,
              variantImage: item.variant.variantImage,
              size: item.size.size,
              color: item.variant.colors[0]?.name ?? null,
              sku: item.variant.sku,
              price: finalPrice,
              originalPrice: item.size.price,
              discount: item.size.discount,
              quantity: item.quantity,
              subtotal: finalPrice * item.quantity,
              storeName: item.product.store.name,
            };
          }),
        },
      },
      select: { id: true, orderNumber: true },
    });

    await transaction.cartItem.deleteMany({ where: { cartId: typedCart.id } });
    await transaction.cart.update({
      where: { id: typedCart.id },
      data: { couponId: null },
    });

    return order;
  });

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/profile/orders");
  revalidatePath(`/profile/orders/${createdOrder.id}`);

  return {
    success: true,
    orderNumber: createdOrder.orderNumber,
    orderId: createdOrder.id,
  };
}

export async function getOrders() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found.");
  return order;
}
