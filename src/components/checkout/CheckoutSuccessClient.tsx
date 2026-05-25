"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

type CheckoutSuccessClientProps = {
  orderNumber: string;
  date: string;
  total: number;
  itemCount: number;
  sellerCount: number;
};

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function CheckoutSuccessClient({
  orderNumber,
  date,
  total,
  itemCount,
  sellerCount,
}: CheckoutSuccessClientProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
      }}
      className="mx-auto max-w-lg py-16 text-center"
    >
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1 } }}
        className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-green-100 text-green-600"
      >
        <Check className="h-10 w-10" />
      </motion.div>

      <motion.h1 variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="text-3xl font-bold">
        Order Confirmed! 🎉
      </motion.h1>
      <motion.p variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-2 text-muted-foreground">
        Thank you for your purchase.
      </motion.p>

      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-6">
        <Card>
          <CardContent className="space-y-2 pt-6 text-left">
            <p>
              Order Number: <span className="font-bold">{orderNumber}</span>
            </p>
            <p>Date: {date}</p>
            <p>Total: {formatter.format(total)}</p>
            <p>Status: Processing</p>
            <p className="text-sm text-muted-foreground">Estimated delivery: 5-7 business days</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.p variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-4 text-sm text-muted-foreground">
        {itemCount} items from {sellerCount} sellers
      </motion.p>

      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-6 grid grid-cols-3 gap-3 text-xs">
        <div className="rounded-md border p-2">📧 Confirmation email sent</div>
        <div className="rounded-md border p-2">📦 Seller notified</div>
        <div className="rounded-md border p-2">🚚 Tracking coming soon</div>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-8 flex flex-col gap-3">
        <Button asChild>
          <Link href="/profile/orders">View My Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
