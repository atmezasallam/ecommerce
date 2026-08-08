import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { PackageCheck, Receipt, ShoppingCart, Wallet } from "lucide-react";

import { db } from "@/src/lib/db";
import { isPlatformAdmin } from "@/src/lib/admin-access";
import { updateOrderStatus } from "@/src/app/actions/admin-order.actions";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

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

const paymentClass: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  PAID: "bg-green-500/10 text-green-700 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-700 border-red-500/20",
  REFUNDED: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const PAGE_SIZE = 50;

const formatDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const [dbUser, clerkUser] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
    currentUser(),
  ]);

  if (!isPlatformAdmin(dbUser?.role, clerkUser?.privateMetadata?.role)) {
    redirect("/");
  }

  const currentPage = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const getCachedAdminOrdersPage = unstable_cache(
    async () =>
      db.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
    ["admin-orders-list", String(currentPage), String(PAGE_SIZE)],
    { revalidate: 30, tags: ["admin:orders"] }
  );

  const [orders, totalOrders, processingOrders, deliveredOrders, revenue] = await Promise.all([
    getCachedAdminOrdersPage(),
    db.order.count(),
    db.order.count({
      where: {
        status: { in: ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "PARTIALLY_SHIPPED"] },
      },
    }),
    db.order.count({
      where: { status: "DELIVERED" },
    }),
    db.order.aggregate({
      _sum: { total: true },
    }),
  ]);

  const rows = orders as Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: Date | string;
    user: { name: string; email: string };
    items: Array<{ quantity: number }>;
  }>;
  const totalRevenue = revenue._sum.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Review and manage all marketplace orders.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{totalOrders}</p>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{processingOrders}</p>
            <PackageCheck className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{deliveredOrders}</p>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{currency.format(totalRevenue)}</p>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status Update</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((order) => {
                    const qty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{order.user.name}</span>
                            <span className="text-xs text-muted-foreground">{order.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusClass[order.status] ?? ""}>
                            {order.status.replaceAll("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentClass[order.paymentStatus] ?? ""}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{qty}</TableCell>
                        <TableCell className="text-right font-medium">{currency.format(order.total)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <form action={updateOrderStatus} className="flex items-center gap-2">
                            <input type="hidden" name="orderId" value={order.id} />
                            <select
                              name="status"
                              defaultValue={order.status}
                              className="h-9 rounded-md border bg-background px-2 text-sm"
                            >
                              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                              <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="PARTIALLY_SHIPPED">PARTIALLY_SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                              <option value="REFUNDED">REFUNDED</option>
                            </select>
                            <Button type="submit" size="sm" variant="secondary">
                              Save
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/admin/stores`}>View Stores</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" disabled={!hasPrev}>
                    <Link href={hasPrev ? `/dashboard/admin/orders?page=${currentPage - 1}` : "#"}>
                      Previous
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" disabled={!hasNext}>
                    <Link href={hasNext ? `/dashboard/admin/orders?page=${currentPage + 1}` : "#"}>
                      Next
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
