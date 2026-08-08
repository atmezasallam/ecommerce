"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { CartItemFull } from "@/types/cart.types";
import {
  confirmOrder,
  createPaymentIntent,
  type ShippingFormData,
} from "@/src/app/actions/order.actions";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import CheckoutOrderSummary from "@/src/components/checkout/CheckoutOrderSummary";
import StripePaymentForm from "@/src/components/checkout/StripePaymentForm";

const shippingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  zipCode: z.string().min(3),
  country: z.string().min(2),
  saveAddress: z.boolean(),
});

type ShippingFormSchema = z.infer<typeof shippingSchema>;

type DeliveryOption = {
  id: "standard" | "express" | "next_day";
  name: string;
  description: string;
  price: number;
};

type UserData = {
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
};

type CheckoutPageClientProps = {
  cart: { items: CartItemFull[] };
  user: UserData;
};

const deliveryOptions: DeliveryOption[] = [
  { id: "standard", name: "Standard Delivery", description: "5-7 business days", price: 0 },
  { id: "express", name: "Express Delivery", description: "2-3 business days", price: 9.99 },
  { id: "next_day", name: "Next Day Delivery", description: "Next business day", price: 19.99 },
];

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Japan",
  "Australia",
  "United Arab Emirates",
];

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const calcFinalPrice = (price: number, discount: number) => price - (price * discount) / 100;

export default function CheckoutPageClient({ cart, user }: CheckoutPageClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [delivery, setDelivery] = useState<DeliveryOption>(deliveryOptions[0]!);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  const form = useForm<ShippingFormSchema>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      email: user.emailAddresses[0]?.emailAddress ?? "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      saveAddress: false,
    },
  });

  const subtotal = useMemo(
    () =>
      cart.items.reduce((acc, item) => {
        return acc + calcFinalPrice(item.size.price, item.size.discount) * item.quantity;
      }, 0),
    [cart.items]
  );
  const taxTotal = useMemo(() => subtotal * 0.08, [subtotal]);
  const total = useMemo(() => subtotal + delivery.price + taxTotal, [subtotal, delivery.price, taxTotal]);

  const totals = {
    subtotal,
    shippingTotal: delivery.price,
    taxTotal,
    total,
  };

  async function continueToDelivery() {
    const valid = await form.trigger();
    if (!valid) return;
    setStep(2);
  }

  async function continueToPayment() {
    const valid = await form.trigger();
    if (!valid) {
      setStep(1);
      return;
    }

    setStep(3);
    setIsLoadingIntent(true);

    const payload: ShippingFormData = {
      ...form.getValues(),
      deliveryMethod: delivery.id,
    };

    try {
      const intent = await createPaymentIntent(payload);
      setClientSecret(intent.clientSecret);
      setPaymentIntentId(intent.paymentIntentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start payment.";
      toast.error(message);
      setStep(2);
    } finally {
      setIsLoadingIntent(false);
    }
  }

  async function handlePaymentSuccess(intentId: string) {
    try {
      const result = await confirmOrder(intentId);
      toast.success(`Order ${result.orderNumber} confirmed`);
      router.push(`/checkout/success?payment_intent=${intentId}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm order.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
              {[
                { id: 1, label: "Address" },
                { id: 2, label: "Delivery" },
                { id: 3, label: "Payment" },
              ].map((item) => {
                const active = step >= item.id;
                return (
                  <div key={item.id} className="space-y-1">
                    <p className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
                      {item.id}. {item.label}
                    </p>
                    <div className={`h-1 rounded-full ${active ? "bg-primary" : "bg-muted"}`} />
                  </div>
                );
              })}
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...form.register("fullName")} />
                    {form.formState.errors.fullName && (
                      <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" {...form.register("email")} />
                      {form.formState.errors.email && (
                        <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...form.register("phone")} />
                      {form.formState.errors.phone && (
                        <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" {...form.register("address")} />
                    {form.formState.errors.address && (
                      <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...form.register("city")} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...form.register("state")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input id="zipCode" {...form.register("zipCode")} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Country</Label>
                      <Select
                        value={form.watch("country")}
                        onValueChange={(value) => form.setValue("country", value, { shouldValidate: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.watch("saveAddress")}
                      onCheckedChange={(checked) =>
                        form.setValue("saveAddress", Boolean(checked), { shouldValidate: true })
                      }
                    />
                    Save this address
                  </label>
                  <Button type="button" onClick={continueToDelivery}>
                    Continue to Delivery
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <RadioGroup
                    value={delivery.id}
                    onValueChange={(value) => {
                      const selected = deliveryOptions.find((option) => option.id === value);
                      if (selected) setDelivery(selected);
                    }}
                  >
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.id}
                        htmlFor={option.id}
                        className={`block cursor-pointer rounded-xl border p-4 transition ${
                          delivery.id === option.id ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem id={option.id} value={option.id} />
                          <div className="flex w-full items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                            <p className="font-semibold">{option.price === 0 ? "FREE" : formatter.format(option.price)}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="button" onClick={continueToPayment}>
                      Continue to Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                  </div>
                  {isLoadingIntent && <p className="text-sm text-muted-foreground">Preparing secure payment...</p>}
                  {!isLoadingIntent && clientSecret && paymentIntentId && (
                    <StripePaymentForm clientSecret={clientSecret} total={total} onSuccess={handlePaymentSuccess} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <CheckoutOrderSummary cart={cart} totals={totals} currentStep={step} />
      </div>
    </div>
  );
}
