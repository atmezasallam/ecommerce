"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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
  deliveryMethod?: "standard" | "express" | "next_day";
  deliveryPrice?: number;
};

type CartCoupon = {
  discount: number;
  isGlobal: boolean;
  storeId: string | null;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
};

type CartCheckoutItem = {
  productId: string;
  variantId: string;
  sizeId: string;
  storeId: string;
  quantity: number;
  product: { name: string; store: { name: string } };
  variant: { variantName: string; variantImage: string; sku: string; colors: Array<{ name: string }> };
  size: { size: string; price: number; discount: number; quantity: number };
};

type CartWithCheckoutItems = {
  id: string;
  userId: string;
  items: CartCheckoutItem[];
  coupon: CartCoupon | null;
};

const calcFinalPrice = (price: number, discount: number) => price - (price * discount) / 100;

const isCouponActive = (coupon: {
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  isGlobal: boolean;
  storeId: string | null;
}) => {
  const now = new Date();
  return coupon.isActive && coupon.startDate <= now && coupon.endDate >= now;
};

const calculateCartTotals = (
  items: Array<{ storeId: string; quantity: number; size: { price: number; discount: number } }>,
  coupon?: CartCoupon | null,
  shippingTotal = 0
) => {
  const subtotal = items.reduce((acc, item) => {
    return acc + calcFinalPrice(item.size.price, item.size.discount) * item.quantity;
  }, 0);

  let discountTotal = 0;
  if (coupon && isCouponActive(coupon)) {
    const eligibleSubtotal = coupon.isGlobal
      ? subtotal
      : items
          .filter((item) => item.storeId === coupon.storeId)
          .reduce((acc, item) => acc + calcFinalPrice(item.size.price, item.size.discount) * item.quantity, 0);
    discountTotal = (eligibleSubtotal * coupon.discount) / 100;
  }

  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const taxTotal = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shippingTotal + taxTotal;

  return { subtotal, discountTotal, shippingTotal, taxTotal, total };
};

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

export async function createPaymentIntent(shippingData: ShippingFormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      coupon: true,
      items: {
        include: {
          product: { include: { store: true } },
          variant: { include: { colors: true, images: true } },
          size: true,
        },
      },
    },
  });

  const typedCart = cart as unknown as CartWithCheckoutItems | null;
  if (!typedCart || typedCart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  for (const item of typedCart.items) {
    if (item.quantity > item.size.quantity) {
      throw new Error(`Insufficient stock for ${item.product.name} (${item.variant.variantName}).`);
    }
  }

  const shippingTotal = shippingData.deliveryPrice ?? 0;
  const totals = calculateCartTotals(typedCart.items, typedCart.coupon, shippingTotal);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totals.total * 100),
    currency: "usd",
    metadata: {
      userId,
      cartId: typedCart.id,
      shippingData: JSON.stringify(shippingData),
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
    return { success: true, orderNumber: existingOrder.orderNumber, orderId: existingOrder.id };
  }

  const userId = intent.metadata.userId;
  const cartId = intent.metadata.cartId;
  if (!userId || !cartId) {
    throw new Error("Payment metadata is incomplete.");
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      coupon: true,
      items: {
        include: {
          product: { include: { store: true } },
          variant: { include: { colors: true } },
          size: true,
        },
      },
    },
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
  const shippingTotal = shippingData.deliveryPrice ?? 0;
  const totals = calculateCartTotals(typedCart.items, typedCart.coupon, shippingTotal);
  const orderNumber = await generateOrderNumber();

  const charge = typeof intent.latest_charge === "string" && intent.latest_charge.length > 0
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
      product: {
        update: (args: { where: { id: string }; data: { sales: { increment: number } } }) => Promise<unknown>;
      };
      productVariant: {
        update: (args: { where: { id: string }; data: { sales: { increment: number } } }) => Promise<unknown>;
      };
      order: {
        create: (args: { data: unknown; include: { items: true } }) => Promise<{ id: string; orderNumber: string }>;
      };
      cartItem: { deleteMany: (args: { where: { cartId: string } }) => Promise<unknown> };
      cart: { update: (args: { where: { id: string }; data: { couponId: null } }) => Promise<unknown> };
    };

    for (const item of typedCart.items) {
      const updated = await transaction.size.updateMany({
        where: { id: item.sizeId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`Insufficient stock for ${item.product.name}.`);
      }
    }

    await Promise.all(
      typedCart.items.map((item) =>
        transaction.product.update({
          where: { id: item.productId },
          data: { sales: { increment: item.quantity } },
        })
      )
    );
    await Promise.all(
      typedCart.items.map((item) =>
        transaction.productVariant.update({
          where: { id: item.variantId },
          data: { sales: { increment: item.quantity } },
        })
      )
    );

    const order = await transaction.order.create({
      data: {
        orderNumber,
        userId,
        stripePaymentIntentId: intent.id,
        stripeSessionId: null,
        paymentStatus: "PAID",
        paymentMethod,
        subtotal: totals.subtotal,
        shippingTotal: totals.shippingTotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        total: totals.total,
        currency: "USD",
        shippingName: shippingData.fullName,
        shippingEmail: shippingData.email,
        shippingPhone: shippingData.phone,
        shippingAddress: shippingData.address,
        shippingCity: shippingData.city,
        shippingState: shippingData.state,
        shippingZip: shippingData.zipCode,
        shippingCountry: shippingData.country,
        status: "PROCESSING",
        items: {
          create: typedCart.items.map((item) => {
            const finalPrice = calcFinalPrice(item.size.price, item.size.discount);
            const colorName = item.variant.colors[0]?.name ?? null;
            return {
              productId: item.productId,
              variantId: item.variantId,
              sizeId: item.sizeId,
              storeId: item.storeId,
              productName: item.product.name,
              variantName: item.variant.variantName,
              variantImage: item.variant.variantImage,
              size: item.size.size,
              color: colorName,
              sku: item.variant.sku,
              price: finalPrice,
              originalPrice: item.size.price,
              discount: item.size.discount,
              quantity: item.quantity,
              subtotal: finalPrice * item.quantity,
              storeName: item.product.store.name,
              storeId_: item.storeId,
            };
          }),
        },
      },
      include: { items: true },
    });

    await transaction.cartItem.deleteMany({
      where: { cartId: typedCart.id },
    });
    await transaction.cart.update({
      where: { id: typedCart.id },
      data: { couponId: null },
    });

    return order;
  });

  revalidatePath("/cart");
  revalidatePath("/profile/orders");

  return { success: true, orderNumber: createdOrder.orderNumber, orderId: createdOrder.id };
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
    where: {
      id: orderId,
      userId,
    },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  return order;
}
