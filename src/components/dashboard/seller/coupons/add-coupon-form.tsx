"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createSellerCoupon } from "@/src/app/actions/seller-coupon.actions";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useToast } from "@/src/components/ui/use-toast";

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type AddCouponFormProps = {
  storeUrl: string;
};

export default function AddCouponForm({ storeUrl }: AddCouponFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("10");
  const [start, setStart] = useState(() => toDatetimeLocalValue(new Date()));
  const [end, setEnd] = useState(() => {
    const e = new Date();
    e.setDate(e.getDate() + 30);
    return toDatetimeLocalValue(e);
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSellerCoupon(storeUrl, {
        code,
        name,
        discount: Number(discount),
        startDateIso: new Date(start).toISOString(),
        endDateIso: new Date(end).toISOString(),
      });
      if (res.success) {
        toast({ title: "Coupon created", description: "Shoppers can use this code at checkout." });
        setCode("");
        setName("");
        setDiscount("10");
        router.refresh();
      } else {
        toast({
          title: "Could not create coupon",
          description: res.message ?? "Try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add coupon</CardTitle>
        <CardDescription>
          Percentage discount for this store. Codes are unique per store and are not case-sensitive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Code</Label>
            <Input
              id="coupon-code"
              placeholder="e.g. SAVE10"
              value={code}
              onChange={(ev) => setCode(ev.target.value.toUpperCase())}
              maxLength={40}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-name">Label (optional)</Label>
            <Input
              id="coupon-name"
              placeholder="Internal note"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-discount">Discount %</Label>
            <Input
              id="coupon-discount"
              type="number"
              min={1}
              max={100}
              step={1}
              value={discount}
              onChange={(ev) => setDiscount(ev.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-start">Starts</Label>
            <Input
              id="coupon-start"
              type="datetime-local"
              value={start}
              onChange={(ev) => setStart(ev.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-end">Ends</Label>
            <Input
              id="coupon-end"
              type="datetime-local"
              value={end}
              onChange={(ev) => setEnd(ev.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
              {pending ? "Saving…" : "Create coupon"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
