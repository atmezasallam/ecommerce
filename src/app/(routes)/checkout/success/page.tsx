import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { confirmOrder } from "@/src/app/actions/order.actions";
import CheckoutSuccessClient from "@/src/components/checkout/CheckoutSuccessClient";

type SuccessPageProps = {
  searchParams: { payment_intent?: string };
};

type SuccessOrder = {
  orderNumber: string;
  createdAt: Date;
  total: number;
  items: Array<{ quantity: number; storeId: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const paymentIntentId = searchParams.payment_intent;
  if (!paymentIntentId) redirect("/cart");

  const confirmed = await confirmOrder(paymentIntentId);
  const order = (await prisma.order.findFirst({
    where: {
      id: confirmed.orderId,
      userId,
    },
    include: { items: true },
  })) as unknown as SuccessOrder | null;

  if (!order) redirect("/profile/orders");

  const sellerCount = new Set(order.items.map((item) => item.storeId)).size;
  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen px-4">
      <CheckoutSuccessClient
        orderNumber={order.orderNumber}
        date={order.createdAt.toLocaleDateString()}
        total={order.total}
        itemCount={itemCount}
        sellerCount={sellerCount}
      />
    </div>
  );
}
