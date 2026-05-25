import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { getCart } from "@/src/app/actions/cart.actions";
import CheckoutPageClient from "@/src/components/checkout/CheckoutPageClient";

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [cart, clerkUser] = await Promise.all([getCart(), currentUser()]);

  if (!cart.items.length) {
    redirect("/cart");
  }

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const subtotal = cart.items.reduce((acc, item) => {
    const finalPrice = item.size.price - (item.size.price * item.size.discount) / 100;
    return acc + finalPrice * item.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-base py-8 dark:bg-base">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Salamo
          </Link>
          <p className="text-sm text-muted-foreground">Estimated total: ${total.toFixed(2)}</p>
        </div>
        <CheckoutPageClient
          cart={{ items: cart.items }}
          user={{
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            emailAddresses: clerkUser.emailAddresses.map((email) => ({
              emailAddress: email.emailAddress,
            })),
          }}
        />
      </div>
    </div>
  );
}
