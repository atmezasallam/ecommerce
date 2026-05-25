import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { getOrders } from "@/src/app/actions/order.actions";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const statusColor: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
  PAYMENT_FAILED: "bg-red-500/15 text-red-600 border-red-500/20",
  PROCESSING: "bg-[#95CFB2]/15 text-[#95CFB2] border-[#95CFB2]/20",
  SHIPPED: "bg-purple-500/15 text-purple-600 border-purple-500/20",
  DELIVERED: "bg-green-500/15 text-green-600 border-green-500/20",
  CANCELLED: "bg-red-500/15 text-red-600 border-red-500/20",
  REFUNDED: "bg-orange-500/15 text-orange-600 border-orange-500/20",
};

export default async function OrdersPage() {
  const orders = (await getOrders()) as Array<{
    id: string;
    orderNumber: string;
    createdAt: Date;
    status: string;
    total: number;
    items: Array<{ id: string; variantImage: string; productName: string }>;
  }>;

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-3 text-xl font-semibold">No orders yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Start shopping to place your first order.</p>
        <Button asChild className="mt-4">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">{order.orderNumber}</CardTitle>
              <Badge variant="outline" className={statusColor[order.status] ?? ""}>
                {order.status.replaceAll("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{order.createdAt.toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {order.items.slice(0, 5).map((item) => (
                <div key={item.id} className="relative h-10 w-10 overflow-hidden rounded-full border">
                  <Image src={item.variantImage} alt={item.productName} fill className="object-cover" sizes="40px" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{formatter.format(order.total)}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href={`/profile/orders/${order.id}`}>View Details</Link>
                </Button>
                {order.status === "SHIPPED" && (
                  <Button size="sm" variant="outline">
                    Track Order
                  </Button>
                )}
                {order.status === "DELIVERED" && (
                  <Button size="sm" variant="outline">
                    Leave Review
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
