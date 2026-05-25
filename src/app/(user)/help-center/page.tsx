import Link from "next/link";
import {
  HelpCircle,
  Package,
  CreditCard,
  RefreshCcw,
  Store,
  Shield,
  Smartphone,
  Search,
} from "lucide-react";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const categories = [
  {
    href: "/help-center/orders",
    title: "Orders & Shipping",
    description: "Track packages, delivery windows, and shipping fees across sellers.",
    icon: Package,
  },
  {
    href: "/help-center/payments",
    title: "Payments & Billing",
    description: "Cards, receipts, failed charges, and how Salamo protects your payment.",
    icon: CreditCard,
  },
  {
    href: "/help-center/returns",
    title: "Returns & Refunds",
    description: "Start a return, understand timelines, and when sellers can approve refunds.",
    icon: RefreshCcw,
  },
  {
    href: "/help-center/seller",
    title: "Seller Support",
    description: "Policies, performance, and tools for growing your storefront on Salamo.",
    icon: Store,
  },
  {
    href: "/help-center/account",
    title: "Account & Security",
    description: "Sign-in, passwords, two-step verification, and keeping your account safe.",
    icon: Shield,
  },
  {
    href: "/help-center/technical",
    title: "App & Technical",
    description: "Troubleshooting, browsers, notifications, and reporting bugs.",
    icon: Smartphone,
  },
] as const;

export default function HelpCenterPage() {
  return (
    <>
      <AccountBreadcrumbs pageName="Help Center" />
      <AccountPageHero
        icon={HelpCircle}
        title="Help Center"
        subtitle="Find answers about shopping, selling, and your Salamo account."
      />

      <div className="mx-auto mb-10 max-w-2xl">
        <label className="sr-only" htmlFor="help-search">
          Search help articles
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="help-search"
            className="h-12 rounded-xl pl-11 text-base shadow-sm"
            placeholder="Search for help…"
            disabled
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Search is coming soon — browse topics below.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group block h-full">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary group-hover:underline">View articles</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Frequently asked questions</CardTitle>
          <CardDescription>Quick answers to common questions from Salamo shoppers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="1">
              <AccordionTrigger>How long does delivery usually take?</AccordionTrigger>
              <AccordionContent>
                Delivery times depend on each seller&apos;s shipping settings and your location. You&apos;ll see an
                estimated range at checkout and in your order details.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger>Can I cancel an order after placing it?</AccordionTrigger>
              <AccordionContent>
                If the seller has not shipped yet, you may be able to cancel from your orders page. Otherwise,
                you can request a return according to the seller&apos;s policy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger>How do refunds work on Salamo?</AccordionTrigger>
              <AccordionContent>
                Refunds are issued by the seller or Salamo support after a return or dispute is approved. Funds
                typically return to your original payment method within several business days.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4">
              <AccordionTrigger>Is my payment information safe?</AccordionTrigger>
              <AccordionContent>
                Salamo uses industry-standard encryption and trusted payment partners. Full card details are never
                stored on Salamo servers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="5">
              <AccordionTrigger>How do I contact a seller?</AccordionTrigger>
              <AccordionContent>
                Open the product or order page and use the messaging or support options provided. For unresolved
                issues, you can open a dispute from your account.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/30 p-8 text-center">
        <p className="text-lg font-medium">Still need help?</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Tell us what went wrong and we&apos;ll route your request to the right team.
        </p>
        <Button asChild>
          <Link href="/report-problem">Contact us</Link>
        </Button>
      </div>
    </>
  );
}
