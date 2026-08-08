import { auth } from "@clerk/nextjs/server";
import type { OrderItemFulfillmentStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { updateOrderItemFulfillment } from "@/src/app/actions/seller-order.actions";
import { db } from "@/src/lib/db";
import { nextFulfillmentOptions } from "@/src/lib/order-fulfillment";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const orderStatusClass: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  PAYMENT_FAILED: "bg-red-500/10 text-red-700 border-red-500/20",
  PROCESSING: "bg-[#95CFB2]/10 text-blue-700 border-[#95CFB2]/20",
  SHIPPED: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  PARTIALLY_SHIPPED: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  DELIVERED: "bg-green-500/10 text-green-700 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  REFUNDED: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const fulfillmentClass: Record<string, string> = {
  PROCESSING: "bg-[#95CFB2]/10 text-blue-700 border-[#95CFB2]/20",
  SHIPPED: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-700 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
};

type StoreOrderGroup = {
  orderId: string;
  orderNumber: string;
  createdAt: Date;
  orderStatus: string;
  paymentStatus: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingZip: string;
  shippingCountry: string;
  orderTotal: number;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    size: string;
    quantity: number;
    subtotal: number;
    fulfillmentStatus: OrderItemFulfillmentStatus;
    trackingNumber: string | null;
  }>;
};

export default async function SellerStoreOrdersPage({
  params,
  searchParams,
}: {
  params: { storeUrl: string };
  searchParams?: { err?: string; saved?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const store = await db.store.findFirst({
    where: { url: params.storeUrl, userId },
    select: { id: true, name: true },
  });
  if (!store) {
    redirect("/dashboard/seller/stores");
  }

  const orderItems = await db.orderItem.findMany({
    where: { storeId: store.id },
    select: {
      id: true,
      productName: true,
      variantName: true,
      size: true,
      quantity: true,
      subtotal: true,
      fulfillmentStatus: true,
      trackingNumber: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          status: true,
          paymentStatus: true,
          shippingName: true,
          shippingAddress: true,
          shippingCity: true,
          shippingState: true,
          shippingZip: true,
          shippingCountry: true,
          total: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<string, StoreOrderGroup>();
  for (const item of orderItems) {
    const key = item.order.id;
    const existing = grouped.get(key);
    const line = {
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      size: item.size,
      quantity: item.quantity,
      subtotal: item.subtotal,
      fulfillmentStatus: item.fulfillmentStatus,
      trackingNumber: item.trackingNumber,
    };
    if (!existing) {
      grouped.set(key, {
        orderId: item.order.id,
        orderNumber: item.order.orderNumber,
        createdAt: item.order.createdAt,
        orderStatus: item.order.status,
        paymentStatus: item.order.paymentStatus,
        shippingName: item.order.shippingName,
        shippingAddress: item.order.shippingAddress,
        shippingCity: item.order.shippingCity,
        shippingState: item.order.shippingState,
        shippingZip: item.order.shippingZip,
        shippingCountry: item.order.shippingCountry,
        orderTotal: item.order.total,
        items: [line],
      });
      continue;
    }
    existing.items.push(line);
  }

  const orders = Array.from(grouped.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Your line items from{" "}
          <span className="font-medium text-foreground">{store.name}</span> only.
          Other sellers&apos; items on shared orders are not shown.
        </p>
      </div>

      {searchParams?.saved === "1" ? (
        <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-800">
          Fulfillment status updated.
        </p>
      ) : null}
      {searchParams?.err ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-800">
          {searchParams.err}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No orders yet for this store.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const storeRevenue = order.items.reduce((sum, i) => sum + i.subtotal, 0);
            const canFulfill = order.paymentStatus === "PAID";

            return (
              <Card key={order.orderId}>
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={orderStatusClass[order.orderStatus] ?? ""}
                      >
                        Order: {order.orderStatus.replaceAll("_", " ")}
                      </Badge>
                      <Badge variant="secondary">{order.paymentStatus}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{order.shippingName}</p>
                    <p>
                      {order.shippingAddress}, {order.shippingCity}
                      {order.shippingState ? `, ${order.shippingState}` : ""}{" "}
                      {order.shippingZip}, {order.shippingCountry}
                    </p>
                    <p className="mt-1">
                      Your revenue: {currency.format(storeRevenue)} · Order total:{" "}
                      {currency.format(order.orderTotal)}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item) => {
                    const options = nextFulfillmentOptions(item.fulfillmentStatus);
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border p-3 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.variantName} · {item.size} · Qty {item.quantity}
                            </p>
                            <p className="text-sm">{currency.format(item.subtotal)}</p>
                            {item.trackingNumber ? (
                              <p className="text-xs text-muted-foreground">
                                Tracking: {item.trackingNumber}
                              </p>
                            ) : null}
                          </div>
                          <Badge
                            variant="outline"
                            className={fulfillmentClass[item.fulfillmentStatus] ?? ""}
                          >
                            {item.fulfillmentStatus.replaceAll("_", " ")}
                          </Badge>
                        </div>

                        {!canFulfill ? (
                          <p className="text-xs text-muted-foreground">
                            Available after payment is confirmed
                          </p>
                        ) : options.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No further updates</p>
                        ) : (
                          <form
                            action={updateOrderItemFulfillment}
                            className="flex flex-wrap items-end gap-2"
                          >
                            <input type="hidden" name="storeUrl" value={params.storeUrl} />
                            <input type="hidden" name="orderItemId" value={item.id} />
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground" htmlFor={`status-${item.id}`}>
                                New status
                              </label>
                              <select
                                id={`status-${item.id}`}
                                name="status"
                                defaultValue={options[0]}
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                              >
                                {options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt.replaceAll("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {options.includes("SHIPPED") ? (
                              <div className="space-y-1">
                                <label
                                  className="text-xs text-muted-foreground"
                                  htmlFor={`track-${item.id}`}
                                >
                                  Tracking (optional, when shipping)
                                </label>
                                <input
                                  id={`track-${item.id}`}
                                  name="trackingNumber"
                                  type="text"
                                  placeholder="Tracking number"
                                  className="h-9 rounded-md border bg-background px-2 text-sm"
                                />
                              </div>
                            ) : null}
                            <Button type="submit" size="sm" variant="secondary">
                              Update
                            </Button>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
