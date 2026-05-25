import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/src/lib/db";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

type SellerOrderRow = {
  orderId: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  paymentStatus: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingZip: string;
  shippingCountry: string;
  quantity: number;
  storeSubtotal: number;
  orderTotal: number;
  itemsCount: number;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const statusClass: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  PAYMENT_FAILED: "bg-red-500/10 text-red-700 border-red-500/20",
  PROCESSING: "bg-[#95CFB2]/10 text-blue-700 border-[#95CFB2]/20",
  SHIPPED: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-700 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  REFUNDED: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

export default async function SellerStoreOrdersPage({
  params,
}: {
  params: { storeUrl: string };
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
    include: {
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

  const grouped = new Map<string, SellerOrderRow>();
  for (const item of orderItems as Array<{
    id: string;
    quantity: number;
    subtotal: number;
    order: {
      id: string;
      orderNumber: string;
      createdAt: Date;
      status: string;
      paymentStatus: string;
      shippingName: string;
      shippingAddress: string;
      shippingCity: string;
      shippingState: string | null;
      shippingZip: string;
      shippingCountry: string;
      total: number;
    };
  }>) {
    const key = item.order.id;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        orderId: item.order.id,
        orderNumber: item.order.orderNumber,
        createdAt: item.order.createdAt,
        status: item.order.status,
        paymentStatus: item.order.paymentStatus,
        shippingName: item.order.shippingName,
        shippingAddress: item.order.shippingAddress,
        shippingCity: item.order.shippingCity,
        shippingState: item.order.shippingState,
        shippingZip: item.order.shippingZip,
        shippingCountry: item.order.shippingCountry,
        quantity: item.quantity,
        storeSubtotal: item.subtotal,
        orderTotal: item.order.total,
        itemsCount: 1,
      });
      continue;
    }

    existing.quantity += item.quantity;
    existing.storeSubtotal += item.subtotal;
    existing.itemsCount += 1;
  }

  const orders = Array.from(grouped.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Orders containing products from <span className="font-medium text-foreground">{store.name}</span>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No orders yet for this store.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Shipping Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Store Revenue</TableHead>
                  <TableHead className="text-right">Order Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.shippingName}</span>
                        <span className="text-xs text-muted-foreground">{order.shippingCountry}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.shippingAddress}</span>
                        <span className="text-xs text-muted-foreground">
                          {order.shippingCity}
                          {order.shippingState ? `, ${order.shippingState}` : ""} {order.shippingZip}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[order.status] ?? ""}>
                        {order.status.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.itemsCount} lines / {order.quantity} qty
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currency.format(order.storeSubtotal)}
                    </TableCell>
                    <TableCell className="text-right">{currency.format(order.orderTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
