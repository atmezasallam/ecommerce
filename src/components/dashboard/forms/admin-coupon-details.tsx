"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  createAdminCoupon,
  updateAdminCoupon,
} from "@/src/app/actions/admin-coupon.actions";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type StoreOption = { id: string; name: string; url: string };

type CouponRow = {
  id: string;
  code: string;
  name: string;
  discount: number;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  isGlobal: boolean;
  storeId: string | null;
  store: StoreOption | null;
};

type AdminCouponDetailsProps = {
  stores: StoreOption[];
  coupon?: CouponRow | null;
};

export default function AdminCouponDetails({ stores, coupon }: AdminCouponDetailsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(coupon);

  /** New coupons default to platform-wide (all products) unless the admin turns it off. */
  const [isGlobal, setIsGlobal] = useState(coupon?.isGlobal ?? true);
  const [storeId, setStoreId] = useState(coupon?.storeId ?? stores[0]?.id ?? "");
  const [code, setCode] = useState(coupon?.code ?? "");
  const [name, setName] = useState(coupon?.name ?? "");
  const [discount, setDiscount] = useState(coupon ? String(coupon.discount) : "10");
  const [start, setStart] = useState(() =>
    coupon ? toDatetimeLocalValue(new Date(coupon.startDate)) : toDatetimeLocalValue(new Date())
  );
  const [end, setEnd] = useState(() => {
    if (coupon) return toDatetimeLocalValue(new Date(coupon.endDate));
    const e = new Date();
    e.setDate(e.getDate() + 30);
    return toDatetimeLocalValue(e);
  });
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);

  useEffect(() => {
    if (coupon) {
      setIsGlobal(coupon.isGlobal);
      setStoreId(coupon.storeId ?? stores[0]?.id ?? "");
      setCode(coupon.code);
      setName(coupon.name);
      setDiscount(String(coupon.discount));
      setStart(toDatetimeLocalValue(new Date(coupon.startDate)));
      setEnd(toDatetimeLocalValue(new Date(coupon.endDate)));
      setIsActive(coupon.isActive);
    }
  }, [coupon, stores]);

  /** When there are no stores, only platform-wide is possible for new codes; when editing, follow saved coupon. */
  const scopeGlobal = stores.length === 0 ? (coupon?.isGlobal ?? true) : isGlobal;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeGlobal && !storeId) {
      toast.error("Select a store", { description: "Or enable platform-wide coupon." });
      return;
    }
    startTransition(async () => {
      if (isEdit && coupon) {
        const res = await updateAdminCoupon(coupon.id, {
          isGlobal: scopeGlobal,
          storeId: scopeGlobal ? null : storeId,
          code,
          name,
          discount: Number(discount),
          startDateIso: new Date(start).toISOString(),
          endDateIso: new Date(end).toISOString(),
          isActive,
        });
        if (res.success) {
          toast.success("Discount updated");
          router.push("/dashboard/admin/coupons");
          router.refresh();
        } else {
          toast.error("Error", { description: res.message });
        }
        return;
      }

      const res = await createAdminCoupon({
        isGlobal: scopeGlobal,
        storeId: scopeGlobal ? null : storeId,
        code,
        name,
        discount: Number(discount),
        startDateIso: new Date(start).toISOString(),
        endDateIso: new Date(end).toISOString(),
        isActive,
      });
      if (res.success) {
        toast.success("Coupon created");
        router.push("/dashboard/admin/coupons");
        router.refresh();
      } else {
        toast.error("Error", { description: res.message });
      }
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit coupon" : "Create coupon"}</CardTitle>
        <CardDescription>
          A <strong>coupon</strong> is a code shoppers enter at checkout. Set the <strong>percent off</strong> and
          dates. Turn on <strong>Platform-wide</strong> so the code applies to <strong>all products</strong> (every
          seller); turn it off to tie the code to one store only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="global">Platform-wide (all products &amp; stores)</Label>
              <p className="text-xs text-muted-foreground">
                When on, no store is required — the coupon applies to the entire cart subtotal.
              </p>
              {stores.length === 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  There are no seller stores yet — you can only create platform-wide coupons.
                </p>
              )}
            </div>
            <Switch
              id="global"
              checked={scopeGlobal}
              onCheckedChange={setIsGlobal}
              disabled={stores.length === 0}
            />
          </div>

          {!scopeGlobal && (
            <div className="space-y-2">
              <Label htmlFor="store">Store</Label>
              <Select value={storeId} onValueChange={setStoreId} required>
                <SelectTrigger id="store">
                  <SelectValue placeholder="Choose a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={40}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Percent off (%)</Label>
              <Input
                id="discount"
                type="number"
                min={1}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                {scopeGlobal
                  ? "This coupon reduces the cart subtotal across all sellers (all products)."
                  : "This coupon reduces only that seller's lines in the cart."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Label (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Starts</Label>
              <Input
                id="start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Ends</Label>
              <Input
                id="end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active</Label>
              <p className="text-xs text-muted-foreground">Inactive codes cannot be applied at checkout.</p>
            </div>
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create coupon"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
