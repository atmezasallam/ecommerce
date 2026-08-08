import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderById } from "@/src/app/actions/order.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { stripe } from "@/lib/stripe";

type OrderDetailPageProps = {
  params: { orderId: string };
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const timeline = ["Order Placed", "Payment Confirmed", "Processing", "Shipped", "Delivered"] as const;
const stepByStatus: Record<string, number> = {
  PENDING_PAYMENT: 1,
  PAYMENT_FAILED: 1,
  PROCESSING: 3,
  SHIPPED: 4,
  PARTIALLY_SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 1,
  REFUNDED: 5,
};

const fulfillmentClass: Record<string, string> = {
  PROCESSING: "bg-[#95CFB2]/15 text-[#95CFB2] border-[#95CFB2]/20",
  SHIPPED: "bg-purple-500/15 text-purple-600 border-purple-500/20",
  DELIVERED: "bg-green-500/15 text-green-600 border-green-500/20",
  CANCELLED: "bg-red-500/15 text-red-600 border-red-500/20",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  let order: {
    id: string;
    status: string;
    orderNumber: string;
    createdAt: Date;
    shippingName: string;
    shippingEmail: string;
    shippingPhone: string | null;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string | null;
    shippingZip: string;
    shippingCountry: string;
    paymentStatus: string;
    paymentMethod: string | null;
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
    stripePaymentIntentId: string | null;
    items: Array<{
      id: string;
      storeId: string;
      storeName: string;
      variantImage: string;
      productName: string;
      variantName: string;
      size: string;
      quantity: number;
      subtotal: number;
      fulfillmentStatus: string;
      trackingNumber: string | null;
    }>;
  };
  try {
    order = (await getOrderById(params.orderId)) as typeof order;
  } catch {
    notFound();
  }

  const groups = order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
    if (!acc[item.storeId]) acc[item.storeId] = [];
    acc[item.storeId]!.push(item);
    return acc;
  }, {});

  let paymentLast4: string | null = null;
  if (order.stripePaymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (typeof intent.latest_charge === "string" && intent.latest_charge.length > 0) {
      const charge = await stripe.charges.retrieve(intent.latest_charge);
      paymentLast4 = charge.payment_method_details?.card?.last4 ?? null;
    }
  }

  const reachedStep = stepByStatus[order.status] ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{order.createdAt.toLocaleString()}</p>
        </div>
        <Badge variant="outline">{order.status.replaceAll("_", " ")}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {timeline.map((label, index) => {
              const completed = index + 1 <= reachedStep;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`h-5 w-5 rounded-full border ${
                      completed ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  />
                  <p className={completed ? "text-sm font-medium" : "text-sm text-muted-foreground"}>{label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {Object.entries(groups).map(([storeId, items]) => (
        <Card key={storeId}>
          <CardHeader>
            <CardTitle className="text-lg">{items[0]?.storeName ?? "Store"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 border-b pb-3 last:border-b-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                  <Image src={item.variantImage} alt={item.productName} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.variantName} • {item.size}
                  </p>
                  <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={fulfillmentClass[item.fulfillmentStatus] ?? ""}
                    >
                      {item.fulfillmentStatus.replaceAll("_", " ")}
                    </Badge>
                    {item.trackingNumber ? (
                      <span className="text-xs text-muted-foreground">
                        Tracking: {item.trackingNumber}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="font-semibold">{currency.format(item.subtotal)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.shippingName}</p>
            <p>{order.shippingEmail}</p>
            {order.shippingPhone && <p>{order.shippingPhone}</p>}
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}, {order.shippingState ?? "-"} {order.shippingZip}
            </p>
            <p>{order.shippingCountry}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment & Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Payment status: {order.paymentStatus}</p>
            <p>Method: {order.paymentMethod ?? "card"}</p>
            <p>Card last 4: {paymentLast4 ?? "N/A"}</p>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency.format(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{currency.format(order.shippingTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{currency.format(order.taxTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{currency.format(order.discountTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{currency.format(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" asChild>
        <Link href="/profile/orders">Back to orders</Link>
      </Button>
    </div>
  );
}
