"use client";

import { MessageIcon, OrderIcon, WishlistIcon } from "@/src/components/store/icons";
import { Button } from "@/src/components/store/ui/button";
import { Button as UiButton } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import MessageBadge from "@/src/components/messages/MessageBadge";
import { cn } from "@/src/lib/utils";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

const links: { Icon: FC; title: string; link: string }[] = [
  { Icon: OrderIcon, title: "My Orders", link: "/profile/orders" },
  { Icon: MessageIcon, title: "Messages", link: "/profile/messages" },
  { Icon: WishlistIcon, title: "WishList", link: "/profile/wishlist" },
];

const extraLinks = [
  { title: "Profile", link: "/profile" },
  { title: "Settings", link: "/settings" },
  { title: "Become a Seller", link: "/become-a-seller" },
  { title: "Help Center", link: "/help-center" },
  { title: "Return & Refund Policy", link: "/refund-policy" },
  { title: "Legal & Privacy", link: "/legal-privacy" },
  { title: "Discounts & Offers", link: "/discounts-offers" },
  { title: "Order Dispute Resolution", link: "/dispute-resolution" },
  { title: "Report a Problem", link: "/report-problem" },
];

export default function UserMenuDropdown({
  isSignedIn,
  messageUnread = 0,
}: {
  isSignedIn: boolean;
  messageUnread?: number;
}) {
  return (
    <div
      className={cn(
        "hidden absolute top-full -left-20 z-[80] group-hover:block cursor-pointer",
        {
          "-left-[200px] lg:-left-[148px]": isSignedIn,
        }
      )}
    >
      <div className="relative left-2 mt-2 right-auto bottom-auto pt-2 text-primary p-0 text-sm">
        <div className="w-0 h-0 absolute left-[149px] top-0 right-24 !border-l-[10px] !border-l-transparent !border-r-[10px] !border-r-transparent !border-b-[10px] border-b-white" />
        <div className="rounded-3xl border border-white/20 bg-white text-sm text-main-primary shadow-2xl">
          <div className="w-[305px]">
            <div className="pt-5 px-6 pb-0">
              {isSignedIn ? (
                <div className="user-avatar flex flex-col items-center justify-center">
                  <UserButton />
                </div>
              ) : (
                <div className="space-y-1">
                  <Link href="/sign-in">
                    <Button>Sign in</Button>
                  </Link>
                  <Link
                    href="/sign-up"
                    className="h-10 text-sm hover:underline text-main-primary flex items-center justify-center cursor-pointer"
                  >
                    Register
                  </Link>
                </div>
              )}
              {isSignedIn && (
                <div className="mx-1 my-4">
                  <SignOutButton>
                    <UiButton
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-center gap-2 rounded-xl border-border bg-base/80",
                        "text-sm font-semibold text-subtle shadow-sm",
                        "transition-colors duration-150",
                        "hover:border-red-200 hover:bg-red-50 hover:text-red-700",
                        "focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2"
                      )}
                    >
                      <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                      Sign out
                    </UiButton>
                  </SignOutButton>
                </div>
              )}
              <Separator />
            </div>
            <div className="max-w-[calc(100vh-180px)] bg-white text-main-secondary overflow-y-auto overflow-x-hidden pt-0 px-2 pb-4">
              <ul className="grid grid-cols-3 gap-2 py-2.5 px-4 w-full">
                {links.map(({ Icon, title, link }) => (
                  <li key={title} className="grid place-items-center">
                    <Link href={link} className="relative space-y-2">
                      {link === "/profile/messages" && messageUnread > 0 && (
                        <span className="absolute -right-1 -top-1 z-10">
                          <MessageBadge count={messageUnread} />
                        </span>
                      )}
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-base p-2 hover:bg-base">
                        <span className="text-subtle">
                          <Icon />
                        </span>
                      </div>
                      <span className="block text-xs">{title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Separator className="!max-w-[257px] mx-auto" />
              <ul className="pt-2.5 pr-4 pb-1 pl-4 w-[288px]">
                {extraLinks.map((item, i) => (
                  <li key={i}>
                    <Link href={item.link} legacyBehavior>
                      <a className="block text-sm text-main-primary py-1.5 hover:underline">
                        {item.title}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
