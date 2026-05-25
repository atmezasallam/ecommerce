import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { PrintPageButton } from "@/src/components/user/print-page-button";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

const toc = [
  { id: "overview", label: "Overview" },
  { id: "eligibility", label: "Eligibility for Returns" },
  { id: "how-to", label: "How to Request a Return" },
  { id: "timeline", label: "Refund Timeline" },
  { id: "non-returnable", label: "Non-Returnable Items" },
  { id: "seller-policies", label: "Seller-Specific Policies" },
  { id: "contact", label: "Contact Support" },
] as const;

export default function RefundPolicyPage() {
  return (
    <>
      <AccountBreadcrumbs pageName="Return & Refund Policy" />
      <AccountPageHero
        icon={RefreshCcw}
        title="Return & Refund Policy"
        subtitle="How returns, exchanges, and refunds work across Salamo sellers."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Last updated: March 28, 2026</p>
        <div className="flex flex-wrap gap-2">
          <PrintPageButton />
          <Button asChild size="sm">
            <Link href="/dispute-resolution">Start a return / dispute</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="sticky top-24 space-y-1 rounded-xl border bg-card p-4 text-sm shadow-sm">
            <p className="mb-2 font-semibold text-foreground">On this page</p>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-10 lg:col-span-3">
          <Card id="overview" className="scroll-mt-28">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">1. Overview</h2>
              <p>
                Salamo is a multi-vendor marketplace. Each seller sets their own return window and conditions within
                Salamo&apos;s baseline rules. This policy explains how the process works and how refunds are
                coordinated.
              </p>
            </CardContent>
          </Card>

          <Card id="eligibility" className="scroll-mt-28">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">2. Eligibility for Returns</h2>
              <p>
                Items are generally eligible for return if they are unused, in original packaging, and returned
                within the seller&apos;s stated window. Custom or personalized goods may be excluded unless
                defective.
              </p>
            </CardContent>
          </Card>

          <Card id="how-to" className="scroll-mt-28">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">3. How to Request a Return</h2>
              <p>
                Open your order in Salamo and follow the seller&apos;s return flow. You may need to provide photos
                if the item arrived damaged or incorrect. Keep proof of shipment when you send items back.
              </p>
            </CardContent>
          </Card>

          <Card id="timeline" className="scroll-mt-28">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">4. Refund Timeline</h2>
              <p>
                After the seller or Salamo confirms receipt and condition, refunds are initiated to your original
                payment method. Banks may take several additional business days to post the credit.
              </p>
            </CardContent>
          </Card>

          <Card id="non-returnable" className="scroll-mt-28">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">5. Non-Returnable Items</h2>
              <p>
                Categories such as digital goods, perishables, hygiene products, or clearance items marked
                &quot;final sale&quot; may not be returnable. Always check the product page before purchasing.
              </p>
            </CardContent>
          </Card>

          <Card id="seller-policies" className="scroll-mt-28">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">6. Seller-Specific Policies</h2>
              <p>
                Sellers may offer extended warranties or stricter rules for certain SKUs. Where a seller policy
                conflicts with mandatory consumer law, the law prevails.
              </p>
            </CardContent>
          </Card>

          <Card id="contact" className="scroll-mt-28">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">7. Contact Support</h2>
              <p>
                If you are stuck after contacting the seller, use{" "}
                <Link href="/dispute-resolution" className="font-medium text-primary underline">
                  Order Dispute Resolution
                </Link>{" "}
                or{" "}
                <Link href="/report-problem" className="font-medium text-primary underline">
                  Report a Problem
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
