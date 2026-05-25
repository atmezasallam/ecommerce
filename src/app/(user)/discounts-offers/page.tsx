import Link from "next/link";
import { Gift, Sparkles, Tag, Ticket, Users } from "lucide-react";
import { AccountBreadcrumbs } from "@/src/components/user/account-breadcrumbs";
import { AccountPageHero } from "@/src/components/user/account-page-hero";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const offers = [
  {
    title: "New user bonus",
    description: "10% off your first qualifying order when promotions are active.",
    icon: Sparkles,
    cta: "Shop deals",
    href: "/",
    gradient: "from-violet-500/20 via-background to-background",
  },
  {
    title: "Refer a friend",
    description: "Earn $5 in Salamo credit for each successful referral (program launching soon).",
    icon: Users,
    cta: "Learn more",
    href: "/help-center/account",
    gradient: "from-sky-500/20 via-background to-background",
  },
  {
    title: "Seasonal sale",
    description: "Check the storefront for limited-time markdowns from independent sellers.",
    icon: Gift,
    cta: "Explore",
    href: "/",
    gradient: "from-amber-500/20 via-background to-background",
  },
] as const;

export default function DiscountsOffersPage() {
  return (
    <>
      <AccountBreadcrumbs pageName="Discounts & Offers" />
      <AccountPageHero
        icon={Tag}
        title="Discounts & Offers"
        subtitle="Coupons, loyalty progress, and featured ways to save on Salamo."
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Ticket className="h-6 w-6 text-primary" />
            Active coupons
          </CardTitle>
          <CardDescription>Automatically apply eligible codes at checkout in a future release.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Ticket className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No coupons yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Shop now to earn exclusive discounts as we roll out personalized offers.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Explore deals</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Loyalty points</CardTitle>
          <CardDescription>Track progress toward rewards as the loyalty program goes live.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-4xl font-bold tracking-tight text-foreground">0 pts</p>
            <p className="text-sm text-muted-foreground">Current balance</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next level</span>
              <span className="text-muted-foreground">500 pts</span>
            </div>
            <Progress value={4} className="h-2" />
            <p className="text-xs text-muted-foreground">You&apos;re just getting started — keep shopping to climb tiers.</p>
          </div>
          <Accordion type="single" collapsible className="w-full border-t pt-2">
            <AccordionItem value="earn">
              <AccordionTrigger>How to earn points</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Earn points on eligible purchases, referrals, and profile milestones. Multipliers may apply during
                campaigns. Full rules will be published before points have cash value.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Special offers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map(({ title, description, icon: Icon, cta, href, gradient }) => (
            <Card
              key={title}
              className={`overflow-hidden border-0 bg-gradient-to-br shadow-md ${gradient}`}
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={href}>{cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
