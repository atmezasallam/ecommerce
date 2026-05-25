import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Package,
  ShoppingBag,
  Store as StoreIcon,
  Users,
} from "lucide-react";

import { db } from "@/src/lib/db";
import { isPlatformAdmin } from "@/src/lib/admin-access";
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

const storeStatusClass: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  ACTIVE: "bg-green-500/10 text-green-700 border-green-500/20",
  BANNED: "bg-red-500/10 text-red-700 border-red-500/20",
  DISABLED: "bg-base/10 text-subtle border-border/20",
};

const orderStatusClass: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  PAYMENT_FAILED: "bg-red-500/10 text-red-700 border-red-500/20",
  PROCESSING: "bg-[#95CFB2]/10 text-blue-700 border-[#95CFB2]/20",
  SHIPPED: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-700 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  REFUNDED: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const getCachedAdminDashboardData = unstable_cache(
  async () => {
    const [usersCount, totalStores, activeStores, stores, productsCount, orders, pendingStores] =
      await Promise.all([
        db.user.count(),
        db.store.count(),
        db.store.count({ where: { status: "ACTIVE" } }),
        db.store.findMany({
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        db.product.count(),
        db.order.findMany({
          include: { items: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        db.store.findMany({
          where: { status: "PENDING" },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
          take: 6,
        }),
      ]);

    return {
      usersCount,
      totalStores,
      activeStores,
      stores,
      productsCount,
      orders,
      pendingStores,
    };
  },
  ["admin-dashboard-data"],
  { revalidate: 30, tags: ["admin:dashboard", "admin:stores", "admin:orders"] }
);

export default async function AdminDashboardPage() {
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

  const { usersCount, totalStores, activeStores, stores, productsCount, orders, pendingStores } =
    await getCachedAdminDashboardData();

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and moderation controls.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link
              href="/dashboard/admin/stores"
              className="group transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#95CFB2]/20 active:translate-y-0"
            >
              Review Stores
              <ArrowUpRight className="ml-1 h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="/dashboard/admin/coupons"
              className="transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#95CFB2]/30 active:translate-y-0"
            >
              Manage Coupons
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Users</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{usersCount}</p>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Stores (latest 8)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{totalStores}</p>
            <StoreIcon className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Stores</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{activeStores}</p>
            <BadgeCheck className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Products</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{productsCount}</p>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Recent Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">{currency.format(totalRevenue)}</p>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/orders">View all orders</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                No orders yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={orderStatusClass[order.status] ?? ""}>
                          {order.status.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{order.items.length}</TableCell>
                      <TableCell className="text-right font-medium">{currency.format(order.total)}</TableCell>
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
              Pending Store Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingStores.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending stores right now.</p>
            ) : (
              <div className="space-y-3">
                {pendingStores.map((store) => (
                  <div key={store.id} className="rounded-md border p-3">
                    <p className="font-medium">{store.name}</p>
                    <p className="text-xs text-muted-foreground">{store.user.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="outline" className={storeStatusClass[store.status] ?? ""}>
                        {store.status}
                      </Badge>
                      <Button asChild size="sm" variant="secondary">
                        <Link href="/dashboard/admin/stores">Review</Link>
                      </Button>
                    </div>
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