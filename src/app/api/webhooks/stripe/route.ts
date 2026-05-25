import Stripe from "stripe";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { confirmOrder } from "@/src/app/actions/order.actions";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Stripe webhook verification failed:", error);
    return new Response("Webhook error", { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await confirmOrder(intent.id);
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.order.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: {
          status: "PAYMENT_FAILED",
          paymentStatus: "FAILED",
        },
      });
    }
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
