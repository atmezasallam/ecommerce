
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Box,
  PackageCheck,
  ShoppingCart,
  Store as StoreIcon,
} from "lucide-react";

import { db } from "@/src/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatOrderStatus(status: string): string {
  return status.replaceAll("_", " ");
}

const statusClass: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  PAYMENT_FAILED: "bg-red-500/10 text-red-700 border-red-500/20",
  PROCESSING: "bg-[#95CFB2]/10 text-blue-700 border-[#95CFB2]/20",
  SHIPPED: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  PARTIALLY_SHIPPED: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  DELIVERED: "bg-green-500/10 text-green-700 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  REFUNDED: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

export default async function SellerStorePage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const store = await db.store.findFirst({
    where: { url: params.storeUrl, userId },
    select: { id: true, name: true, status: true },
  });
  if (!store) {
    redirect("/dashboard/seller/stores");
  }

  const [orderItems, storeProducts] = await Promise.all([
    db.orderItem.findMany({
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
            total: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      where: { storeId: store.id },
      select: {
        id: true,
        name: true,
        sales: true,
        variants: {
          select: {
            id: true,
            variantName: true,
            sizes: {
              select: {
                id: true,
                size: true,
                quantity: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const orderMap = new Map<
    string,
    {
      id: string;
      orderNumber: string;
      createdAt: Date;
      shippingName: string;
      status: string;
      paymentStatus: string;
      orderTotal: number;
      storeRevenue: number;
      lineCount: number;
      quantity: number;
    }
  >();

  let totalSales = 0;
  let totalUnitsSold = 0;

  for (const item of orderItems as Array<{
    quantity: number;
    subtotal: number;
    createdAt: Date;
    order: {
      id: string;
      orderNumber: string;
      createdAt: Date;
      status: string;
      paymentStatus: string;
      shippingName: string;
      total: number;
    };
  }>) {
    totalSales += item.subtotal;
    totalUnitsSold += item.quantity;
    const current = orderMap.get(item.order.id);
    if (!current) {
      orderMap.set(item.order.id, {
        id: item.order.id,
        orderNumber: item.order.orderNumber,
        createdAt: item.order.createdAt,
        shippingName: item.order.shippingName,
        status: item.order.status,
        paymentStatus: item.order.paymentStatus,
        orderTotal: item.order.total,
        storeRevenue: item.subtotal,
        lineCount: 1,
        quantity: item.quantity,
      });
      continue;
    }
    current.storeRevenue += item.subtotal;
    current.lineCount += 1;
    current.quantity += item.quantity;
  }

  const allOrders = Array.from(orderMap.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const recentOrders = allOrders.slice(0, 8);
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((order) =>
    ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "PARTIALLY_SHIPPED"].includes(order.status)
  ).length;

  const lowStockRows = storeProducts
    .flatMap((product) =>
      product.variants.flatMap((variant) =>
        variant.sizes
          .filter((size) => size.quantity < 5)
          .map((size) => ({
            productId: product.id,
            productName: product.name,
            variantName: variant.variantName,
            size: size.size,
            qty: size.quantity,
          }))
      )
    )
    .sort((a, b) => a.qty - b.qty)
    .slice(0, 8);

  const dailyRevenue = new Map<string, number>();
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    dailyRevenue.set(day.toISOString().slice(0, 10), 0);
  }

  for (const item of orderItems as Array<{ createdAt: Date; subtotal: number }>) {
    const key = item.createdAt.toISOString().slice(0, 10);
    if (dailyRevenue.has(key)) {
      dailyRevenue.set(key, (dailyRevenue.get(key) ?? 0) + item.subtotal);
    }
  }

  const revenueSeries = Array.from(dailyRevenue.entries()).map(([date, value]) => ({
    date,
    label: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value,
  }));
  const maxRevenueValue = Math.max(...revenueSeries.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <StoreIcon className="h-6 w-6" />
            {store.name}
          </h1>
          <p className="text-muted-foreground">
            Store overview dashboard for <span className="font-medium text-foreground">{params.storeUrl}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{store.status}</Badge>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/seller/stores/${params.storeUrl}/settings`}>
              Store Settings <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{money.format(totalSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{totalOrders}</p>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{pendingOrders}</p>
            <PackageCheck className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Units Sold</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{totalUnitsSold}</p>
            <Box className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueSeries.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">{day.label}</span>
                  <div className="h-2 flex-1 rounded bg-muted">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${(day.value / maxRevenueValue) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs font-medium">
                    {money.format(day.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/dashboard/seller/stores/${params.storeUrl}/products/new`}>+ Add Product</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/dashboard/seller/stores/${params.storeUrl}/orders`}>View Orders</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/dashboard/seller/stores/${params.storeUrl}/coupons`}>Create Coupon</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/dashboard/seller/stores/${params.storeUrl}/shipping`}>Update Shipping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/dashboard/seller/stores/${params.storeUrl}/orders`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                No orders yet for this store.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.shippingName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass[order.status] ?? ""}>
                          {formatOrderStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {money.format(order.storeRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Great! No low-stock variants right now.</p>
            ) : (
              <div className="space-y-3">
                {lowStockRows.map((row) => (
                  <div
                    key={`${row.productId}-${row.variantName}-${row.size}`}
                    className="rounded-md border p-3"
                  >
                    <p className="line-clamp-1 text-sm font-medium">{row.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.variantName} • {row.size}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-orange-600">Qty left: {row.qty}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

