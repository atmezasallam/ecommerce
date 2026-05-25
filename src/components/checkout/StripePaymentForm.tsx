"use client";

import { FormEvent, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type StripePaymentFormProps = {
  clientSecret: string;
  total: number;
  onSuccess: (paymentIntentId: string) => Promise<void> | void;
};

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function StripePaymentInner({ total, onSuccess }: Omit<StripePaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    if (result.paymentIntent?.id) {
      await onSuccess(result.paymentIntent.id);
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800">Test Mode - Use these card details:</p>
          <div className="mt-2 space-y-1 font-mono text-sm text-blue-700">
            <p>Card: 4242 4242 4242 4242</p>
            <p>Expiry: Any future date (e.g. 12/34)</p>
            <p>CVV: Any 3 digits (e.g. 123)</p>
            <p>ZIP: Any 5 digits (e.g. 12345)</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border p-4">
        <PaymentElement />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={sameAsShipping} onCheckedChange={(checked) => setSameAsShipping(Boolean(checked))} />
        Billing address same as shipping
      </label>

      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Total to pay</span>
          <span className="text-lg font-semibold">{formatter.format(total)}</span>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!stripe || isSubmitting}>
        {isSubmitting ? "Processing..." : `Pay ${formatter.format(total)}`}
      </Button>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, total, onSuccess }: StripePaymentFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#95CFB2",
            borderRadius: "12px",
            fontFamily: "inherit",
          },
        },
      }}
    >
      <StripePaymentInner total={total} onSuccess={onSuccess} />
    </Elements>
  );
}
