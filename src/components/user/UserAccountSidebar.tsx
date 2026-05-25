"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Flag,
  Heart,
  MessageSquare,
  HelpCircle,
  RefreshCcw,
  Scale,
  Settings,
  Shield,
  Store,
  Tag,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import MessageBadge from "@/src/components/messages/MessageBadge";

const navItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Wishlist", href: "/profile/wishlist", icon: Heart },
  { label: "Messages", href: "/profile/messages", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Become a Seller", href: "/become-a-seller", icon: Store },
  { label: "Help Center", href: "/help-center", icon: HelpCircle },
  { label: "Return & Refund Policy", href: "/refund-policy", icon: RefreshCcw },
  { label: "Legal & Privacy", href: "/legal-privacy", icon: Shield },
  { label: "Discounts & Offers", href: "/discounts-offers", icon: Tag },
  { label: "Order Dispute Resolution", href: "/dispute-resolution", icon: Scale },
  { label: "Report a Problem", href: "/report-problem", icon: Flag },
] as const;

type UserAccountSidebarProps = {
  dbRole: "USER" | "ADMIN" | "SELLER";
  hasStore?: boolean;
  becomeSellerAbsoluteUrl?: string;
  messageUnreadCount?: number;
};

function StoreStatusNotice({
  becomeSellerAbsoluteUrl,
}: {
  becomeSellerAbsoluteUrl: string;
}) {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-left text-sm">
      <p className="font-medium text-foreground">You already have a store</p>
      <p className="mt-1 text-muted-foreground">
        View your application and store details on the Become a Seller page:
      </p>
      <Link
        href="/become-a-seller"
        className="mt-2 block break-all font-mono text-xs text-primary underline underline-offset-2 hover:text-primary/90"
      >
        {becomeSellerAbsoluteUrl}
      </Link>
    </div>
  );
}

export function UserAccountSidebar({
  dbRole,
  hasStore = false,
  becomeSellerAbsoluteUrl = "",
  messageUnreadCount = 0,
}: UserAccountSidebarProps) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const isSeller = dbRole === "SELLER";
  const links = navItems.filter((item) => !(isSeller && item.href === "/become-a-seller"));

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
      "border-l-4 border-transparent",
      pathname === href || (href !== "/profile" && pathname.startsWith(href + "/"))
        ? "bg-[#95CFB2]/20 border-l-4 border-[#95CFB2] font-medium text-[#2d6b54]"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  const mobileTabClass = (href: string) =>
    cn(
      "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm whitespace-nowrap transition-colors",
      pathname === href || (href !== "/profile" && pathname.startsWith(href + "/"))
        ? "border-[#95CFB2] bg-[#95CFB2]/20 font-medium text-[#2d6b54]"
        : "border-transparent bg-muted/60 text-muted-foreground"
    );

  const initials =
    user?.firstName?.[0] ??
    user?.username?.[0] ??
    user?.primaryEmailAddress?.emailAddress?.[0] ??
    "?";

  return (
    <>
      {hasStore && becomeSellerAbsoluteUrl ? (
        <div className="lg:hidden -mx-4 mb-4 px-4">
          <StoreStatusNotice becomeSellerAbsoluteUrl={becomeSellerAbsoluteUrl} />
        </div>
      ) : null}

      <nav
        className="lg:hidden -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-thin"
        aria-label="Account navigation"
      >
        {isSeller && (
          <Link href="/dashboard/seller" className={mobileTabClass("/dashboard/seller")}>
            <Store className="h-4 w-4 shrink-0" />
            My Store
          </Link>
        )}
        {links.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={mobileTabClass(href)}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex max-w-[10rem] items-center gap-1.5 truncate">
              {label}
              {href === "/profile/messages" && <MessageBadge count={messageUnreadCount} />}
            </span>
          </Link>
        ))}
      </nav>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 border-2 border-border">
              {isLoaded && user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt="" />
              ) : null}
              <AvatarFallback className="text-lg font-medium">{initials.toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="mt-3 max-w-full truncate font-semibold">
              {isLoaded ? user?.fullName || user?.username || "Member" : "…"}
            </p>
            <p className="mt-0.5 max-w-full truncate text-xs text-muted-foreground">
              {isLoaded ? user?.primaryEmailAddress?.emailAddress ?? "" : ""}
            </p>
            <Badge
              className="mt-3"
              variant={isSeller ? "default" : "secondary"}
            >
              {isSeller ? "Seller" : "Member"}
            </Badge>
          </div>

          {hasStore && becomeSellerAbsoluteUrl ? (
            <StoreStatusNotice becomeSellerAbsoluteUrl={becomeSellerAbsoluteUrl} />
          ) : null}

          {isSeller && (
            <Link
              href="/dashboard/seller"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/dashboard/seller")
                  ? "bg-[#95CFB2]/20 border-l-4 border-[#95CFB2] text-[#2d6b54]"
                  : "border-l-4 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Store className="h-4 w-4 shrink-0" />
              My Store Dashboard
            </Link>
          )}

          <nav className="space-y-1" aria-label="Account sidebar">
            {links.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex flex-1 items-center justify-between gap-2 leading-snug">
                  {label}
                  {href === "/profile/messages" && <MessageBadge count={messageUnreadCount} />}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
